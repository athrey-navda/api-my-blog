const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config(); // Add this line to load .env file

// Import schema and resolvers
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const app = express();
app.use(express.json());

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server and apply middleware
const startServer = async () => {
  await server.start(); // Start Apollo Server
  server.applyMiddleware({ app }); // Apply Apollo middleware

  // Use environment variables for PORT and MongoDB connection
  const PORT = process.env.PORT || 4000;
  const MONGODB_URI = process.env.MONGODB_URI;

  console.log("MongoDB URI: ", MONGODB_URI); // Check if URI is being set

  // Connect to MongoDB
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server ready at http://localhost:${PORT}${server.graphqlPath}`
        );
      });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
};

// Start the server
startServer();
