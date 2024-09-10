const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const app = express();
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  mongoose
    .connect("mongodb://localhost:27017/blogposts")
    .then(() => {
      app.listen({ port: 4000 }, () => {
        console.log(
          `Server ready at http://localhost:4000${server.graphqlPath}`
        );
      });
    })
    .catch((err) => console.error(err));
};

startServer();
