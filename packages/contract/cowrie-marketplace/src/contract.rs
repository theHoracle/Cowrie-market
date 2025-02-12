use cw2::set_contract_version;

// Add these constants at the top of your file
const CONTRACT_NAME: &str = "crates.io:cowrie-marketplace";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Order, Response, StdResult,
    Uint128,
};

use crate::error::ContractError;
use crate::helpers::{only_owner, only_seller, process_payment, validate_payment};
use crate::msg::{
    ConfigResponse, ExecuteMsg, InstantiateMsg, ListingResponse, ListingsResponse, QueryMsg,
    UserListingsResponse,
};
use crate::state::{Config, Listing, ListingStatus, CONFIG, LISTINGS, USER_LISTINGS};

const DEFAULT_LIMIT: u32 = 10;
const MAX_LIMIT: u32 = 30;

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    // Add this line at the start of the function
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    if msg.commission_rate > 10000 {
        return Err(ContractError::InvalidCommissionRate(
            "Commission rate cannot exceed 100%".to_string(),
        ));
    }

    let config = Config {
        owner: info.sender.clone(),
        commission_rate: msg.commission_rate,
        listing_count: 0,
    };
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("commission_rate", msg.commission_rate.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(
    deps: DepsMut,
    _env: Env,
    _msg: MigrateMsg, // We'll add this to msg.rs
) -> Result<Response, ContractError> {
    let current_version = get_contract_version(deps.storage)?;

    if current_version.contract != CONTRACT_NAME {
        return Err(ContractError::CannotMigrate {
            previous_contract: current_version.contract,
        });
    }

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new()
        .add_attribute("previous_version", current_version.version)
        .add_attribute("new_version", CONTRACT_VERSION))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateListing {
            title,
            description,
            price,
            token_denom,
        } => execute_create_listing(deps, env, info, title, description, price, token_denom),
        ExecuteMsg::UpdateListing {
            listing_id,
            title,
            description,
            price,
        } => execute_update_listing(deps, env, info, listing_id, title, description, price),
        ExecuteMsg::CancelListing { listing_id } => execute_cancel_listing(deps, info, listing_id),
        ExecuteMsg::BuyItem { listing_id } => execute_buy_item(deps, env, info, listing_id),
        ExecuteMsg::UpdateConfig { commission_rate } => {
            execute_update_config(deps, info, commission_rate)
        }
    }
}

pub fn execute_create_listing(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    title: String,
    description: String,
    price: Uint128,
    token_denom: String,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;
    let listing_id = config.listing_count + 1;

    let listing = Listing {
        id: listing_id,
        seller: info.sender.clone(),
        title,
        description,
        price,
        token_denom,
        status: ListingStatus::Active,
        created_at: env.block.time.seconds(),
        updated_at: None,
    };

    LISTINGS.save(deps.storage, listing_id, &listing)?;
    USER_LISTINGS.save(deps.storage, (info.sender, listing_id), &true)?;

    config.listing_count = listing_id;
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "create_listing")
        .add_attribute("listing_id", listing_id.to_string())
        .add_attribute("seller", info.sender))
}

pub fn execute_buy_item(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    listing_id: u64,
) -> Result<Response, ContractError> {
    let listing = LISTINGS.load(deps.storage, listing_id)?;

    if listing.status != ListingStatus::Active {
        return Err(ContractError::ListingNotActive {});
    }

    validate_payment(&info.funds, &listing.token_denom, listing.price)?;

    let payment = info
        .funds
        .iter()
        .find(|coin| coin.denom == listing.token_denom)
        .unwrap();

    let bank_messages = process_payment(deps, &listing, payment)?;

    let mut listing = listing;
    listing.status = ListingStatus::Sold;
    listing.updated_at = Some(env.block.time.seconds());
    LISTINGS.save(deps.storage, listing_id, &listing)?;

    Ok(Response::new()
        .add_messages(bank_messages)
        .add_attribute("method", "buy_item")
        .add_attribute("listing_id", listing_id.to_string())
        .add_attribute("buyer", info.sender)
        .add_attribute("price", payment.amount))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => to_binary(&query_config(deps)?),
        QueryMsg::GetListing { listing_id } => to_binary(&query_listing(deps, listing_id)?),
        QueryMsg::GetListings {
            start_after,
            limit,
            status,
        } => to_binary(&query_listings(deps, start_after, limit, status)?),
        QueryMsg::GetUserListings {
            seller,
            start_after,
            limit,
        } => to_binary(&query_user_listings(deps, seller, start_after, limit)?),
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        owner: config.owner.to_string(),
        commission_rate: config.commission_rate,
        listing_count: config.listing_count,
    })
}

fn query_listings(
    deps: Deps,
    start_after: Option<u64>,
    limit: Option<u32>,
    status: Option<ListingStatus>,
) -> StdResult<ListingsResponse> {
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
    let start = start_after.map(|s| Bound::exclusive(s));

    let listings: StdResult<Vec<Listing>> = LISTINGS
        .range(deps.storage, start, None, Order::Ascending)
        .filter(|item| {
            if let Ok((_, listing)) = item {
                if let Some(ref s) = status {
                    return listing.status == *s;
                }
                return true;
            }
            false
        })
        .take(limit)
        .map(|item| item.map(|(_, listing)| listing))
        .collect();

    Ok(ListingsResponse {
        listings: listings?,
    })
}
