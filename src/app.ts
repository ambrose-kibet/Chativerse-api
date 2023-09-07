import express from 'express';
require('dotenv').config();
require('express-async-errors'); // wraps handlers in try catch blocks
const app = express();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import cors from 'cors';
import connectDB from './DB/connect';
import notFoundMiddleware from './Middleware/notFoundMiddleware';
import errorHandlerMiddleware from './Middleware/errorHandlerMiddleware';
import authMidleware from './Middleware/authMiddleware';
import authRouter from './Routers/authRouter';
import chatRouter from './Routers/chatRouter';
import userRouter from './Routers/userRouter';
import messageRouter from './Routers/messageRouter';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
app.set('trust proxy', true); // so as to use req.ip
app.use(morgan('tiny')); //logs the endpoint
app.use(cookieParser(process.env.JWT_SECRET)); //sign cookies
app.use(express.json()); // acess req.body
app.use(expressFileUpload({ useTempFiles: true })); // acess req.file
app.use(express.urlencoded({ extended: true })); //req.params
app.use(
  cors({
    origin: 'http://localhost:5173', //whitelist frontend clients
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello from server' });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chats', authMidleware, chatRouter);
app.use('/api/v1/users', authMidleware, userRouter);
app.use('/api/v1/messages', authMidleware, messageRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const start = () => {
  try {
    connectDB(process.env.MONGO_URL!);
    app.listen(PORT, () => console.log(`server is listening port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
