const { io } = require("socket.io-client");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
const AUCTION_ID = process.env.TEST_AUCTION_ID;
const AMOUNT = Number(process.env.TEST_BID_AMOUNT || "25");

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
  const socket = io(`${BASE_URL}/auctions`, {
    extraHeaders: {
      Cookie: rawCookie,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(`connected ${socket.id}`);
    socket.emit("joinAuction", { auctionId: AUCTION_ID }, (data) => {
      console.log("joinAuction ack", data);
      socket.emit("placeBid", { auctionId: AUCTION_ID, amount: AMOUNT }, (ack) => {
        console.log("placeBid ack", ack);
      });
    });
  });

  socket.on("bidUpdated", (data) => {
    console.log("bidUpdated", data);
    socket.close();
  });

  socket.on("connect_error", (error) => {
    console.error("connect_error", error.message);
    process.exitCode = 1;
  });

  socket.on("disconnect", (reason) => {
    if (reason !== "io client disconnect") {
      console.error("disconnect", reason);
    }
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
