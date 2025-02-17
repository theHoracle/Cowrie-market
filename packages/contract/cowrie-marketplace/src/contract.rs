use cw2::{get_contract_version, set_contract_version};
use cw_storage_plus::Bound;
// Add these constants at the top of your file
const CONTRACT_NAME: &str = "crates.io:cowrie-marketplace";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Order, Response,
    StdResult, Uint128,
};

use crate::error::ContractError;
use crate::helpers::{only_owner, process_payment, validate_payment};
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
pub fn migrate(deps: DepsMut, _env: Env, msg: MessageInfo) -> Result<Response, ContractError> {
    only_owner(&deps, &msg)?;

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
            image_url,
            token_denom,
        } => execute_create_listing(
            deps,
            env,
            info,
            title,
            description,
            image_url,
            price,
            token_denom,
        ),
        ExecuteMsg::UpdateListing {
            listing_id,
            title,
            description,
            image_url,
            price,
        } => execute_update_listing(
            deps,
            env,
            info,
            listing_id,
            title,
            image_url,
            description,
            price,
        ),
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
    image_url: String,
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
        image_url,
        description,
        price,
        token_denom,
        status: ListingStatus::Active,
        created_at: env.block.time.seconds(),
        updated_at: None,
    };

    LISTINGS.save(deps.storage, listing_id, &listing)?;
    USER_LISTINGS.save(deps.storage, (info.sender.clone(), listing_id), &true)?;

    config.listing_count = listing_id;
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "create_listing")
        .add_attribute("listing_id", listing_id.to_string())
        .add_attribute("seller", &info.sender))
}

pub fn execute_buy_item(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
    listing_id: u64,
) -> Result<Response, ContractError> {
    let listing = LISTINGS.load(deps.storage, listing_id)?;

    if listing.status != ListingStatus::Active {
        return Err(ContractError::ListingNotActive {});
    }

    // prevent seller from buying own item
    if info.sender == listing.seller {
        return Err(ContractError::CannotBuyOwnListing {});
    }

    validate_payment(&info.funds, &listing.token_denom, listing.price)?;

    let payment = info
        .funds
        .iter()
        .find(|coin| coin.denom == listing.token_denom)
        .unwrap();

    // Pass deps by reference
    let bank_messages = process_payment(deps.branch(), &listing, payment)?;

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

// Add these functions to your contract.rs

pub fn execute_update_listing(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    listing_id: u64,
    title: Option<String>,
    description: Option<String>,
    image_url: Option<String>,
    price: Option<Uint128>,
) -> Result<Response, ContractError> {
    let mut listing = LISTINGS.load(deps.storage, listing_id)?;

    // Check if caller is the seller
    if info.sender != listing.seller {
        return Err(ContractError::Unauthorized {});
    }

    // Check if listing can be modified
    if listing.status != ListingStatus::Active {
        return Err(ContractError::CannotModifyInactiveListing {});
    }

    // Update fields if provided
    if let Some(new_title) = title {
        listing.title = new_title;
    }
    if let Some(new_description) = description {
        listing.description = new_description;
    }

    if let Some(new_image_url) = image_url {
        listing.image_url = new_image_url;
    }

    if let Some(new_price) = price {
        listing.price = new_price;
    }

    listing.updated_at = Some(env.block.time.seconds());
    LISTINGS.save(deps.storage, listing_id, &listing)?;

    Ok(Response::new()
        .add_attribute("method", "update_listing")
        .add_attribute("listing_id", listing_id.to_string()))
}

pub fn execute_cancel_listing(
    deps: DepsMut,
    info: MessageInfo,
    listing_id: u64,
) -> Result<Response, ContractError> {
    let mut listing = LISTINGS.load(deps.storage, listing_id)?;

    // Check if caller is the seller
    if info.sender != listing.seller {
        return Err(ContractError::Unauthorized {});
    }

    // Check if listing can be cancelled
    if listing.status != ListingStatus::Active {
        return Err(ContractError::CannotModifyInactiveListing {});
    }

    // Update listing status
    listing.status = ListingStatus::Cancelled;
    LISTINGS.save(deps.storage, listing_id, &listing)?;

    Ok(Response::new()
        .add_attribute("method", "cancel_listing")
        .add_attribute("listing_id", listing_id.to_string()))
}

pub fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    commission_rate: Option<u64>,
) -> Result<Response, ContractError> {
    // Load and check if sender is contract owner
    let mut config = CONFIG.load(deps.storage)?;
    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    // Update commission rate if provided
    if let Some(new_rate) = commission_rate {
        // Validate new commission rate (can't exceed 100%)
        if new_rate > 10000 {
            return Err(ContractError::InvalidCommissionRate(
                "Commission rate cannot exceed 100%".to_string(),
            ));
        }
        config.commission_rate = new_rate;
    }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "update_config")
        .add_attribute("commission_rate", config.commission_rate.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => to_json_binary(&query_config(deps)?),
        QueryMsg::GetListing { listing_id } => to_json_binary(&query_listing(deps, listing_id)?),
        QueryMsg::GetListings {
            start_after,
            limit,
            status,
        } => to_json_binary(&query_listings(deps, start_after, limit, status)?),
        QueryMsg::GetUserListings {
            seller,
            start_after,
            limit,
        } => to_json_binary(&query_user_listings(deps, seller, start_after, limit)?),
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

fn query_listing(deps: Deps, listing_id: u64) -> StdResult<ListingResponse> {
    let listing = LISTINGS.load(deps.storage, listing_id)?;

    Ok(ListingResponse { listing })
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

fn query_user_listings(
    deps: Deps,
    seller: String,
    start_after: Option<u64>,
    limit: Option<u32>,
) -> StdResult<UserListingsResponse> {
    // Validate seller address
    let seller_addr = deps.api.addr_validate(&seller)?;

    // Set up pagination
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
    let start = start_after.map(|s| Bound::exclusive(s));

    // Get all listings IDs for this user
    let user_listings: Vec<Listing> = LISTINGS
        .range(deps.storage, start, None, Order::Ascending)
        .filter(|item| {
            if let Ok((_, listing)) = item {
                return listing.seller == seller_addr;
            }
            false
        })
        .take(limit)
        .map(|item| item.map(|(_, listing)| listing))
        .collect::<StdResult<Vec<_>>>()?;

    Ok(UserListingsResponse {
        listings: user_listings,
    })
}
