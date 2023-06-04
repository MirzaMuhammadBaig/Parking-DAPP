# Design Patterns Used

## Access Control Design Patterns

`Ownable` design pattern is used to restrict calling some functions (`withdraw`, `changeZonePrice`) only to the owner of the contract.

## Inheritance and Interfaces

`Parking` contract inherits the OpenZeppelin `Ownable` and `Pausable` contracts to enable ownership for an admin and add a possibility to pause the contract if needed (for example on special occasions when parking is free).
