import User from "../model/userModel.js";
import Post from "../model/postModel.js";
import { sendEmail } from "../middleware/sendEmail.js";
import crypto from 'crypto'



// create user
const allUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    const newUser = new User({
      name,
      email,
      password,
      awatar: { public_id: "sample id", url: "sample url" },
    });
    await newUser.save();
    const token = newUser.generateToken();

    // Cookie options
    const options = {
      expires: new Date(Date.now() + 3600000 * 24), // 24 hours
      httpOnly: true,
    };
    res
      .status(201)
      .cookie("token", token, options)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = user.generateToken();

    const options = {
      expires: new Date(Date.now() + 3600000 * 24),
      httpOnly: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, message: "user login successfuly" });
    console.log("cookie created", token);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// update password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "old and new password are required" });
    }
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// update profile
export const updataProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email } = req.body;
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// viewMy profile
export const viewMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("post");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, posts: user.post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// logout
export const logoutUser = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({ success: true, message: "user logout successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// deleteMyProfile
export const deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const allfollowers = user.followers;
    const following = user.following;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find and delete all posts associated with the user
    await Post.deleteMany({ owner: user._id });

    // Remove the user from all followers' list
    for (let i = 0; i < allfollowers.length; i++) {
      const followers = await User.findById(allfollowers[i]);
      const index = followers.following.indexOf(user._id);
      followers.following.splice(index, 1);
      await followers.save();
    }

    // Remove the user from all following' list
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);
      const index = follows.followers.indexOf(user._id);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // Delete the user profile
    await User.findByIdAndDelete(req.user._id);
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.json({ success: true, message: "profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// forget password
export const forgotPassword=async(req, res)=>{
  try{
    const user=await User.findOne({email:req.body.email})
 
    if(!user){
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetPasswordToken=user.getResetPasswordToken();
    await user.save()

    const resetUrl=`${req.protocol}://${req.hostname}:3000/api/password/reset/${resetPasswordToken}`
    const message=`Click on the following link to reset your password: \n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    try{
    await sendEmail({email:user.email, subject:'Reset Password', message})
    res.json({ success: true, message: `email sent to ${user.email} successfully` });
    }catch(err){
      user.resetPasswordToken=undefined
      user.resetPasswordTokenExpiration=undefined
      await user.save()
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  }catch(e){
    res.status(500).json({ success: false, message: e.message });
  }
}



// reset password
export const resetPassword =async(req, res, next) => {
  try{

    const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({resetPasswordToken, resetPasswordTokenExpiration: {$gt:Date.now()}})

    if(!user){
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.password=req.body.password
    user.resetPasswordToken=undefined
    user.resetPasswordTokenExpiration=undefined
    await user.save()
    res.json({ success: true, message: 'Password reset successfully' });
  }catch(e){
    res.status(500).json({ success: false, message: e.message });
  }
}
export default allUser;
