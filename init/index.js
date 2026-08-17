const mongoose = require("mongoose");
const initdata = require("./data.js");
const Expense = require("../models/expenseModel.js");

let MONGO_URL = "mongodb://127.0.0.1:27017/spentsmart";

main()
  .then(() => {
    console.log("Connection successful to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Expense.deleteMany({});
  await Expense.insertMany(initdata.data);
  console.log("Data was initialized");
};

initDB();