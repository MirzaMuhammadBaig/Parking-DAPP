// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Parking contract
 * @author Amadej Pevec
 * @notice A contract that allows buying/canceling/transferring parking tickets and verifying if tickets are valid.
 *         The owner can withdraw funds and update zone prices.
 */
contract Parking is Ownable, Pausable {
    enum ParkingZone {
        A1,
        A2,
        A3,
        B1,
        B2,
        B3,
        C1,
        C2,
        C3
    }

    struct ParkingTicket {
        uint256 expirationTime;
        address buyer;
        ParkingZone zone;
    }

    struct Member {
        string username;
        string licensePlate;
        address memberAddr;
        bool isRegistered;
    }

    mapping(ParkingZone => uint256) public zonePricePerMinuteForMember;
    mapping(ParkingZone => uint256) public zonePricePerMinuteForNonMember;
    mapping(string => ParkingTicket) private parkingTickets;
    mapping(ParkingZone => ParkingTicket) private checkZoneExpiration;
    mapping(address => Member) private memberDetails;
    mapping(address => bool) private members;

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
    event LogTicketTransferred(string indexed oldPlate, string newPlate);
    event LogMemberRegistered(
        address indexed member,
        string username,
        string licensePlate,
        address memberAddr,
        bool isRegistered
    );
    event LogMembershipRevoked(address member);
    event LogZonePriceChanged(
        uint256 priceForMember,
        uint256 priceForNonMember,
        ParkingZone zone
    );

    /**
     * @notice Modifier to check if the caller is the buyer of the ticket.
     * @param plate The plate of the car that bought the ticket.
     */
    modifier isBuyer(string memory plate) {
        require(
            msg.sender == parkingTickets[plate].buyer,
            "Only ticket owner can modify it"
        );
        _;
    }

    /**
     * @notice Constructor function that initializes zone prices.
     */
    constructor() {
        zonePricePerMinuteForMember[ParkingZone.A1] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.A2] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.A3] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.B1] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.B2] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.B3] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.C1] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.C2] = 0.1 ether;
        zonePricePerMinuteForMember[ParkingZone.C3] = 0.1 ether;

        zonePricePerMinuteForNonMember[ParkingZone.A1] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.A2] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.A3] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.B1] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.B2] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.B3] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.C1] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.C2] = 0.2 ether;
        zonePricePerMinuteForNonMember[ParkingZone.C3] = 0.2 ether;
    }

    /**
     * @notice Function to buy a parking ticket.
     * @param plate The license plate of the car.
     * @param numOfMinutes The number of minutes to park.
     * @param zone The parking zone.
     */
    function buyTicket(
        string memory plate,
        uint256 numOfMinutes,
        ParkingZone zone
    ) external payable whenNotPaused {
        require(
            numOfMinutes > 0,
            "Number of minutes must be greater than zero"
        );

        require(
            checkZoneExpiration[zone].expirationTime < block.timestamp,
            "Parking zone already booked by another user"
        );

        uint256 totalPrice;
        if (isMember(msg.sender)) {
            totalPrice = numOfMinutes * zonePricePerMinuteForMember[zone];
        } else {
            totalPrice = numOfMinutes * zonePricePerMinuteForNonMember[zone];
        }

        require(msg.value >= totalPrice, "Insufficient funds");

        uint256 remainingAmount = msg.value - totalPrice;

        ParkingTicket storage zoneExpiration = checkZoneExpiration[zone];
        ParkingTicket storage ticket = parkingTickets[plate];
        uint256 duration = numOfMinutes * 1 minutes;

        // if ticket not expired yet, then extend it
        if (ticket.expirationTime > block.timestamp) {
            require(
                ticket.zone == zone,
                "You are trying to renew ticket for a different parking zone"
            );
            ticket.expirationTime += duration;
            zoneExpiration.expirationTime += duration;
            emit LogTicketRenewed(plate, numOfMinutes, zone);
        } else {
            uint256 expiration = block.timestamp + duration;
            parkingTickets[plate] = ParkingTicket(expiration, msg.sender, zone);
            zoneExpiration.expirationTime = expiration;
            emit LogTicketBought(plate, numOfMinutes, zone);
        }

        if (remainingAmount > 0) {
            payable(msg.sender).transfer(remainingAmount);
        }
    }

    /// @notice Check if ticket is valid based on the plate and zone
    /// @param plate The plate of a car
    /// @param zone The zone in which the car is parked
    /// @return bool - Return ticket validity
    function isTicketValid(
        string memory plate,
        ParkingZone zone
    ) public view returns (bool) {
        return
            parkingTickets[plate].zone == zone &&
            parkingTickets[plate].expirationTime > block.timestamp;
    }

    /// @notice Get ticket information
    /// @param plate The plate of a car
    /// @return tuple(Ticket expiration time, zone)
    function getTicket(
        string memory plate
    ) external view returns (uint256, ParkingZone) {
        return (
            parkingTickets[plate].expirationTime,
            parkingTickets[plate].zone
        );
    }

    /**
     * @notice Function to cancel a parking ticket.
     * @param plate The license plate of the car.
     */ function cancelTicket(string memory plate) external whenNotPaused {
        ParkingTicket storage ticket = parkingTickets[plate];
        require(
            ticket.expirationTime != 0,
            "No active ticket found for this plate"
        );

        uint256 refundAmount = 0;

        if (block.timestamp < ticket.expirationTime) {
            uint256 timeLeft = ticket.expirationTime - block.timestamp;
            uint256 pricePerMinute;
            if (isMember(ticket.buyer)) {
                pricePerMinute = zonePricePerMinuteForMember[ticket.zone];
            } else {
                pricePerMinute = zonePricePerMinuteForNonMember[ticket.zone];
            }
            refundAmount = (timeLeft / 1 minutes) * pricePerMinute;
        }

        uint256 fine = 0.001 ether;

        if (refundAmount > 0) {
            refundAmount -= fine;
        }

        require(refundAmount >= 0, "Refund amount cannot be negative");

        delete parkingTickets[plate];

        if (refundAmount > 0) {
            payable(ticket.buyer).transfer(refundAmount);
        }

        emit LogTicketCanceled(plate, refundAmount);
    }

    /**
     * @notice Function to transfer a parking ticket to a new license plate.
     * @param oldPlate The current license plate of the car.
     * @param newPlate The new license plate to transfer the ticket to.
     */

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
        emit LogTicketTransferred(oldPlate, newPlate);
    }

    function updateZonePriceForMember(
        uint256 newPrice,
        ParkingZone zone
    ) external onlyOwner {
        zonePricePerMinuteForMember[zone] = newPrice;
        emit LogZonePriceChanged(
            newPrice,
            zonePricePerMinuteForNonMember[zone],
            zone
        );
    }

    function updateZonePriceForNonMember(
        uint256 newPrice,
        ParkingZone zone
    ) external onlyOwner {
        zonePricePerMinuteForNonMember[zone] = newPrice;
        emit LogZonePriceChanged(
            zonePricePerMinuteForMember[zone],
            newPrice,
            zone
        );
    }

    /// @notice Function to register as a member.
    function registerMembership(
        string memory username,
        string memory licensePlate
    ) external {
        require(
            memberDetails[msg.sender].isRegistered == false &&
                !members[msg.sender],
            "Already a member"
        );
        members[msg.sender] = true;
        memberDetails[msg.sender] = Member(
            username,
            licensePlate,
            msg.sender,
            true
        );
        emit LogMemberRegistered(
            msg.sender,
            username,
            licensePlate,
            msg.sender,
            true
        );
    }

    /// @notice Function to revoke membership.
    function revokeMemberships() external {
        require(
            memberDetails[msg.sender].isRegistered == true &&
                members[msg.sender],
            "Already not member"
        );
        members[msg.sender] = false;
        delete members[msg.sender];
        delete memberDetails[msg.sender];
        emit LogMembershipRevoked(msg.sender);
    }

    function getMemberDetails(
        address member
    )
        external
        view
        returns (
            string memory username,
            string memory licensePlate,
            address memberAddr,
            bool isRegistered
        )
    {
        require(
            msg.sender == owner() || msg.sender == member,
            "You can't get any other person's detail"
        );

        require(
            members[member] && memberDetails[member].isRegistered,
            "Not a member"
        );
        Member memory memberInfo = memberDetails[member];
        return (
            memberInfo.username,
            memberInfo.licensePlate,
            memberInfo.memberAddr,
            memberInfo.isRegistered
        );
    }

    function isMember(address member) public view returns (bool) {
        require(
            msg.sender == owner() || msg.sender == member,
            "You can't get any other person's detail"
        );

        return members[member];
    }

    function zonePricePerMinute(
        ParkingZone zone
    )
        external
        view
        returns (uint256 priceForMember, uint256 priceForNonMember)
    {
        priceForMember = zonePricePerMinuteForMember[zone];
        priceForNonMember = zonePricePerMinuteForNonMember[zone];
    }

    function getZoneExpiration(
        ParkingZone zone
    ) external view returns (uint256) {
        if (checkZoneExpiration[zone].expirationTime > block.timestamp) {
            return checkZoneExpiration[zone].expirationTime;
        } else {
            return 0;
        }
    }

    /// @notice Function to pause the contract. Can be called by contract owner only.
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice Function to unpause the contract. Can be called by contract owner only.
    function unpause() external onlyOwner whenPaused {
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

    receive() external payable {}

}
