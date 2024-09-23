import User from "../model/userModel.js";
import jwt from "jsonwebtoken";



export const isAuthenticated = async (req, res, next) => {
try{
const {token} = req.cookies;
  console.log('All cookies:', req.cookies);
  console.log("Token:", typeof token, token);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Login First please" });
  }

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  req.user = await User.findById(decoded._id);
  next();
}catch(err){
  return res.status(500).json({ success: false, message: err.message });
}
};


