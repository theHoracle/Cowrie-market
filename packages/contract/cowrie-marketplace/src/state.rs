use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub owner: Addr,
    pub commission_rate: u64, // Basis points (e.g., 250 = 2.50%)
    pub listing_count: u64,
}

#[cw_serde]
pub struct Listing {
    pub id: u64,
    pub seller: Addr,
    pub title: String,
    pub image_url: String,
    pub description: String,
    pub price: Uint128,
    pub token_denom: String,
    pub status: ListingStatus,
    pub created_at: u64,
    pub updated_at: Option<u64>,
}

#[cw_serde]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

// Storage keys
pub const CONFIG: Item<Config> = Item::new("config");
pub const LISTINGS: Map<u64, Listing> = Map::new("listings");
pub const USER_LISTINGS: Map<(Addr, u64), bool> = Map::new("user_listings");
