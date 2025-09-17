# QuizCraftArena Smart Contract

A decentralized quiz gaming platform built on Conflux eSpace that enables players to create and join quiz lobbies with entry fees and prize distribution through smart contracts.

## 🎯 Overview

QuizCraftArena is a blockchain-based quiz gaming platform that allows users to create competitive quiz lobbies where players can join with entry fees and compete for prize pools. The platform ensures fair gameplay, transparent prize distribution, and secure fund management through smart contract automation.

## ✨ Key Features

- **Lobby System**: Create and manage quiz lobbies with customizable parameters
- **Entry Fees**: Players pay entry fees to join lobbies, contributing to prize pools
- **Prize Distribution**: Automatic and secure prize distribution to winners
- **Player Management**: Support for 2-10 players per lobby
- **Timeout Protection**: 5-minute lobby timeout to ensure fair gameplay
- **Security**: Built with OpenZeppelin security standards
- **Transparency**: All transactions and events are recorded on-chain

## 🏗️ Contract Architecture

### Core Components

- **Lobby Management**: Create, join, and manage quiz lobbies
- **Prize System**: Secure prize pool management and distribution
- **Player Verification**: Ensure only legitimate players can participate
- **Status Tracking**: Real-time lobby status updates
- **Event Logging**: Comprehensive event emission for transparency

### Data Structures

```solidity
struct Lobby {
    uint256 id;
    string name;
    string category;
    uint256 entryFee;
    uint256 playerCount;
    uint256 maxPlayers;
    uint256 prizePool;
    uint256 createdAt;
    LobbyStatus status;
    DistributionStatus distribution;
    address[] players;
    address winner;
    address creator;
}
```

### Enums

- **LobbyStatus**: `OPEN`, `STARTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **DistributionStatus**: `NOT_DISTRIBUTED`, `DISTRIBUTED`

## 🔧 Functions

### Core Functions

- `createLobby()`: Create a new quiz lobby
- `joinLobby()`: Join an existing lobby with entry fee
- `executeWinnerPayout()`: Distribute prize to winner (creator only)

### View Functions

- `getPlayersInLobby()`: Get list of players in a lobby
- `isPlayerInLobby()`: Check if a player is in a specific lobby
- `getLobbyResult()`: Get lobby results and winner information

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **Input Validation**: Comprehensive parameter validation
- **Access Control**: Only lobby creators can execute payouts
- **Direct ETH Rejection**: Prevents accidental fund loss

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hardhat
- Conflux eSpace account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd QuizDapp/SamrtContract
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Compile the contract
```bash
npx hardhat compile
```

### Testing

Run the comprehensive test suite:
```bash
npm test
# or
yarn test
```

Run the demo test runner:
```bash
npm run test:demo
# or
yarn test:demo
```

### Deployment

Deploy to Conflux eSpace:
```bash
npm run deploy
# or
yarn deploy
```

Deploy to local Hardhat network:
```bash
npm run deploy:local
# or
yarn deploy:local
```

## 📊 Test Results

The smart contract includes 26 comprehensive test cases covering:

- ✅ Deployment and initialization
- ✅ Lobby creation and validation
- ✅ Player joining and status updates
- ✅ Winner payout execution
- ✅ View function accuracy
- ✅ Security and access control
- ✅ Edge cases and error handling

**Test Status**: 26 passing (666ms)

## 🔍 Usage Examples

### Creating a Lobby

```javascript
const tx = await quizCraftArena.createLobby(
    "Crypto Knowledge Quiz",
    "Blockchain",
    ethers.utils.parseEther("0.1"), // 0.1 ETH entry fee
    4 // Maximum 4 players
);
```

### Joining a Lobby

```javascript
const tx = await quizCraftArena.joinLobby(0, {
    value: ethers.utils.parseEther("0.1") // Entry fee
});
```

### Executing Winner Payout

```javascript
const tx = await quizCraftArena.executeWinnerPayout(
    0, // Lobby ID
    winnerAddress // Winner's address
);
```

## 📋 Contract Specifications

- **Solidity Version**: ^0.8.10
- **Network**: Conflux eSpace
- **License**: MIT
- **Dependencies**: OpenZeppelin Contracts v4.9.3

## 🔗 Events

The contract emits the following events for transparency:

- `LobbyCreated`: When a new lobby is created
- `PlayerJoined`: When a player joins a lobby
- `LobbyCompleted`: When a lobby is completed and prize is distributed
- `LobbyCancelled`: When a lobby is cancelled
- `ScoresSubmitted`: When scores are submitted (for future use)
- `LeaderboardSet`: When leaderboard is set (for future use)

## ⚠️ Important Notes

- Lobby timeout is set to 5 minutes
- Maximum players per lobby: 10
- Minimum players per lobby: 2
- Entry fee must be greater than 0
- Only lobby creators can execute winner payouts
- Creators cannot join their own lobbies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for the Conflux ecosystem**
