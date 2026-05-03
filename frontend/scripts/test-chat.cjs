const { io } = require("socket.io-client");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
const AUCTION_ID = process.env.TEST_AUCTION_ID;

if (!EMAIL || !PASSWORD || !AUCTION_ID) {
  console.error("Missing TEST_EMAIL, TEST_PASSWORD, or TEST_AUCTION_ID.");
  process.exit(1);
}

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Login failed (${response.status}): ${body}`);
  }

  const rawCookie = response.headers.get("set-cookie");
  if (!rawCookie) {
    throw new Error("No auth cookie returned by login.");
  }

  return rawCookie;
}

async function start() {
  const rawCookie = await login();
  const socket = io(`${BASE_URL}/chat`, {
    extraHeaders: {
      Cookie: rawCookie,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(`connected ${socket.id}`);
    socket.emit("join_auction", { auctionId: AUCTION_ID });
  });

  socket.on("joined", (data) => {
    console.log("joined", data);
    socket.emit("send_message", {
      auctionId: AUCTION_ID,
      content: `chat test ${Date.now()}`,
    });
  });

  socket.on("message_sent", (data) => {
    console.log("message_sent", data);
    socket.close();
  });

  socket.on("new_message", (data) => {
    console.log("new_message", data);
  });

  socket.on("exception", (data) => {
    console.error("exception", data);
    socket.close();
    process.exitCode = 1;
  });

  socket.on("connect_error", (error) => {
    console.error("connect_error", error.message);
    process.exitCode = 1;
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
