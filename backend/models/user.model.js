import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
firstname:{
    type:String,
    required:true
},
lastname:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true,
    minlength:6
},
gender:{
    type:String,
    required:true,
    enum:["male","female"]
},
email:{
    type:String,
    required:true,
    unique:true,
    match: /.+\@.+\..+/ // للتحقق من صحة البريد الإلكتروني 
},
phonenumber:{
    type:Number,
    required:true,
    unique:true,
},
resetPasswordToken: {
    type: String,
    required: false,
},
resetPasswordExpires: {
    type: Date,
    required: false,
}

},{timestamps:true});

const User = mongoose.model("User", userSchema);

export default User;