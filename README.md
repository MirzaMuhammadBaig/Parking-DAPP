# Parking App

The project contains two parts. First one is a solidity contract that handles all of the logic and state of the parking ticket purchases. The second part is a frontend app that allows different types of users to interact with a parking contract (buy tickets, withdraw funds, verify bought tickets...).

## Features

1. Users can buy parking tickets for selected plate number for selected amount of time
2. Owner can set/change price per minute and per area
3. Controllers can check if vehicle with a plate number has bought a parking ticket in desired zone
4. Users can claim back funds for the paid time that was unused (for 90% of funds left)
5. Users can transfer valid parking ticket between different plate numbers
6. Owner can withdraw funds

## Project structure

The project is split into two folders ([hardhat](hardhat) and [frontend](frontend)). Hardhat folder contains the contract and everything needed to test, compile and deploy the contract. Frontend folder contains the React app that allows interacting with the deployed contract. Each of the folders contain README with instructions to install dependencies and run the project.

```
.
└── project/
    ├── frontend/
    │   ├── public/ (HTML page with root element and support files)
    │   ├── src/ (folder with React app)
    │   ├── .env.example (example environment file)
    │   ├── README.md
    │   └── ...
    ├── hardhat/
    │   ├── contracts/ (folder with contracts)
    │   ├── deploy/ (folder with files needed for deploying contract)
    │   ├── test/ (folder with files needed for testing contract)
    │   ├── .env.example (example environment file)
    │   ├── README.md
    │   └── ...
    ├── deployed_addresses.txt
    ├── design_pattern_decisions.md
    ├── avoiding_common_attacks.md
    └── README.md
```

## Frontend app URL

https://super-voice-9814.on.fleek.co/

## Screencast link

https://www.youtube.com/watch?v=yQ9OrATkuqg

## Other

> My public ETH address for certification (NFT): 0xCb1E63be3e892126eED1345831720759435c9066
