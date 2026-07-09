const express = require("express");
const app = express();
const port = 8080;

const Expense=require("./models/expenseModel.js");
const path=require("path")
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const mongoose = require('mongoose');
const wrapAsync=require('./util/wrapAsync.js');
const ExpressError=require("./util/expressError.js");
const { expenseSchema } = require("./schema.js");
const session=require("express-session");
const User=require("./models/user.js");
const passport=require("passport");
const Localstretagy=require("passport-local");
const { userSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/spentsmart";

app.engine('ejs', ejsMate);
app.set("view engine", "ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodoverride("_method"))
app.use(express.static(path.join(__dirname,"/public")))

main().then(res=>{
    console.log("Connection Sucessful to DB");
}).catch(err => 
    console.log(err)
);

async function main() {
  await mongoose.connect(MONGO_URL);
}
const sessionOption={
    secret:"mySecret",
    resave:false,
     saveUninitialized:true,
    cookie:{
        expires: Date.now()+7*24*3600*1000,
        maxAge:7*24*3600*1000,
        httpOnly:true
    }
}

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstretagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentPath = req.path;
    next();
});


const validateExpense = (req, res, next) => {
    const { error } = expenseSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
const userLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        
        return res.redirect("/login");
    }
    next();
}


app.get("/signup",(req,res)=>{
    res.render("auth/signup.ejs");
})
app.post("/signup",validateUser, wrapAsync(async(req,res,next)=>{
    const {
            username,
            name,
            age,
            balance,
            email,
            password
        } = req.body;

        const newUser = new User({
            username,
            name,
            age,
            balance,
            email
        });
    const registerUser = await User.register(newUser,password);

    req.login(registerUser, (err)=>{
        if(err) return next(err);
        res.redirect("/transaction");
    });
}));

app.get("/login",(req,res)=>{
    res.render("auth/login.ejs");
})
app.post("/login", 
    passport.authenticate("local", 
    {failureRedirect:"/login",
        successRedirect:"/transaction"
    }),
    
    
)

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        return res.redirect("/transaction");
    });
});

const isOwner = async (
    req,
    res,
    next
) => {

    const { id } = req.params;

    const expense =
        await Expense.findById(id);

    if (!expense) {
        return res.send(
            "Expense not found"
        );
    }

    if (
        !expense.user.equals(
            req.user._id
        )
    ) {
        return res.send(
            "You are not authorized"
        );
    }

    next();
};



app.listen(port,()=>{
    console.log("Server is listening");
})

app.get("/transaction",
    userLoggedin,
    wrapAsync(async (req, res) => {

    const recentTransactions =
    await Expense.find({
        user:req.user._id
    })
    .sort({ date:-1 })
    .limit(5);

    const allexpenses =
    await Expense.find({
        user:req.user._id
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for(let e of allexpenses){

        if(e.type === "income"){
            totalIncome += e.amount;
        }
        else{
            totalExpense += e.amount;
        }
    }

    const currentBalance =
        req.user.balance + totalIncome - totalExpense;

        const chartLabels = [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5"
];

const incomeValues = [0,0,0,0,0];
const expenseValues = [0,0,0,0,0];

allexpenses.forEach(e=>{

    const week =
    Math.floor(
        (new Date(e.date).getDate()-1)/7
    );

    if(week >= 0 && week < 5){

        if(e.type === "income"){
            incomeValues[week] += e.amount;
        }
        else{
            expenseValues[week] += e.amount;
        }
    }
});

    res.render("expenses/index",{
    recentTransactions,
    user:req.user,
    totalIncome,
    totalExpense,
    currentBalance,

    chartLabels,
    incomeValues,
    expenseValues
});
}));
// create new transaction -get 
app.get("/transaction/new",
    userLoggedin,
    (req,res)=>{

    res.render("expenses/new.ejs");
});
//post for the new ransacion submission
app.post("/transaction",
    userLoggedin,
    validateExpense,
    wrapAsync(async(req, res) => {

        const newExpense =
            new Expense(req.body);

        newExpense.user =
            req.user._id;

        await newExpense.save();

        res.redirect("/transaction");
}));


//edit -get
app.get("/transaction/:id/edit",userLoggedin,isOwner, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const exp= await Expense.findById(id);
    res.render("expenses/edit.ejs",{exp})
}))
//edit put
app.put("/transaction/:id", userLoggedin,validateExpense,isOwner, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Expense.findByIdAndUpdate(id ,req.body);
    res.redirect("/transaction");
}))
//delete the path
app.delete("/transaction/:id",userLoggedin, isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Expense.findByIdAndDelete(id);
    res.redirect("/transaction");
}))

app.get(
    "/transactions",
    userLoggedin,
    wrapAsync(async(req,res)=>{

        const allexpenses =
        await Expense.find({
            user:req.user._id
        })
        .sort({ date:-1 });

        res.render(
            "expenses/allTransactions",
            { allexpenses }
        );

}));
//user path
app.get("/userdetail", userLoggedin, wrapAsync(async (req, res) => {

    const user = await User.findById(req.user._id);

    res.render("user/userDetails", { user });

}));
//user path chng
app.post(
    "/userdetail/change",
    userLoggedin,
    wrapAsync(async (req, res) => {

        const { name, age } = req.body;

        await User.findByIdAndUpdate(
            req.user._id,
            {
                name,
                age
            }
        );

        res.redirect("/transaction");
}));

app.get(
"/transaction/income/analytics",
userLoggedin,
wrapAsync(async(req,res)=>{

    const selectedYear =
    Number(req.query.year) ||
    new Date().getFullYear();

    const selectedMonth =
    Number(req.query.month) ||
    (new Date().getMonth()+1);

    const selectedWeek =
    Number(req.query.week) || 1;

    const filter =
    req.query.filter || "month";

    let incomeData = [];

    // ----------------------------
    // DATABASE QUERY
    // ----------------------------

    if(filter==="year"){

        const start =
        new Date(selectedYear,0,1);

        const end =
        new Date(selectedYear,11,31,23,59,59);

        incomeData =
        await Expense.find({

            user:req.user._id,

            type:"income",

            date:{
                $gte:start,
                $lte:end
            }

        }).sort({date:1});

    }

    else{

        const start =
        new Date(selectedYear,selectedMonth-1,1);

        const end =
        new Date(selectedYear,selectedMonth,0,23,59,59);

        incomeData =
        await Expense.find({

            user:req.user._id,

            type:"income",

            date:{
                $gte:start,
                $lte:end
            }

        }).sort({date:1});

    }


    // ----------------------------
    // GRAPH
    // ----------------------------

    let labels = [];
    let values = [];

    // YEAR GRAPH

    if(filter==="year"){

        labels=[
            "Jan","Feb","Mar","Apr",
            "May","Jun","Jul","Aug",
            "Sep","Oct","Nov","Dec"
        ];

        values=new Array(12).fill(0);

        incomeData.forEach(item=>{

            const m =
            new Date(item.date).getMonth();

            values[m]+=item.amount;

        });

    }

    // WEEK GRAPH

   else if(filter==="week"){

    labels = [];
    values = new Array(7).fill(0);

    const firstDate = (selectedWeek - 1) * 7 + 1;

    for(let i=0; i<7; i++){

        const currentDate = new Date(
            selectedYear,
            selectedMonth-1,
            firstDate + i
        );

        labels.push([
            currentDate.toLocaleDateString(
                "en-US",
                { weekday:"short" }
            ),
            currentDate.getDate()
        ]);

    }

    incomeData.forEach(item=>{

        const d = new Date(item.date);

        const week =
        Math.floor((d.getDate()-1)/7)+1;

        if(week === selectedWeek){

            const index =
            d.getDate() - firstDate;

            if(index>=0 && index<7){

                values[index] += item.amount;

            }

        }

    });

}

    // MONTH GRAPH

    else{

        labels=[
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5"
        ];

        values=[0,0,0,0,0];

        incomeData.forEach(item=>{

            const week =
            Math.floor((new Date(item.date).getDate()-1)/7);

            if(week>=0 && week<5){

                values[week]+=item.amount;

            }

        });

    }

    res.render(
        "income/analytics",
        {
            incomeData,
            labels,
            values,
            selectedYear,
            selectedMonth,
            selectedWeek,
            filter,
            currentChart:"bar"
        }
    );

}));

app.get(
"/transaction/expense/analytics",
userLoggedin,
wrapAsync(async(req,res)=>{

    const selectedYear =
    Number(req.query.year) ||
    new Date().getFullYear();

    const selectedMonth =
    Number(req.query.month) ||
    (new Date().getMonth()+1);

    const selectedWeek =
    Number(req.query.week) || 1;

    const filter =
    req.query.filter || "month";

    let expenseData = [];

    // ---------------- DATABASE ----------------

    if(filter==="year"){

        const start =
        new Date(selectedYear,0,1);

        const end =
        new Date(selectedYear,11,31,23,59,59);

        expenseData =
        await Expense.find({

            user:req.user._id,

            type:"expense",

            date:{
                $gte:start,
                $lte:end
            }

        }).sort({date:1});

    }

    else{

        const start =
        new Date(selectedYear,selectedMonth-1,1);

        const end =
        new Date(selectedYear,selectedMonth,0,23,59,59);

        expenseData =
        await Expense.find({

            user:req.user._id,

            type:"expense",

            date:{
                $gte:start,
                $lte:end
            }

        }).sort({date:1});

    }

    // ---------------- GRAPH ----------------

    let labels = [];
    let values = [];

    if(filter==="year"){

        labels=[
            "Jan","Feb","Mar","Apr",
            "May","Jun","Jul","Aug",
            "Sep","Oct","Nov","Dec"
        ];

        values=new Array(12).fill(0);

        expenseData.forEach(item=>{

            const month =
            new Date(item.date).getMonth();

            values[month]+=item.amount;

        });

    }

    else if(filter==="week"){

        labels=[];
        values=new Array(7).fill(0);

        const firstDate =
        (selectedWeek-1)*7+1;

        for(let i=0;i<7;i++){

            const currentDate =
            new Date(
                selectedYear,
                selectedMonth-1,
                firstDate+i
            );

            labels.push([

                currentDate.toLocaleDateString(
                    "en-US",
                    {weekday:"short"}
                ),

                currentDate.getDate()

            ]);

        }

        expenseData.forEach(item=>{

            const d =
            new Date(item.date);

            const week =
            Math.floor((d.getDate()-1)/7)+1;

            if(week===selectedWeek){

                const index =
                d.getDate()-firstDate;

                if(index>=0 && index<7){

                    values[index]+=item.amount;

                }

            }

        });

    }

    else{

        labels=[
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5"
        ];

        values=[0,0,0,0,0];

        expenseData.forEach(item=>{

            const week =
            Math.floor(
                (new Date(item.date).getDate()-1)/7
            );

            if(week>=0 && week<5){

                values[week]+=item.amount;

            }

        });

    }

    console.log("Expense Data:", expenseData);
    console.log("Values:", values);

    res.render(
    "expense/analytics",{

        expenseData,

        labels,

        values,

        selectedYear,

        selectedMonth,

        selectedWeek,

        filter,

        currentChart:"bar"

    });

}));

//graph paths
//income
//line graph
app.get("/transaction/income/linegraph",userLoggedin,(req,res)=>{
    res.render("income/inline.ejs");
})
//pie chart

app.get(
"/transaction/income/piechart",userLoggedin,wrapAsync(async(req,res)=>{

    const incomeData =
    await Expense.find({

        user:req.user._id,
        type:"income"
    });

    res.render(
"income/piechart",
{
    incomeData,
    currentChart:"pie"
});

}));
//expense line graph
app.get("/transaction/expense/linegraph",userLoggedin,(req,res)=>{
    res.render("expense/exline.ejs");
})
//pie chart expense

app.get(
"/transaction/expense/piechart",userLoggedin,wrapAsync(async(req,res)=>{

    const expenseData =
    await Expense.find({

        user:req.user._id,
        type:"expense"
    });

    res.render(
        "expense/piechart",
        { expenseData }
    );
}));
app.use((req,res,next)=>{
    throw new ExpressError(404,"page not found");
})
app.use((err,req,res,next)=>{
    let{status=500,message="Something wrong"}=err;
    res.status(status).send(message);
})
