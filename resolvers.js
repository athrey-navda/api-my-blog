const BlogPost = require("./models/BlogPost");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const otps = {};
const otpExpiry = {};
const secret = process.env.JWT_SECRET || "supersecret";
const adminEmail = "navdaathreynavada@gmail.com";
const adminPassword = uuidv4();
console.log(`Admin UUID password: ${adminPassword}`);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILID,
    pass: process.env.PASSWORD,
  },
});
console.log("Email ID:", process.env.EMAILID);
console.log("Email Password:", process.env.PASSWORD);

const resolvers = {
  Query: {
    getBlogPosts: async () => {
      return await BlogPost.find();
    },
    getBlogPostById: async (parent, { id }) => {
      return await BlogPost.findById(id);
    },
  },
  Mutation: {
    sendOTP: async (parent, { email }) => {
      const otp = Math.floor(100000 + Math.random() * 900000);
      otps[email] = otp;
      otpExpiry[email] = Date.now() + 300000;

      const mailOptions = {
        from: "athreyblog@gmail.com",
        to: email,
        subject: "Your OTP for Comment Verification",
        text: `Your OTP is: ${otp}`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`);
      return { message: "OTP sent" };
    },

    verifyOTP: async (parent, { postId, email, otp, author, content }) => {
      const currentTime = Date.now();
      const storedOtp = String(otps[email]);
      const providedOtp = String(otp).trim();

      if (otps[email] && otpExpiry[email] > currentTime) {
        if (storedOtp === providedOtp) {
          const post = await BlogPost.findById(postId);
          if (!post) {
            throw new Error("Post not found");
          }

          const newComment = {
            content,
            author,
            email,
            date: new Date().toISOString(),
          };

          post.comments.push(newComment);
          await post.save();

          delete otps[email];
          delete otpExpiry[email];

          console.log(`OTP verified, comment added for ${email}`);
          return { message: "Comment added" };
        } else {
          console.log("Invalid OTP provided");
          throw new Error("Invalid OTP");
        }
      } else {
        console.log("OTP has expired or does not exist");
        throw new Error("OTP has expired or does not exist");
      }
    },

    addBlogPost: async (parent, { title, content, author }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const newBlogPost = new BlogPost({
        title,
        content,
        author,
        date: new Date().toISOString(),
        comments: [],
      });

      await newBlogPost.save();
      return newBlogPost;
    },

    login: async (parent, { email, password }) => {
      if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign({ email }, secret, { expiresIn: "1h" });
        return { token, message: "Login successful" };
      }
      throw new Error("Invalid credentials");
    },
  },
};

module.exports = resolvers;
