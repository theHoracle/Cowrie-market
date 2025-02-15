use crate::state::{Listing, ListingStatus};
use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;

#[cw_serde]
pub struct InstantiateMsg {
    pub commission_rate: u64,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateListing {
        title: String,
        description: String,
        price: Uint128,
        token_denom: String,
    },
    UpdateListing {
        listing_id: u64,
        title: Option<String>,
        description: Option<String>,
        price: Option<Uint128>,
    },
    CancelListing {
        listing_id: u64,
    },
    BuyItem {
        listing_id: u64,
    },
    UpdateConfig {
        commission_rate: Option<u64>,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ConfigResponse)]
    GetConfig {},
    #[returns(ListingResponse)]
    GetListing { listing_id: u64 },
    #[returns(ListingsResponse)]
    GetListings {
        start_after: Option<u64>,
        limit: Option<u32>,
        status: Option<ListingStatus>,
    },
    #[returns(UserListingsResponse)]
    GetUserListings {
        seller: String,
        start_after: Option<u64>,
        limit: Option<u32>,
    },
}

#[cw_serde]
pub struct ConfigResponse {
    pub owner: String,
    pub commission_rate: u64,
    pub listing_count: u64,
}

#[cw_serde]
pub struct ListingResponse {
    pub listing: Listing,
}

#[cw_serde]
pub struct ListingsResponse {
    pub listings: Vec<Listing>,
}

#[cw_serde]
pub struct UserListingsResponse {
    pub listings: Vec<Listing>,
}
