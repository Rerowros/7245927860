// generateSession.js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

// Put your API ID and Hash here.
// It's okay to have them here just for this one-time script.
const apiId = 0; // <-- REPLACE WITH YOUR REAL API ID
const apiHash = "0"; // <-- REPLACE WITH YOUR REAL API HASH

(async () => {
  console.log("Starting script to generate Telegram session string...");
  const stringSession = new StringSession(""); // Start with an empty session

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your phone number (e.g., +1234567890): "),
    password: async () => await input.text("Please enter your 2FA password (if you have one): "),
    phoneCode: async () => await input.text("Please enter the code you received from Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("\n✅ You are now logged in.");
  console.log("Your session string is:");

  // The session string is now filled, and we can save it.
  // It will look like a long string of random characters.
  console.log(client.session.save());

  console.log("\n📋 Copy the entire string above and paste it into your .env.local file as TELEGRAM_SESSION.");
  await client.disconnect();
})();