import express from 'express';
import {
  logOutUser,
  loginUser,
  registerUser,
} from '../Controllers/authController';
import authMidleware from '../Middleware/authMiddleware';
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').delete(authMidleware, logOutUser);

export default router;
