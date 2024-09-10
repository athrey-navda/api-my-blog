// schema.js
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Comment {
    author: String!
    email: String!
    content: String!
    date: String!
  }

  type BlogPost {
    id: ID!
    title: String!
    content: String!
    author: String!
    date: String!
    comments: [Comment!]!
  }

  type Response {
    message: String!
  }

  type Query {
    getBlogPosts: [BlogPost!]!
    getBlogPostById(id: ID!): BlogPost
  }

  type Mutation {
    sendOTP(email: String!): Response
    verifyOTP(
      postId: ID!
      email: String!
      otp: String!
      author: String!
      content: String!
    ): Response
    addBlogPost(title: String!, content: String!, author: String!): BlogPost!
  }
`;

module.exports = typeDefs;
