const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'admins'
    },
    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    expiresAt:{
        type:Date,
        rquired:true
    }
})

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;