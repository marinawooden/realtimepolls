/**
 * @author: Marina Wooden
 * @date: 01-18-2023
 * @description: This is the server-side code for the
 * realtime polling application, which allows users to
 * store data about polls including creating new polls
 * and votes on specific polls.
 */
"use strict";

// necessary modules
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, child, set as firebaseSet, get as firebaseGet} from "firebase/database";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

// initialize app
const app = express();

// load in .env data
dotenv.config();

// support post parameters
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());
// cookies (to track if they've voted or not)
app.use(cookieParser())
// cors.  bad.  Idk a better way though.
// app.use(cors())

// constants
const SERVER_ERROR_MSG = 'There was an error on the server!  Please try again.';
const PARAMS_ERROR_MSG = 'There was an issue with your parameters.  Make sure they were all provided and have valid values!';
const NO_DATABASE_MSG = 'No database with that id was found';
const INVALID_VOTE = 'Invalid vote index';
const ALREADY_VOTED = "You've already voted in that poll!";

// initialize firebase options
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "realtime-polls-fa56a.firebaseapp.com",
  databaseURL: "https://realtime-polls-fa56a-default-rtdb.firebaseio.com",
  projectId: "realtime-polls-fa56a",
  storageBucket: "realtime-polls-fa56a.appspot.com",
  messagingSenderId: "395601830980",
  appId: "1:395601830980:web:5ed49a714870c60d8fc811",
  measurementId: "G-0JV5LSCF8Y"
};

// Initialize Firebase
const firebase = initializeApp(FIREBASE_CONFIG);

// const analytics = getAnalytics(firebase);

/** 
 * Testing endpoint that I can visit to
 * make sure everything's okay
 */
app.get('/hello', (req, res) => {
  res.type('text').send('Hello World!');
});

// Gets data for a certain poll
app.get('/poll/:id', async (req, res) => {
  try {
    const db = getDatabase(firebase);
    const pollInfoRef = ref(db, `polls`);
    const pollInfo = await firebaseGet(child(pollInfoRef, req.params["id"]));

    // check if it's a valid poll id
    if (pollInfo.exists()) {
      res.json(pollInfo.val());
    } else {
      res.type('text').status(404).send(NO_DATABASE_MSG);
    }
  } catch (err) {
    console.error(err);
    res.type('text').status(500).send(SERVER_ERROR_MSG);
  }
});

// create a poll endpoint
app.post('/poll/new', (req, res) => {
  // response type same for all
  res.type('text');

  const requiredParams = [
    "type",
    "question",
    "answers"
  ]

  const validValues = {
    "type": ["bar"]
  }

  // check params
  if (checkParams(req.body, requiredParams) && areValidParams(req.body, validValues)) {
    // all good case - create db
    let databaseId = crypto.randomBytes(12).toString('hex');

    const db = getDatabase(firebase);
    firebaseSet(ref(db, 'polls/' + databaseId), {
      type: req.body["type"],
      question: req.body["question"],
      answers: req.body["answers"].split(',').map((ans) => ans.trim()),
      votes: []
    });

    res.send(databaseId);
  } else {
    // invalid params
    res.status(400).send(PARAMS_ERROR_MSG)
  }
});

// vote on a poll endpoint
app.post('/poll/:pollid/vote', async (req, res) => {
  try {
    if (!hasVoted(req.cookies["pollsVoted"], req.params["pollid"])) {
      const requiredParams = ["vote"];

      if (checkParams(req.body, requiredParams)) {
        const db = getDatabase(firebase);
        const pollInfoRef = ref(db, `polls`);
        const pollInfo = await firebaseGet(child(pollInfoRef, req.params["pollid"]));

        // check if it's a valid poll id
        if (pollInfo.exists()) {
          const pollInfoVal = pollInfo.val()
          // check if vote is out of range
          const newPollInfo = {
            ...pollInfoVal,
            "votes": [...(pollInfoVal["votes"] || []), req.body["vote"]]
          }

          firebaseSet(
            ref(db, 'polls/' + req.params["pollid"]),
            newPollInfo
          );
  
          // get voted polls 
          let votedPolls = req.cookies["pollsVoted"] || [];
          votedPolls.push(req.params["pollid"]);

          res.cookie('pollsVoted', votedPolls, { maxAge: 900000, httpOnly: true });
          res.type('text').send("Success!");
        } else {
          // database with given id does not exist
          res.type('text').status(404).send(NO_DATABASE_MSG);
        }
      } else {
        // params (answer) not provided
        res.type('text').status(400).send(PARAMS_ERROR_MSG);
      }
    } else {
      res.type('text').status(401).send(ALREADY_VOTED);
    }
  } catch (err) {
    console.error(err);
    res.type('text').status(500).send(SERVER_ERROR_MSG);
  }
});

/**
 * Given a list of polls the user has already voted in and a poll id, determines
 * if a user has already voted in a given poll
 * @param {Array} pollsVoted - list of ids that the user has already voted in
 * @param {String} pollId - the id of the poll to check
 * @returns 
 */
function hasVoted(pollsVoted, pollId) {
  console.log(pollsVoted)
  return pollsVoted?.includes(pollId);
}

/**
 * Helper function, checks if all params match valid
 * values
 */
function areValidParams(givenData, validValues) {
  for (const paramName of Object.keys(validValues)) {
    if (!validValues[paramName].includes(givenData[paramName])) {
      return false;
    }
  }

  return true;
}

/**
 * Helper function, checks if all params are specified
 */
function checkParams(givenData, requiredParams) {
  for (const paramName of requiredParams) {
    if (!givenData[paramName]) {
      return false
    }
  }

  return true
}

app.use(express.static('client/dist'))
// module.exports = app;

export default app;