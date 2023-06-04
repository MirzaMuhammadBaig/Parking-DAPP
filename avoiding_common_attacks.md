# Avoiding Common Attacks

## SWC-104 (Unchecked Call Return Value)

The return value from a call to the ticket owner's address in `cancelTicket` is checked with `require` to ensure transaction rollback if call fails.

## SWC-105 (Unprotected Ether Withdrawal)

`withdraw` is protected with OpenZeppelin `Ownable`'s `onlyOwner` modifier.

## SWC-107 (Reentrancy)

Perform internal state change in `cancelTicket` before making the call.
