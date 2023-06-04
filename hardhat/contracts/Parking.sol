// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Parking contract
/// @author Amadej Pevec
/// @notice A contract that allows buying/canceling/transfering parking tickets and verify if tickets are valid. Owner can withdraw funds.
contract Parking is Ownable, Pausable {
    enum ParkingZone {
        A,
        B,
        C
    }

    struct ParkingTicket {
        uint256 expirationTime;
        address buyer;
        ParkingZone zone;
    }

    mapping(ParkingZone => uint256) public zonePricePerMinute;
    mapping(string => ParkingTicket) private parkingTickets;

    event LogTicketBought(
        string indexed plate,
        uint256 numOfMinutes,
        ParkingZone zone
    );
    event LogTicketRenewed(
        string indexed plate,
        uint256 numOfMinutes,
        ParkingZone zone
    );
    event LogTicketCanceled(string indexed plate, uint256 balanceLeft);
    event LogTicketTransfered(string indexed oldPlate, string newPlate);
    event LogZonePriceChanged(uint256 price, ParkingZone zone);

    /// @notice Check if owner of a ticket is trying to modify it
    /// @param plate The plate of a car that bought a ticket
    modifier isBuyer(string memory plate) {
        require(
            msg.sender == parkingTickets[plate].buyer,
            "Only ticket owner can modify it"
        );
        _;
    }

    constructor() {
        zonePricePerMinute[ParkingZone.A] = 0.00002 ether;
        zonePricePerMinute[ParkingZone.B] = 0.000015 ether;
        zonePricePerMinute[ParkingZone.C] = 0.00001 ether;
    }

    /// @notice Function that allows buying parking ticket or extending an existing one. Can be called if the contract is not paused.
    /// @param plate The plate of a car
    /// @param numOfMinutes The duration of a parking ticket (in minutes)
    /// @param zone The zone in which a user parked a car (one from ParkingZone enum)
    function buyTicket(
        string memory plate,
        uint256 numOfMinutes,
        ParkingZone zone
    ) external payable whenNotPaused {
        require(
            numOfMinutes * zonePricePerMinute[zone] <= msg.value,
            "Amount is not sufficient"
        );

        ParkingTicket storage ticket = parkingTickets[plate];
        uint256 duration = numOfMinutes * 1 minutes;

        // if ticket not expired yet, then extend it
        if (ticket.expirationTime > block.timestamp) {
            require(
                ticket.zone == zone,
                "You are trying to renew ticket for other parking zone"
            );
            ticket.expirationTime = ticket.expirationTime + duration;
            emit LogTicketRenewed(plate, numOfMinutes, zone);
        } else {
            uint256 expiration = block.timestamp + duration;
            parkingTickets[plate] = ParkingTicket(expiration, msg.sender, zone);
            emit LogTicketBought(plate, numOfMinutes, zone);
        }
    }

    /// @notice Function to change the parking price of a zone. Can be called by contract owner only.
    /// @param price Price per minute
    /// @param zone The zone for which owner want to set a price (one from ParkingZone enum)
    function changeZonePrice(uint256 price, ParkingZone zone)
        external
        onlyOwner
    {
        zonePricePerMinute[zone] = price;
        emit LogZonePriceChanged(price, zone);
    }

    /// @notice Check if ticket is valid based on the plate and zone
    /// @param plate The plate of a car
    /// @param zone The zone in which the car is parked
    /// @return bool - Return ticket validity
    function isTicketValid(string memory plate, ParkingZone zone)
        public
        view
        returns (bool)
    {
        return
            parkingTickets[plate].zone == zone &&
            parkingTickets[plate].expirationTime > block.timestamp;
    }

    /// @notice Get ticket information
    /// @param plate The plate of a car
    /// @return tuple(Ticket expiration time, zone)
    function getTicket(string memory plate)
        external
        view
        returns (uint256, ParkingZone)
    {
        return (
            parkingTickets[plate].expirationTime,
            parkingTickets[plate].zone
        );
    }

    /// @notice Function to cancel ticket and get back remaining funds. Can be called by ticket owner only.
    /// @dev User get back only 90% of remaining funds
    /// @param plate The plate of a car
    function cancelTicket(string memory plate) external isBuyer(plate) {
        ParkingTicket storage ticket = parkingTickets[plate];
        require(
            ticket.expirationTime > block.timestamp,
            "The ticket has already expired"
        );

        uint256 minsLeft = (ticket.expirationTime - block.timestamp) / 60;
        uint256 balanceLeft = (minsLeft * zonePricePerMinute[ticket.zone] * 9) /
            10; // get back 90% of funds
        delete parkingTickets[plate];
        (bool succeed, ) = msg.sender.call{value: balanceLeft}("");
        require(succeed, "Failed to return funds");
        emit LogTicketCanceled(plate, balanceLeft);
    }

    /// @notice Transfer ticket to other owner and car plate. Can be called by ticket owner only.
    /// @param oldPlate The plate user want to transfer
    /// @param newPlate Plate of a car where the ticket will be transfered to
    /// @param newOwner New owner of a ticket (address)
    function transferTicket(
        string memory oldPlate,
        string memory newPlate,
        address newOwner
    ) external isBuyer(oldPlate) {
        require(
            parkingTickets[newPlate].expirationTime <= block.timestamp,
            "You cannot transfer ticket to a plate with active subscription"
        );

        ParkingTicket storage old = parkingTickets[oldPlate];
        parkingTickets[newPlate] = ParkingTicket(
            old.expirationTime,
            newOwner,
            old.zone
        );
        delete parkingTickets[oldPlate];
        emit LogTicketTransfered(oldPlate, newPlate);
    }

    /// @notice Function to pause the contract. Can be called by contract owner only.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Function to unpause the contract. Can be called by contract owner only.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Function to withdraw ether from the contract. Can be called by contract owner only.
    /// @param value Amount of ether that user want to withdraw
    function withdraw(uint256 value) external onlyOwner {
        require(
            value <= address(this).balance,
            "Contract's balance too low to withdraw such amount"
        );
        (bool succeed, ) = msg.sender.call{value: value}("");
        require(succeed, "Failed to withdraw Ether");
    }
}
