import express from 'express';
import allPost, { DeletePost, getPostOfFollwingUser, likeAndUnlike, updatePostCaption }  from '../controllers/postController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { viewMyProfile } from '../controllers/userController.js';
const router = express.Router();

router.post('/post/upload',isAuthenticated, allPost)
router.get('/post/like/:id',isAuthenticated, likeAndUnlike)
router.delete('/post/delete/:id',isAuthenticated, DeletePost)
router.get('/post/followingUserPosts',isAuthenticated, getPostOfFollwingUser)
router.post('/post/updatePost/:id',isAuthenticated, updatePostCaption)
router.get('/post/viewProfile',isAuthenticated, viewMyProfile)

export default router
