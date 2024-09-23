import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  awatar: {
    public_id: String,
    url: String,
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
resetPasswordToken:String,
resetPasswordTokenExpiration:Date

});

userSchema.pre("save", async function (next) {
  if (this.isModified(("password"))) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
};

userSchema.methods.getResetPasswordToken=function(){
  const resetToken=crypto.randomBytes(20).toString('hex')
  console.log(resetToken); // generate token
  this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex') // hash this token 
  this.resetPasswordTokenExpiration=Date.now()+10*60*1000
  return resetToken
}
export default mongoose.model("User", userSchema);
