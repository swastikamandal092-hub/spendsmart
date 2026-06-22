const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    balance: {
        type: Number,
        default: 0
    },

    income: {
        type: Number,
        default: 0
    },

    expenditure: {
        type: Number,
        default: 0
    }
});

// Adds username + password hashing automatically
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);