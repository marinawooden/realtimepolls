'use strict';

import ws from 'ws';
import http from 'http';
import app from './http-server.js';
import { WebSocketServer } from 'ws';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, set as firebaseSet, get as firebaseGet, onValue, off} from "firebase/database";

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

const server = http.createServer();

// Create web socket server on top of a regular http server
const wss = new WebSocketServer({
  server: server
});

const NO_POLL_MSG = "Required parameter `poll` missing!";
const SERVER_ERROR_MSG = "An error occurred on the server.";
const INVALID_POLL_ID = "There is no poll with that id!";

// Also mount the app here
server.on('request', app);

wss.on('connection', async function connection(ws, req) {
  try {
    const dbId = req.url.match(/(?=poll\=).+/)?.[0]?.replace("poll=", "");
    if (!dbId) {
      ws.send(NO_POLL_MSG)
      ws.close()
    } else {
      const db = getDatabase(firebase);
      const pollRef = ref(db, 'polls/' + dbId);
      const poll = await firebaseGet(pollRef);

      console.log(dbId);

      if (poll?.exists()) {
        const listener = onValue(pollRef, (snapshot) => {
          const data = snapshot.val();
          ws.send(JSON.stringify(data));
        });
        
        // Handle WebSocket disconnection
        ws.on('close', function() {
          off(pollRef, listener)
        });

        // ws.on('message', function incoming(message) {
        //   console.log(`received: ${message}`);
          
        //   ws.send(JSON.stringify({
        //     answer: 42
        //   }));
        // });
      } else {
        ws.send(INVALID_POLL_ID)
        ws.close()
      }
    }
  } catch (err) {
    ws.send(`${SERVER_ERROR_MSG} ${err.message}`);
    ws.close()
  }
});


const PORT = process.env.PORT || 8000;

server.listen(PORT, function() {
  console.log(`http/ws server listening on ${PORT}`);
});