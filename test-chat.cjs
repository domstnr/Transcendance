const { io } = require("socket.io-client");

// --- 🛠️ VARIABLES À ADAPTER SELON TON PROJET ---
const LOGIN_URL = "http://localhost:3001/auth/login"; // La route de ton contrôleur Auth
const EMAIL = "test@test.com"; // Un email existant dans ta DB
const PASSWORD = "monSuperMotDePasse123"; // Son mot de passe
const AUCTION_ID = "xbox360"; // L'ID d'une enchère en statut "OPEN"

async function startTest() {
  console.log("1️⃣ Tentative de login HTTP...");
  
  // Étape 1 : On s'identifie pour récupérer le cookie
  const response = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }) // Ajuste si tu utilises "username" au lieu de "email"
  });

  if (!response.ok) {
    console.error("❌ Échec du login. As-tu bien mis les bons identifiants ?");
    return;
  }

  // Étape 2 : On extrait le cookie brut de la réponse HTTP
  const rawCookies = response.headers.get("set-cookie");
  if (!rawCookies) {
    console.error("❌ Aucun cookie reçu ! Vérifie que ton AuthController renvoie bien le cookie.");
    return;
  }
  console.log("✅ Login réussi, cookie capturé !");

  console.log("2️⃣ Connexion au ChatGateway (WebSocket)...");
  
  // Étape 3 : On connecte le WebSocket en forçant l'envoi du cookie
  const socket = io("http://localhost:3001/chat", {
    extraHeaders: {
      Cookie: rawCookies 
    }
  });

  // --- ÉCOUTE DES ÉVÉNEMENTS WEBSOCKET ---

  socket.on("connect", () => {
    console.log("🟢 WebSocket Connecté ! ID:", socket.id);
    
    console.log(`3️⃣ Demande pour rejoindre l'enchère : ${AUCTION_ID}`);
    socket.emit("join_auction", { auctionId: AUCTION_ID });
  });

  socket.on("joined", (data) => {
    console.log(`🏠 Succès : Entré dans la salle ${data.room}`);
    
    console.log("4️⃣ Envoi du message test...");
    socket.emit("send_message", {
      auctionId: AUCTION_ID,
      content: "Hello ! Ceci est un test depuis mon script Node.js 🤖"
    });
  });

  socket.on("message_sent", (res) => {
    console.log("✅ Accusé de réception du serveur. Message sauvegardé :");
    console.log(`   👉 "${res.message.content}"`);
    console.log("\n🏁 TEST TERMINÉ AVEC SUCCÈS ! (Tu peux faire Ctrl+C)");
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Erreur WebSocket (Refusé par le Guard ?) :", err.message);
  });
}

// On lance le test
startTest();