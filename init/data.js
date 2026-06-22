const sampleExpenses = [
  // 💰 INCOME
  {
    title: "Monthly Salary",
    amount: 50000,
    type: "income",
    category: "salary",
    date: new Date("2026-02-28")
  },
  {
    title: "Freelance Project",
    amount: 12000,
    type: "income",
    category: "freelance",
    date: new Date("2026-03-10")
  },
  {
    title: "Stock Profit",
    amount: 3500,
    type: "income",
    category: "investment",
    date: new Date("2026-04-05")
  },

  // 💸 EXPENSES
  {
    title: "Rent",
    amount: 12000,
    type: "expense",
    category: "rent",
    date: new Date("2026-02-01")
  },
  {
    title: "Groceries",
    amount: 2600,
    type: "expense",
    category: "food",
    date: new Date("2026-02-14")
  },
  {
    title: "Electricity Bill",
    amount: 900,
    type: "expense",
    category: "utilities",
    date: new Date("2026-03-03")
  },
  {
    title: "Bus Pass",
    amount: 600,
    type: "expense",
    category: "transport",
    date: new Date("2026-03-18")
  },
  {
    title: "Movie Night",
    amount: 450,
    type: "expense",
    category: "entertainment",
    date: new Date("2026-03-25")
  },
  {
    title: "Online Course",
    amount: 1500,
    type: "expense",
    category: "education",
    date: new Date("2026-04-02")
  },
  {
    title: "Food Delivery",
    amount: 700,
    type: "expense",
    category: "food",
    date: new Date("2026-04-12")
  },
  {
    title: "Mobile Recharge",
    amount: 299,
    type: "expense",
    category: "utilities",
    date: new Date("2026-04-20")
  }
];

module.exports = { data: sampleExpenses };