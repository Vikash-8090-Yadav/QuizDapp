const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("QuizCraftArena", function () {
  let quizCraftArena;
  let owner;
  let player1;
  let player2;
  let player3;
  let player4;
  let player5;
  let players;

  beforeEach(async function () {
    [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
    players = [player1, player2, player3, player4, player5];

    const QuizCraftArena = await ethers.getContractFactory("QuizCraftArena");
    quizCraftArena = await QuizCraftArena.deploy();
    await quizCraftArena.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await quizCraftArena.owner()).to.equal(owner.address);
    });

    it("Should initialize with nextLobbyId as 0", async function () {
      expect(await quizCraftArena.nextLobbyId()).to.equal(0);
    });

    it("Should have correct LOBBY_TIMEOUT", async function () {
      expect(await quizCraftArena.LOBBY_TIMEOUT()).to.equal(5 * 60); // 5 minutes in seconds
    });
  });

  describe("Lobby Creation", function () {
    it("Should create a lobby successfully", async function () {
      const tx = await quizCraftArena.createLobby(
        "Test Quiz",
        "General Knowledge",
        ethers.utils.parseEther("0.1"),
        4
      );

      await expect(tx)
        .to.emit(quizCraftArena, "LobbyCreated")
        .withArgs(0, "Test Quiz", "General Knowledge", ethers.utils.parseEther("0.1"), 4, owner.address);

      const lobby = await quizCraftArena.lobbies(0);
      expect(lobby.id).to.equal(0);
      expect(lobby.name).to.equal("Test Quiz");
      expect(lobby.category).to.equal("General Knowledge");
      expect(lobby.entryFee).to.equal(ethers.utils.parseEther("0.1"));
      expect(lobby.maxPlayers).to.equal(4);
      expect(lobby.status).to.equal(0); // OPEN
      expect(lobby.creator).to.equal(owner.address);
    });

    it("Should increment nextLobbyId after creation", async function () {
      expect(await quizCraftArena.nextLobbyId()).to.equal(0);
      
      await quizCraftArena.createLobby("Quiz 1", "Category 1", ethers.utils.parseEther("0.1"), 3);
      expect(await quizCraftArena.nextLobbyId()).to.equal(1);
      
      await quizCraftArena.createLobby("Quiz 2", "Category 2", ethers.utils.parseEther("0.2"), 5);
      expect(await quizCraftArena.nextLobbyId()).to.equal(2);
    });

    it("Should reject empty lobby name", async function () {
      await expect(
        quizCraftArena.createLobby("", "Category", ethers.utils.parseEther("0.1"), 3)
      ).to.be.revertedWith("Lobby name cannot be empty");
    });

    it("Should reject empty category", async function () {
      await expect(
        quizCraftArena.createLobby("Quiz Name", "", ethers.utils.parseEther("0.1"), 3)
      ).to.be.revertedWith("Category cannot be empty");
    });

    it("Should reject zero entry fee", async function () {
      await expect(
        quizCraftArena.createLobby("Quiz Name", "Category", 0, 3)
      ).to.be.revertedWith("Entry fee must be greater than 0");
    });

    it("Should reject invalid max players (1 or >10)", async function () {
      await expect(
        quizCraftArena.createLobby("Quiz Name", "Category", ethers.utils.parseEther("0.1"), 1)
      ).to.be.revertedWith("Invalid max players");

      await expect(
        quizCraftArena.createLobby("Quiz Name", "Category", ethers.utils.parseEther("0.1"), 11)
      ).to.be.revertedWith("Invalid max players");
    });
  });

  describe("Player Joining", function () {
    let lobbyId;
    const entryFee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
      await quizCraftArena.createLobby("Test Quiz", "General Knowledge", entryFee, 4);
      lobbyId = 0;
    });

    it("Should allow player to join lobby", async function () {
      const tx = await quizCraftArena.connect(player1).joinLobby(lobbyId, { value: entryFee });
      
      await expect(tx)
        .to.emit(quizCraftArena, "PlayerJoined")
        .withArgs(lobbyId, player1.address);

      const lobby = await quizCraftArena.lobbies(lobbyId);
      expect(lobby.playerCount).to.equal(1);
      expect(lobby.prizePool).to.equal(entryFee);
      expect(await quizCraftArena.isPlayerInLobby(lobbyId, player1.address)).to.be.true;
    });

    it("Should update lobby status to STARTED when first player joins", async function () {
      await quizCraftArena.connect(player1).joinLobby(lobbyId, { value: entryFee });
      
      const lobby = await quizCraftArena.lobbies(lobbyId);
      expect(lobby.status).to.equal(1); // STARTED
    });

    it("Should update lobby status to IN_PROGRESS when max players join", async function () {
      // Join with 4 players (max players)
      for (let i = 0; i < 4; i++) {
        await quizCraftArena.connect(players[i]).joinLobby(lobbyId, { value: entryFee });
      }
      
      const lobby = await quizCraftArena.lobbies(lobbyId);
      expect(lobby.status).to.equal(2); // IN_PROGRESS
    });

    it("Should reject joining with incorrect entry fee", async function () {
      const wrongFee = ethers.utils.parseEther("0.05");
      await expect(
        quizCraftArena.connect(player1).joinLobby(lobbyId, { value: wrongFee })
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should reject joining when lobby is full", async function () {
      // Fill the lobby
      for (let i = 0; i < 4; i++) {
        await quizCraftArena.connect(players[i]).joinLobby(lobbyId, { value: entryFee });
      }

      // Try to join when full
      await expect(
        quizCraftArena.connect(player5).joinLobby(lobbyId, { value: entryFee })
      ).to.be.revertedWith("Lobby full");
    });

    it("Should reject creator joining their own lobby", async function () {
      // Create a lobby first
      await quizCraftArena.createLobby("Test Quiz", "General Knowledge", entryFee, 4);
      const lobbyId = 0;
      
      await expect(
        quizCraftArena.joinLobby(lobbyId, { value: entryFee })
      ).to.be.revertedWith("Creator cannot join this lobby");
    });

    it("Should reject joining non-existent lobby", async function () {
      await expect(
        quizCraftArena.connect(player1).joinLobby(999, { value: entryFee })
      ).to.be.revertedWith("Lobby does not exist");
    });
  });

  describe("Winner Payout", function () {
    let lobbyId;
    const entryFee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
      await quizCraftArena.createLobby("Test Quiz", "General Knowledge", entryFee, 3);
      lobbyId = 0;
      
      // Join with 3 players
      for (let i = 0; i < 3; i++) {
        await quizCraftArena.connect(players[i]).joinLobby(lobbyId, { value: entryFee });
      }
    });

    it("Should execute winner payout successfully", async function () {
      const winner = player1.address;
      const initialBalance = await ethers.provider.getBalance(winner);
      
      const tx = await quizCraftArena.executeWinnerPayout(lobbyId, winner);
      
      await expect(tx)
        .to.emit(quizCraftArena, "LobbyCompleted")
        .withArgs(lobbyId, winner, entryFee.mul(3));

      const finalBalance = await ethers.provider.getBalance(winner);
      expect(finalBalance).to.be.gt(initialBalance);

      const lobby = await quizCraftArena.lobbies(lobbyId);
      expect(lobby.status).to.equal(3); // COMPLETED
      expect(lobby.winner).to.equal(winner);
      expect(lobby.distribution).to.equal(1); // DISTRIBUTED
    });

    it("Should reject payout by non-creator", async function () {
      await expect(
        quizCraftArena.connect(player1).executeWinnerPayout(lobbyId, player1.address)
      ).to.be.revertedWith("Only lobby creator can execute this");
    });

    it("Should reject payout for non-player winner", async function () {
      await expect(
        quizCraftArena.executeWinnerPayout(lobbyId, player5.address)
      ).to.be.revertedWith("Winner not in this lobby");
    });

    it("Should reject double payout", async function () {
      await quizCraftArena.executeWinnerPayout(lobbyId, player1.address);
      
      await expect(
        quizCraftArena.executeWinnerPayout(lobbyId, player2.address)
      ).to.be.revertedWith("Already distributed");
    });
  });

  describe("View Functions", function () {
    let lobbyId;
    const entryFee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
      await quizCraftArena.createLobby("Test Quiz", "General Knowledge", entryFee, 3);
      lobbyId = 0;
    });

    it("Should return correct players in lobby", async function () {
      await quizCraftArena.connect(player1).joinLobby(lobbyId, { value: entryFee });
      await quizCraftArena.connect(player2).joinLobby(lobbyId, { value: entryFee });

      const playersInLobby = await quizCraftArena.getPlayersInLobby(lobbyId);
      expect(playersInLobby).to.have.lengthOf(2);
      expect(playersInLobby[0]).to.equal(player1.address);
      expect(playersInLobby[1]).to.equal(player2.address);
    });

    it("Should check if player is in lobby correctly", async function () {
      await quizCraftArena.connect(player1).joinLobby(lobbyId, { value: entryFee });
      
      expect(await quizCraftArena.isPlayerInLobby(lobbyId, player1.address)).to.be.true;
      expect(await quizCraftArena.isPlayerInLobby(lobbyId, player2.address)).to.be.false;
    });

    it("Should return lobby result after completion", async function () {
      // Join players and complete lobby
      for (let i = 0; i < 3; i++) {
        await quizCraftArena.connect(players[i]).joinLobby(lobbyId, { value: entryFee });
      }
      
      await quizCraftArena.executeWinnerPayout(lobbyId, player1.address);
      
      const [status, winner, prize] = await quizCraftArena.getLobbyResult(lobbyId);
      expect(status).to.equal(3); // COMPLETED
      expect(winner).to.equal(player1.address);
      expect(prize).to.equal(0); // Prize already distributed
    });
  });

  describe("Admin Functions", function () {
    it("Should reject direct ETH sends", async function () {
      await expect(
        player1.sendTransaction({
          to: quizCraftArena.address,
          value: ethers.utils.parseEther("1.0")
        })
      ).to.be.revertedWith("Do not send ETH directly");
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle lobby timeout correctly", async function () {
      await quizCraftArena.createLobby("Test Quiz", "General Knowledge", ethers.utils.parseEther("0.1"), 3);
      const lobbyId = 0;
      
      // Fast forward time past lobby timeout
      await ethers.provider.send("evm_increaseTime", [6 * 60]); // 6 minutes
      await ethers.provider.send("evm_mine");
      
      await expect(
        quizCraftArena.connect(player1).joinLobby(lobbyId, { value: ethers.utils.parseEther("0.1") })
      ).to.be.revertedWith("Lobby expired");
    });

    it("Should handle multiple lobby creation", async function () {
      await quizCraftArena.createLobby("Quiz 1", "Category 1", ethers.utils.parseEther("0.1"), 3);
      await quizCraftArena.createLobby("Quiz 2", "Category 2", ethers.utils.parseEther("0.2"), 4);
      await quizCraftArena.createLobby("Quiz 3", "Category 3", ethers.utils.parseEther("0.3"), 5);
      
      expect(await quizCraftArena.nextLobbyId()).to.equal(3);
      
      // Verify each lobby has correct data
      const lobby1 = await quizCraftArena.lobbies(0);
      const lobby2 = await quizCraftArena.lobbies(1);
      const lobby3 = await quizCraftArena.lobbies(2);
      
      expect(lobby1.name).to.equal("Quiz 1");
      expect(lobby2.entryFee).to.equal(ethers.utils.parseEther("0.2"));
      expect(lobby3.maxPlayers).to.equal(5);
    });
  });
});
