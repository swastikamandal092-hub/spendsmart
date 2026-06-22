const Joi = require("joi");

module.exports.expenseSchema = Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().min(1).required(),
    type: Joi.string().valid("income", "expense").required(),
    category: Joi.string().default("general"),
    date: Joi.date()
});

module.exports.userSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .required(),

    name: Joi.string()
        .min(2)
        .required(),

    age: Joi.number()
        .min(1)
        .max(120)
        .required(),

    balance: Joi.number()
        .min(0)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(4)
        .required()
});