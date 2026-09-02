import express from 'express';
import dotenv from 'dotenv';
import {sequelize} from './src/config/database.js';
import router from './src/routes/resume.routes.js';
import './src/model/index.js';
import cors from 'cors';
dotenv.config ();
const app = express ();
const port = process.env.PORT || 9000;
  
app.use (cors ({origin: '*'}));

app.use (express.json ());

app.get ('/', (req, res) => {
  res.send ('Server is running');
});

app.use ('/api/v1', router);

const startServer = async () => {
  try {
    await sequelize.authenticate ();
    await sequelize.sync ({alter: true});
    console.log ('Database connected successfully');
    app.listen (port, () => {
      console.log (`server is running at port ${port}`);
    });
  } catch (error) {
    console.log ('Unable to connect to database', error);
  }
};

startServer ();
