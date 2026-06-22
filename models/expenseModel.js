const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenseSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    type: {
        type: String,
        enum: ["income", "expense"],
        required: true
    },

    category: {
        type: String,
        default: "general"
    },

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Expense",
    expenseSchema
);