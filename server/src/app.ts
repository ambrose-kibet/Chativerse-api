import express from 'express';
require('dotenv').config();
require('express-async-errors');
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import cors from 'cors';
import connectDB from './DB/connect';

const app = express();

app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(expressFileUpload());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello from server' });
});

const start = () => {
  try {
    connectDB(process.env.MONGO_URL!);
    app.listen(PORT, () => console.log(`server is listening port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
