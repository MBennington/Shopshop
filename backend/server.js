require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');

const { createDBConnection } = require('./src/services/db-connection.service');

const httpPort = process.env.HTTP_PORT || 5000;

// Connect to database
createDBConnection();

// Create express server
const server = express();

// Enable CORS with config
server.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// Body parser middleware
server.use(express.json());

server.use(express.urlencoded({ extended: true }));

// Load routes
server.use('/api', require('./routes'));

// Create http server
const httpServer = http.createServer(server);

// Start server
httpServer.listen(httpPort, () => {
  console.log(`HTTP server running on port: ${httpPort}`);
});

//module.exports = server;
