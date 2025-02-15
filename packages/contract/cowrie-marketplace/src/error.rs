use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Cannot buy own listing")]
    CannotBuyOwnListing {},

    #[error("Invalid commission rate: {0}")]
    InvalidCommissionRate(String),

    #[error("Listing not found")]
    ListingNotFound {},

    #[error("Listing is not active")]
    ListingNotActive {},

    #[error("Invalid price")]
    InvalidPrice {},

    #[error("Invalid payment")]
    InvalidPayment {},

    #[error("Insufficient funds")]
    InsufficientFunds {},

    #[error("Cannot modify sold or cancelled listing")]
    CannotModifyInactiveListing {},

    #[error("Custom Error val: {val:?}")]
    CustomError { val: String },

    #[error("Cannot migrate from different contract: {previous_contract}")]
    CannotMigrate { previous_contract: String },
}
