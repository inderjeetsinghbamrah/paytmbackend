const mongoose = require("mongoose");
require("dotenv").config();
// const { mongoURL } = require("./config");
//console.log(mongoURL);

// console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: String,
  password: String,
  firstname: String,
  lastname: String,
});

const accountSchema= Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance:{
        type: Number,
        required:true
    }
})

const User = mongoose.model("User", userSchema);
const Account= mongoose.model("Account",accountSchema);

module.exports = { User,Account };
