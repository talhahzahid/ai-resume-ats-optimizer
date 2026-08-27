import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./src/config/database.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 9000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`server is running at port ${port}`);
    });
  } catch (error) {
    console.log("Unable to connect to database", error);
  }
};

startServer();
