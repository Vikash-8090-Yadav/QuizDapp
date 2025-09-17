const { ethers } = require("hardhat");

async function runDemo() {
  console.log("🎮 QuizCraftArena Demo Starting...\n");
  
  // Get signers
  const [owner, player1, player2, player3, player4] = await ethers.getSigners();
  console.log("👥 Players:");
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Player1: ${player1.address}`);
  console.log(`   Player2: ${player2.address}`);
  console.log(`   Player3: ${player3.address}`);
  console.log(`   Player4: ${player4.address}\n`);

  // Deploy contract
  console.log("📦 Deploying QuizCraftArena contract...");
  const QuizCraftArena = await ethers.getContractFactory("QuizCraftArena");
  const quizCraftArena = await QuizCraftArena.deploy();
  await quizCraftArena.deployed();
  console.log(`✅ Contract deployed at: ${quizCraftArena.address}\n`);

  // Create multiple lobbies
  console.log("🏗️  Creating lobbies...");
  
  const entryFee1 = ethers.utils.parseEther("0.1");
  const entryFee2 = ethers.utils.parseEther("0.2");
  const entryFee3 = ethers.utils.parseEther("0.05");

  // Lobby 1: General Knowledge Quiz
  const tx1 = await quizCraftArena.createLobby(
    "General Knowledge Quiz",
    "Education",
    entryFee1,
    4
  );
  await tx1.wait();
  console.log("✅ Created: General Knowledge Quiz (4 players, 0.1 ETH entry)");

  // Lobby 2: Crypto Quiz
  const tx2 = await quizCraftArena.createLobby(
    "Crypto & Blockchain Quiz",
    "Technology",
    entryFee2,
    3
  );
  await tx2.wait();
  console.log("✅ Created: Crypto & Blockchain Quiz (3 players, 0.2 ETH entry)");

  // Lobby 3: Quick Quiz
  const tx3 = await quizCraftArena.createLobby(
    "Quick Math Quiz",
    "Mathematics",
    entryFee3,
    2
  );
  await tx3.wait();
  console.log("✅ Created: Quick Math Quiz (2 players, 0.05 ETH entry)\n");

  // Show lobby status
  console.log("📊 Lobby Status:");
  for (let i = 0; i < 3; i++) {
    const lobby = await quizCraftArena.lobbies(i);
    console.log(`   Lobby ${i}: ${lobby.name} - Status: ${lobby.status} (${lobby.playerCount}/${lobby.maxPlayers} players)`);
  }
  console.log();

  // Players join lobbies
  console.log("🎯 Players joining lobbies...");
  
  // Lobby 0: 4 players join
  console.log("   Joining General Knowledge Quiz...");
  await quizCraftArena.connect(player1).joinLobby(0, { value: entryFee1 });
  console.log("   ✅ Player1 joined");
  
  await quizCraftArena.connect(player2).joinLobby(0, { value: entryFee1 });
  console.log("   ✅ Player2 joined");
  
  await quizCraftArena.connect(player3).joinLobby(0, { value: entryFee1 });
  console.log("   ✅ Player3 joined");
  
  await quizCraftArena.connect(player4).joinLobby(0, { value: entryFee1 });
  console.log("   ✅ Player4 joined - Lobby is now IN_PROGRESS!");

  // Lobby 1: 3 players join (fill it)
  console.log("\n   Joining Crypto & Blockchain Quiz...");
  await quizCraftArena.connect(player1).joinLobby(1, { value: entryFee2 });
  console.log("   ✅ Player1 joined");
  
  await quizCraftArena.connect(player2).joinLobby(1, { value: entryFee2 });
  console.log("   ✅ Player2 joined");
  
  await quizCraftArena.connect(player3).joinLobby(1, { value: entryFee2 });
  console.log("   ✅ Player3 joined - Lobby is now IN_PROGRESS!");

  // Lobby 2: 2 players join
  console.log("\n   Joining Quick Math Quiz...");
  await quizCraftArena.connect(player4).joinLobby(2, { value: entryFee3 });
  console.log("   ✅ Player4 joined");
  
  // We need another player for lobby 2, but we only have 5 players total
  // Let's create a new signer for this
  const [, , , , , player5] = await ethers.getSigners();
  await quizCraftArena.connect(player5).joinLobby(2, { value: entryFee3 });
  console.log("   ✅ Player5 joined - Lobby is now IN_PROGRESS!");

  // Show updated lobby status
  console.log("\n📊 Updated Lobby Status:");
  for (let i = 0; i < 3; i++) {
    const lobby = await quizCraftArena.lobbies(i);
    const statusNames = ["OPEN", "STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    console.log(`   Lobby ${i}: ${lobby.name}`);
    console.log(`     Status: ${statusNames[lobby.status]} (${lobby.playerCount}/${lobby.maxPlayers} players)`);
    console.log(`     Prize Pool: ${ethers.utils.formatEther(lobby.prizePool)} ETH`);
  }

  // Execute winner payouts
  console.log("\n🏆 Executing winner payouts...");
  
  // Lobby 0: Player1 wins
  console.log("   Lobby 0: Player1 wins!");
  const initialBalance1 = await ethers.provider.getBalance(player1.address);
  await quizCraftArena.executeWinnerPayout(0, player1.address);
  const finalBalance1 = await ethers.provider.getBalance(player1.address);
  const winnings1 = finalBalance1.sub(initialBalance1);
  console.log(`   ✅ Player1 received ${ethers.utils.formatEther(winnings1)} ETH`);

  // Lobby 1: Player2 wins
  console.log("   Lobby 1: Player2 wins!");
  const initialBalance2 = await ethers.provider.getBalance(player2.address);
  await quizCraftArena.executeWinnerPayout(1, player2.address);
  const finalBalance2 = await ethers.provider.getBalance(player2.address);
  const winnings2 = finalBalance2.sub(initialBalance2);
  console.log(`   ✅ Player2 received ${ethers.utils.formatEther(winnings2)} ETH`);

  // Lobby 2: Player4 wins
  console.log("   Lobby 2: Player4 wins!");
  const initialBalance4 = await ethers.provider.getBalance(player4.address);
  await quizCraftArena.executeWinnerPayout(2, player4.address);
  const finalBalance4 = await ethers.provider.getBalance(player4.address);
  const winnings4 = finalBalance4.sub(initialBalance4);
  console.log(`   ✅ Player4 received ${ethers.utils.formatEther(winnings4)} ETH`);

  // Final status
  console.log("\n📊 Final Lobby Status:");
  for (let i = 0; i < 3; i++) {
    const lobby = await quizCraftArena.lobbies(i);
    const statusNames = ["OPEN", "STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    console.log(`   Lobby ${i}: ${lobby.name}`);
    console.log(`     Status: ${statusNames[lobby.status]}`);
    console.log(`     Winner: ${lobby.winner}`);
    console.log(`     Prize Distributed: ${lobby.distribution === 1 ? "Yes" : "No"}`);
  }

  console.log("\n🎉 Demo completed successfully!");
  console.log("\n📝 Summary:");
  console.log("   • 3 lobbies created with different entry fees and player limits");
  console.log("   • Players successfully joined lobbies");
  console.log("   • Lobbies reached IN_PROGRESS status when full");
  console.log("   • Winners received their prize payouts");
  console.log("   • All lobbies marked as COMPLETED");
}

// Error handling
runDemo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });
