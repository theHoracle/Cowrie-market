use crate::error::ContractError;
use crate::state::{Listing, CONFIG};
use cosmwasm_std::{Addr, BankMsg, Coin, DepsMut, MessageInfo, StdResult, Uint128};

pub fn validate_payment(
    sent_funds: &[Coin],
    required_denom: &str,
    required_amount: Uint128,
) -> Result<(), ContractError> {
    let payment = sent_funds
        .iter()
        .find(|coin| coin.denom == required_denom)
        .ok_or(ContractError::InvalidPayment {})?;

    if payment.amount < required_amount {
        return Err(ContractError::InsufficientFunds {});
    }

    Ok(())
}

pub fn process_payment(
    deps: DepsMut,
    listing: &Listing,
    buyer_payment: &Coin,
) -> StdResult<Vec<BankMsg>> {
    let config = CONFIG.load(deps.storage)?;
    let commission_amount = calculate_commission(buyer_payment.amount, config.commission_rate);
    let seller_amount = buyer_payment.amount.checked_sub(commission_amount)?;

    let mut messages = vec![];

    // Send commission to contract owner
    if !commission_amount.is_zero() {
        messages.push(BankMsg::Send {
            to_address: config.owner.to_string(),
            amount: vec![Coin {
                denom: buyer_payment.denom.clone(),
                amount: commission_amount,
            }],
        });
    }

    // Send remaining amount to seller
    messages.push(BankMsg::Send {
        to_address: listing.seller.to_string(),
        amount: vec![Coin {
            denom: buyer_payment.denom.clone(),
            amount: seller_amount,
        }],
    });

    Ok(messages)
}

pub fn calculate_commission(amount: Uint128, commission_rate: u64) -> Uint128 {
    amount.multiply_ratio(commission_rate, 10000u64)
}

pub fn only_owner(deps: &DepsMut, info: &MessageInfo) -> Result<(), ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }
    Ok(())
}

pub fn only_seller(listing: &Listing, sender: &Addr) -> Result<(), ContractError> {
    if listing.seller != *sender {
        return Err(ContractError::Unauthorized {});
    }
    Ok(())
}
