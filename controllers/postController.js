import Post from "../model/postModel.js";
import User from '../model/userModel.js'


//create post
const allPost = async (req, res) => {
  try {
const newPostData={
  caption:req.body.caption,
  image:{
    public_id: "req.body.image.public_id",
    url: "req.body.image.url",
  },
  owner: req.user._id,
}    
const newPost=await Post.create(newPostData)




const user= await User.findById(req.user._id)
    user.post.push(newPost._id)
    await user.save()
    res
      .status(201)
      .json({
        success: true,
        message: "Post created successfully",
        post: newPost,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// like and unlike
export const likeAndUnlike=async(req,res)=>{
  try{

    const post = await Post.findById(req.params.id) 
    if(!post){
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if(post.likes.includes(req.user._id)){
      const index = post.likes.indexOf(req.user._id)
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({success:true,message:'post is unliked'});
    }else{
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({success:true,message:'post is liked'});
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}



// delete post
export const DeletePost=async(req,res)=>{
  try{
    const post =await Post.findById(req.params.id)
    if(!post){
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if(post.owner.toString() !== req.user._id.toString()){
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    const user =await User.findById(req.user._id) //find current user
    const index=user.post.indexOf(req.params.id) 
    user.post.splice(index, 1);
    await user.save();
    res.json({ success: true, message: 'Post deleted' });
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}

// followUser 
export const followUser = async(req,res)=>{
  try{
    const followToUser= await User.findById(req.params.id) // find that user who the current user will be follow
    const loggedInUser=await User.findById(req.user._id) // find current user

    if(!loggedInUser){
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if(loggedInUser.following.includes(followToUser._id)){
      const follwingIndex= loggedInUser.following.indexOf(followToUser._id)
      loggedInUser.following.splice(follwingIndex, 1);

      const followerIndex=followToUser.followers.indexOf(loggedInUser._id);
      followToUser.followers.splice(followerIndex, 1);

      await loggedInUser.save()
      await followToUser.save()
      return res.status(200).json({success:true,message:'User unfollowed'});
    }else{


      loggedInUser.following.push(followToUser._id)
      followToUser.followers.push(loggedInUser._id)
  
      await loggedInUser.save()
      await followToUser.save()
      res.json({ success: true, message: 'User followed' });
    }
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}


// getPostOfFollwingUser
export const getPostOfFollwingUser = async(req, res) => {
  try{
 const user= await User.findById(req.user._id).populate("following","post")

 res.status(200).json({success:true,following:user.following})
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}


// updatePostCaption
export const updatePostCaption =async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id)
    if(!post){
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if(post.owner.toString()!== req.user._id.toString()){
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    post.caption=req.body.caption
    if(!req.body.caption){
      return res.status(400).json({ success: false, message: 'Caption is required' });
    }
    await post.save()
    return res.status(200).json({success:true,message:'Post caption updated'});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}




export default allPost;
