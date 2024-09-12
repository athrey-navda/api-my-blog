const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const app = express();
app.use(express.json());

const secret = process.env.JWT_SECRET || "supersecret";

const authenticate = (req) => {
  const token = req.headers.authorization || "";
  try {
    if (token) {
      const decoded = jwt.verify(token.replace("Bearer ", ""), secret);
      return { user: decoded };
    }
    return { user: null };
  } catch (err) {
    console.log("Authentication error", err);
    return { user: null };
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = authenticate(req);
    return user;
  },
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  const MONGODB_URI = process.env.MONGODB_URI;

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

startServer();
