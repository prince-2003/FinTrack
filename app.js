import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import schedule from "node-schedule";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const saltRounds = 10;
const db = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432,
  ssl: true,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;

const app = express();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const pgSession = connectPgSimple(session);
app.use(
  session({
    store: new pgSession({ pool: db, tableName: "session" }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

async function generateFinancialAdvice(financialData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    The user has the following financial data:
    - Balance: ₹${financialData.balance}
    - Income: ₹${financialData.income}
    - Savings Target: ₹${financialData.savings}
    - Expenses by category: ${JSON.stringify(financialData.chartData)}
    - Recent Transactions: ${JSON.stringify(financialData.transactions)}
    - Last Month Transactions: ${JSON.stringify(financialData.lastmonth)}

    The user's transactions include both credits (income) and debits (expenses). Debits represent their spending, which includes necessary expenses like food, housing, and transportation. Credits represent income inflows. . Please consider both income and expenses when analyzing their financial situation.

    Provide clear, actionable financial advice in 2-3 sentences that:
    The user has a reasonable level of necessary expenses, such as food, groceries,  rents, and transportation, which are expected for basic living. 
    They have also set a savings target of ₹${financialData.savings}, which they aim to meet. Please analyze the user's income and expenses, considering that some spending is necessary for livelihood. 

    Provide specific and actionable financial advice in 2-3 sentences. The advice should:
    1. Identify if any categories are significantly exceeding a reasonable proportion of the user’s income, and mention the rupee amounts if applicable.
    2. Suggest how much they should adjust their spending in those categories, if needed, while considering the importance of maintaining balance for basic living needs.
    3. Offer practical steps for adjusting their spending to meet their savings target, without recommending drastic changes that would affect their quality of life.
    4. Use last month's transactions to understand the user's spending habits and provide advice based on that.
    
    Be specific and focus on proportional spending adjustments, recognizing that some expenses are necessary for a comfortable livelihood.
`;


    const response = await model.generateContent(prompt);
    const advice = response.response.candidates[0].content.parts[0].text;
    return advice;
  } catch (error) {
    console.error("Error generating financial advice:", error);
    throw new Error("Unable to generate financial advice");
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

const verifyCallback = async (email, password, done) => {
  try {
    const result = await db.query("SELECT * FROM user_info WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      return isMatch
        ? done(null, user)
        : done(null, false, { message: "Incorrect Password" });
    } else {
      return done(null, false, { message: "User not found" });
    }
  } catch (err) {
    return done(err);
  }
};

passport.use(new LocalStrategy({ usernameField: "email" }, verifyCallback));
passport.serializeUser((user, done) => {
  done(null, user.userid);
});
passport.deserializeUser(async (userId, done) => {
  try {
    const result = await db.query("SELECT * FROM user_info WHERE userid = $1", [
      userId,
    ]);
    result.rows.length > 0 ? done(null, result.rows[0]) : done(null, false);
  } catch (err) {
    done(err);
  }
});

db.connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Error connecting to database", err));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  req.isAuthenticated()
    ? res.redirect("/dashboard")
    : res.render("login.ejs", { error: null });
});

app.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/login");
  }

  const userId = req.user?.userid;

  const userInfoQuery = `
            SELECT 
                user_info.userid,
                user_info.fullname,
                portfolio.expense_pie,
                portfolio.balance,
                portfolio.income,
                portfolio.savings_amount
            FROM user_info
            JOIN portfolio ON user_info.userid = portfolio.userid
            WHERE user_info.userid = $1;
        `;
  const transactionsQuery = `SELECT * FROM transaction_history WHERE userid = $1`;
  const oldTransactionsQuery = `SELECT * FROM archived_transaction_history WHERE userid = $1`;
  const chartQuery = `
            SELECT 
                category,
                SUM(amount) AS total
            FROM transaction_history
            WHERE userid = $1
            AND type = 'debit'
            GROUP BY category;
        `;

  try {
    const [userInfoResult, transactionsResult, chartResult] = await Promise.all(
      [
        db.query(userInfoQuery, [userId]),
        db.query(transactionsQuery, [userId]),
        db.query(chartQuery, [userId]),
        db.query(oldTransactionsQuery, [userId]),
      ]
    );

    const userInfo = userInfoResult.rows[0];
    const financialData = {
      balance: userInfo.balance,
      income: userInfo.income,
      savings: userInfo.savings_amount,
      expenses: userInfo.expense_pie,
      transactions: transactionsResult.rows,
      chartData: chartResult.rows,
      lastmonth : oldTransactionsQuery.rows,
    };

    const financialAdvice = await generateFinancialAdvice(financialData);

    res.render("overview.ejs", {
      fullname: userInfo.fullname,
      balance: userInfo.balance,
      income: userInfo.income,
      savings: userInfo.savings_amount,
      expenses: userInfo.expense_pie,
      transactions: transactionsResult.rows,
      chartData: chartResult.rows,
      advice: financialAdvice,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/dashboard/settings", (req, res) => {
  req.isAuthenticated()
    ? res.render("settings.ejs", {
        name: req.user.fullname,
        user: req.user.userid,
      })
    : res.status(401).redirect("/login");
});

app.post("/register", async (req, res) => {
  const { fullName, userId, email, password, income, savings } = req.body;

  try {
    // Check if the email already exists
    const checkResult = await db.query(
      "SELECT * FROM user_info WHERE email = $1",
      [email]
    );
    if (checkResult.rows.length > 0) {
      return res.render("login", { error: "User Already Exists" });
    }

    // Hash the password and insert into database
    const hash = await bcrypt.hash(password, saltRounds);
    await db.query("BEGIN");
    const userInfoResult = await db.query(
      "INSERT INTO user_info (email, password, userid, fullname) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, hash, userId, fullName]
    );
    await db.query(
      "INSERT INTO portfolio (userid, income, savings) VALUES ($1, $2, $3) RETURNING *",
      [userId, income, savings]
    );
    await db.query("COMMIT");

    // Log in the user after successful registration
    const user = userInfoResult.rows[0];
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in after registration:", err);
        return res.render("login", {
          error: "Login failed after registration",
        });
      }
      res.redirect("/dashboard");
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error during user registration:", err);
    res.status(500).render("login", { error: "Internal Server Error" });
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render("login", { error: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/dashboard");
    });
  })(req, res, next);
});

app.post("/transactions", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/login");
  }
  const userId = req.user?.userid;
  console.log("Request Body:", req.body);
  const { type, category, amount } = req.body;

  // Adjust the expense amount based on transaction type
  const expenses = type === "credit" ? -amount : amount;

  // Insert the transaction into the transaction_history table
  const query = `
            INSERT INTO transaction_history (userId, type, category, amount)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
  const values = [userId, type, category, amount];

  // Update the expense_balance in the portfolio table
  const queryUpdate = `
            UPDATE portfolio
            SET expense_balance = expense_balance + $2
            WHERE userId = $1
            RETURNING *;
        `;
  const valuesUpdate = [userId, expenses];

  // Update the expense_pie in the portfolio table if the transaction is a debit
  const queryUpdatePie = `
            UPDATE portfolio
            SET expense_pie = expense_pie + $2
            WHERE userId = $1
            RETURNING *;
        `;
  const valuesUpdatePie = [userId, amount];

  console.log("Inserting transaction:", values);

  // Execute the insert query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing insert query", err);
      return res.redirect("/dashboard?error=Error inserting transaction");
    }

    console.log("Inserted transaction:", result.rows[0]);

    // Execute the update query for expense_balance
    db.query(queryUpdate, valuesUpdate, (err, resultUpdate) => {
      if (err) {
        console.error("Error executing update query", err);
        return res.redirect("/dashboard?error=Error updating expenses");
      }

      console.log("Updated expenses:", resultUpdate.rows[0]);

      if (type === "debit") {
        // If it's a debit, update the expense_pie as well
        db.query(queryUpdatePie, valuesUpdatePie, (err, resultUpdatePie) => {
          if (err) {
            console.error("Error executing update pie query", err);
            return res.redirect("/dashboard?error=Error updating expense pie");
          }

          console.log("Updated expense pie:", resultUpdatePie.rows[0]);
          // Redirect to the dashboard after successful transaction
          return res.redirect("/dashboard");
        });
      } else {
        // If it's not a debit, just redirect to the dashboard
        return res.redirect("/dashboard");
      }
    });
  });
});

app.post("/update_user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/login");
  }

  const userId = req.user?.userid;
  if (!userId) {
    return res.status(400).send("userId is required");
  }

  const { email, fullname } = req.body;

  const query = `
            UPDATE user_info
            SET fullname = $2,
                email = $3
            WHERE userid = $1
            RETURNING *
        `;
  const values = [userId, fullname, email];

  try {
    const result = await db.query(query, values);
    console.log("Updated user:", result.rows[0]);
    res.redirect("/dashboard/settings");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user");
  }
});

app.delete("/delete_user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/login");
  }
  const userId = req.user?.userid;
  if (!userId) {
    return res.status(400).send("userId is required");
  }

  const query = `
            DELETE FROM user_info
            WHERE userid = $1
            RETURNING *
        `;
  const values = [userId];

  try {
    const result = await db.query(query, values);
    console.log("Deleted user:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout route
app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

// Monthly archive and reset job
const archiveAndResetData = async () => {
  try {
    const date = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const usersResult = await db.query("SELECT userid FROM user_info");
    const users = usersResult.rows;

    for (const { userid } of users) {
      // Archive the transaction history for the month
      await db.query(
        `
                    INSERT INTO archived_transaction_history (userid, type, category, amount, month, year)
                    SELECT userid, type, category, amount, $2, $3
                    FROM transaction_history
                    WHERE userid = $1;
                `,
        [userid, month, year]
      );

      // Get the current balance and income before resetting
      const balanceResult = await db.query(
        `
                    SELECT balance, income FROM portfolio WHERE userid = $1;
                `,
        [userid]
      );

      // Ensure balance is fetched before proceeding
      const balance = balanceResult.rows[0]?.balance || 0;

      // Set the rollon_amount to the balance before reset
      await db.query(
        `
                    UPDATE portfolio
                    SET rollon_amount = $2
                    WHERE userid = $1;
                `,
        [userid, balance]
      );

      // Reset the transaction history and portfolio for the new month
      await db.query("DELETE FROM transaction_history WHERE userid = $1;", [
        userid,
      ]);
      await db.query(
        "UPDATE portfolio SET expense_balance = 0, expense_pie = 0 WHERE userid = $1;",
        [userid]
      );
    }

    console.log("Monthly reset and archiving completed successfully.");
  } catch (err) {
    console.error("Error during monthly reset and archiving:", err);
  }
};

schedule.scheduleJob("0 0 1 * *", archiveAndResetData);

// Start server
const server = app.listen(port, () => {
  console.log(`Server is active on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing server and database connection...");
  server.close(() => {
    console.log("Server closed");
    db.end(() => {
      console.log("Database connection closed");
      process.exit(0);
    });
  });
});
