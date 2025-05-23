import mongoose, {Schema} from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
  {
    username:{
      type:String,
      required:[true,"Username is Required"],
      unique:true,
      lowercase:true,
      trim:true,
      index:true
    },
    email:{
      type:String,
      required:[true,"Email is Required"],
      unique:true,
      lowercase:true,
      trim:true,
    },
    fullName:{
      type:String,
      required:[true,"Full Name is Required"],
      trim:true,
      index:true,
    },
    avatar:{
      type:String, //cloudinary url
      required:[true,"Avatar is Required"],
    },
    coverImage:{
      type:string,
    },
    watchHistory:[
      {
        type: Schema.Types.ObjectId,
        ref:"Video"
      }
    ],
    password:{
      type:String,
      required:[true,"Password is required"],
    },
    refreshToken:{
      type:String,
    }
  },
  {
    timestamps:true
  }
)

userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  
  this.password = bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = async function(){
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_SECRET
    }
  )
}

export const User = mongoose.model("User",userSchema)
