const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true,"username is already taken"],
        required:true,
    },
    email:{
        type:String,
        unique:[true,"Account alreadt exist with this email address"],
        required:true,
    },
    password:{
        type:String,
        required:true
    }
})

const userModel = mongoose.model("user",userSchema)
module.exports = userModel