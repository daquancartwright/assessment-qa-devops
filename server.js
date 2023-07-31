const express = require("express");
const bots = require("./src/botsData");
const shuffle = require("./src/shuffle");
const path = require('path');

// Include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '403bd40fa7d34d2a960197565f9e545a',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Rollbar Initiated!')

const playerRecord = {
  wins: 0,
  losses: 0,
};

const app = express();

// Set up middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Add up the total health of all the robots
const calculateTotalHealth = (robots) =>
  robots.reduce((total, { health }) => total + health, 0);

// Add up the total damage of all the attacks of all the robots
const calculateTotalAttack = (robots) =>
  robots
    .map(({ attacks }) =>
      attacks.reduce((total, { damage }) => total + damage, 0)
    )
    .reduce((total, damage) => total + damage, 0);

// Calculate both players' health points after the attacks
const calculateHealthAfterAttack = ({ playerDuo, compDuo }) => {
  const compAttack = calculateTotalAttack(compDuo);
  const playerHealth = calculateTotalHealth(playerDuo);
  const playerAttack = calculateTotalAttack(playerDuo);
  const compHealth = calculateTotalHealth(compDuo);

  return {
    compHealth: compHealth - playerAttack,
    playerHealth: playerHealth - compAttack,
  };
};

app.get("/api/robots", (req, res) => {
  try {
    // Change the .send(botsArr) to .send(bots)
    res.status(200).send(bots);
  } catch (error) {
    console.error("ERROR GETTING BOTS", error);
    res.sendStatus(400);

    // Log the error with Rollbar
    rollbar.error(error);
  }
});

app.get("/api/robots/shuffled", (req, res) => {
  try {
    let shuffled = shuffle(bots);
    res.status(200).send(shuffled);
  } catch (error) {
    console.error("ERROR GETTING SHUFFLED BOTS", error);
    res.sendStatus(400);

    // Log the error with Rollbar
    rollbar.error(error);
  }
});

app.post("/api/duel", (req, res) => {
  try {
    const { compDuo, playerDuo } = req.body;

    const { compHealth, playerHealth } = calculateHealthAfterAttack({
      compDuo,
      playerDuo,
    });

    // Log that duel was entered
    rollbar.info('Dual Started', {
      compDuo: compDuo,
      playerDuo: playerDuo,
    });

    // comparing the total health to determine a winner
    if (compHealth > playerHealth) {
      playerRecord.losses += 1;
      res.status(200).send("You lost!");

      // Log that the duel was lost
      rollbar.info('Duel lost', {
        compHealth,
        playerHealth,
        playerRecord,
      });

    } else {
      // Bug Fix: Add to wins instead of losses
      playerRecord.wins += 1;
      res.status(200).send("You won!");

      // Log that the duel was won
      rollbar.info('Duel won', {
        compHealth,
        playerHealth,
        playerRecord,
      });
    }

  } catch (error) {
    console.log("ERROR DUELING", error);
    
    // Log a critical error
    rollbar.critical('Critical error', {
      error: error,
    });

    res.sendStatus(400);
  }
});

app.get("/api/player", (req, res) => {
  try {
    res.status(200).send(playerRecord);
  } catch (error) {
    console.log("ERROR GETTING PLAYER STATS", error);
    res.sendStatus(400);
  }
});

app.listen(8000, () => {
  console.log(`Listening on 8000`);
});
