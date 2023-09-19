import express from 'express';
require('dotenv').config();
require('express-async-errors'); // wraps handlers in try catch blocks
const app = express();
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import cors from 'cors';
import sanitizeUserInput from './Middleware/sanitizeMiddleware';
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
app.set('trust proxy', 1); // so as to use req.ip to acess ip address
app.use(
  cors({
    origin: 'http://localhost:5173', //whitelist frontend clients
    credentials: true,
  })
);
app.use(helmet()); // set security headers
app.use(mongoSanitize()); // sanitize user input
app.use(sanitizeUserInput); // sanitize user input prevent xss attacks
app.use(rateLimit({ windowMs: 60 * 1000, max: 45, legacyHeaders: false })); // limit requests

app.use(morgan('dev')); //logs the endpoint
app.use(cookieParser(process.env.JWT_SECRET)); //sign cookies
app.use(express.json()); // acess req.body
app.use(expressFileUpload({ useTempFiles: true })); // acess req.file
app.use(express.urlencoded({ extended: true })); //req.params

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chats', authMidleware, chatRouter);
app.use('/api/v1/users', authMidleware, userRouter);
app.use('/api/v1/messages', authMidleware, messageRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const server = http.createServer(app);
// socket io
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust this to match your frontend URL
    credentials: true,
  },
});
const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    // Notify all clients about the updated online users
    const onlineUserIds = Array.from(connectedUsers.keys());
    io.emit('updateOnlineUsers', onlineUserIds);
  });

  socket.on('sendMessage', (message) => {
    const receiverSocketId = connectedUsers.get(message.recipient);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit('getMessage', message);
    }
  });

  socket.on('leave', (userId) => {
    connectedUsers.delete(userId);
    // Notify all clients about the updated online users
    const onlineUserIds = Array.from(connectedUsers.keys());
    io.emit('updateOnlineUsers', onlineUserIds);
  });
  socket.on('disconnect', () => {
    connectedUsers.forEach((value, key) => {
      if (value === socket.id) {
        connectedUsers.delete(key);
      }
    });

    // Notify all clients about the updated online users
    const onlineUserIds = Array.from(connectedUsers.keys());
    io.emit('updateOnlineUsers', onlineUserIds);
    // remeber to clean up the connected users
  });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL!);
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
