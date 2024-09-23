import express from 'express';
import allUser, { deleteMyProfile, forgotPassword, Login, logoutUser, resetPassword, updataProfile, updatePassword }  from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { followUser } from '../controllers/postController.js';
const router = express.Router();

router.post('/user/register',allUser)
router.post('/user/login',Login)
router.get('/user/follow/:id',isAuthenticated,followUser)
router.get('/user/logout',logoutUser)
router.post('/user/updateProfile',isAuthenticated,updataProfile)
router.post('/user/updatePassword',isAuthenticated,updatePassword)
router.get('/user/deleteProfile',isAuthenticated,deleteMyProfile)
router.post('/user/forgetPassword',forgotPassword)
router.put('/password/reset/:token',resetPassword)

export default router
