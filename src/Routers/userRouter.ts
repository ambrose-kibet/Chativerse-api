import express from 'express';
const router = express.Router();
import {
  showMe,
  getContacts,
  updateUser,
  updateUserPassword,
  uploadImage,
} from '../Controllers/userController';

router.route('/').get(showMe).patch(updateUser);
router.get('/contacts', getContacts);
router.patch('/update-password', updateUserPassword);
router.post('/upload-image', uploadImage);

export default router;
