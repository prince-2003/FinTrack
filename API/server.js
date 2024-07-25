import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import schedule from "node-schedule";



const saltRounds = 10;
dotenv.config();

const db = new pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const archiveAndResetData = async () => {
    try {
        // Get all users
        const usersResult = await db.query("SELECT userId FROM user_info");
        const users = usersResult.rows;

        for (const user of users) {
            const { userId } = user;

            // Copy current transactions to archive table
            await db.query(`
                INSERT INTO archived_transaction_history (userId, type, category, amount, date)
                SELECT userId, type, category, amount, date
                FROM transaction_history
                WHERE userId = $1;
            `, [userId]);

            // Calculate remaining balance
            const balanceResult = await db.query(`
                SELECT balance FROM portfolio WHERE userId = $1;
            `, [userId]);
            const balance = balanceResult.rows[0]?.balance || 0;

            // Reset current month's transactions and expenses
            await db.query("DELETE FROM transaction_history WHERE userId = $1;", [userId]);
            await db.query("UPDATE portfolio SET expense_balance = 0, expense_pie = 0 WHERE userId = $1;", [userId]);

            // Roll over remaining balance to new month
            await db.query("UPDATE portfolio SET balance = $1 WHERE userId = $2;", [balance, userId]);
        }

        console.log("Monthly reset and archiving completed successfully.");
    } catch (err) {
        console.error("Error during monthly reset and archiving:", err);
    }
};

schedule.scheduleJob('0 0 1 * *', archiveAndResetData);

// Connect to database
db.connect()
    .then(() => console.log("Connected to database"))
    .catch(err => console.error("Error connecting to database", err));

// Routes

// GET request to fetch user info
app.get('/', (req, res) => {
    const { userId } = req.query;
    const query = `
        SELECT 
            user_info.userId,
            user_info.fullName,
            portfolio.expense_pie,
            portfolio.balance,
            portfolio.income,
            portfolio.savings_amount
        FROM user_info
        JOIN portfolio ON user_info.userId = portfolio.userId
        WHERE user_info.userId = $1;
    `;
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).send("Error fetching user info");
        } else {
            console.log("Query result:", result.rows);
            res.json(result.rows);
        }
    });
});

// GET request to fetch transactions
app.get('/transactions', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).send("userId is required");

    const query = `SELECT * FROM transaction_history WHERE userId = $1`;
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).send("Error fetching transactions");
        } else {
            console.log("Query result:", result.rows);
            res.json(result.rows);
        }
    });
});

// POST request to register a new user
app.post('/register', async (req, res) => {
    const { fullName, userId, email, password } = req.body;
    console.log("Request Body:", req.body);

    try {
        const checkResult = await db.query("SELECT * FROM user_info WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) return res.redirect("/login");

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ error: "Error hashing password" });
            }

            try {
                const userInfoResult = await db.query(
                    "INSERT INTO user_info (email, password, userId, fullName) VALUES ($1, $2, $3, $4) RETURNING *",
                    [email, hash, userId, fullName]
                );

                res.status(201).json({
                    id: userInfoResult.rows[0].id,
                    email: userInfoResult.rows[0].email,
                    userId: userInfoResult.rows[0].userId,
                    fullName: userInfoResult.rows[0].fullName
                });
            } catch (dbErr) {
                console.error("Error inserting user into database:", dbErr);
                res.status(500).json({ error: "Database error" });
            }
        });
    } catch (err) {
        console.error("Error checking existing user:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// POST request for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const checkResult = await db.query("SELECT * FROM user_info WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            const storedPassword = checkResult.rows[0].password;
            bcrypt.compare(password, storedPassword, (err, result) => {
                if (err) return res.status(500).send("Internal Server Error");
                if (result) {
                    res.status(200).json({ userId: checkResult.rows[0].userid });
                } else {
                    res.status(401).send("Incorrect Password");
                }
            });
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

// POST request to add a portfolio
app.post('/portfolio', (req, res) => {
    console.log("Request Body:", req.body);
    const { userId, income, savings } = req.body;

    const query = `
        INSERT INTO portfolio (userId, income, savings)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [userId, income, savings];
    console.log("Inserting portfolio:", values);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Error inserting portfolio" });
        } else {
            console.log("Inserted portfolio:", result.rows[0]);
            res.status(201).json(result.rows[0]);
        }
    });
});

// POST request to add a transaction
app.post('/add_transaction', (req, res) => {
    console.log("Request Body:", req.body);
    const { userId, type, category, amount } = req.body;
    const expenses = type === 'credit' ? -amount : amount;

    const query = `
        INSERT INTO transaction_history (userId, type, category, amount)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [userId, type, category, amount];

    const queryUpdate = `
        UPDATE portfolio
        SET expense_balance = expense_balance + $2
        WHERE userId = $1
        RETURNING *;
    `;
    const valuesUpdate = [userId, expenses];  

    const queryUpdatePie = `
        UPDATE portfolio
        SET expense_pie = expense_pie + $2
        WHERE userId = $1
        RETURNING *;
    `;
    const valuesUpdatePie = [userId, amount]; 

    console.log("Inserting transaction:", values);
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing insert query", err);
            res.status(500).json({ error: "Error inserting transaction" });
        } else {
            console.log("Inserted transaction:", result.rows[0]);
            db.query(queryUpdate, valuesUpdate, (err, resultUpdate) => {
                if (err) {
                    console.error("Error executing update query", err);
                    res.status(500).json({ error: "Error updating expenses" });
                } else {
                    console.log("Updated expenses:", resultUpdate.rows[0]);
                    if (type === 'debit') {
                        db.query(queryUpdatePie, valuesUpdatePie, (err, resultUpdatePie) => {
                            if (err) {
                                console.error("Error executing update pie query", err);
                                res.status(500).json({ error: "Error updating expense pie" });
                            } else {
                                console.log("Updated expense pie:", resultUpdatePie.rows[0]);
                                res.status(201).json(result.rows[0]);
                            }
                        });
                    } else {
                        res.status(201).json(result.rows[0]);
                    }
                }
            });
        }
    });
});

// PUT request to update the portfolio
app.put('/update_portfolio', (req, res) => {
    console.log("Request Body:", req.body);
    const { userId, income, savings } = req.body;

    let query, values;
    if (income !== undefined && savings !== undefined) {
        query = `
            UPDATE portfolio
            SET income = $2, savings = $3
            WHERE userId = $1
            RETURNING *
        `;
        values = [userId, income, savings];
    } else if (income !== undefined) {
        query = `
            UPDATE portfolio
            SET income = $2
            WHERE userId = $1
            RETURNING *
        `;
        values = [userId, income];
    } else if (savings !== undefined) {
        query = `
            UPDATE portfolio
            SET savings = $2
            WHERE userId = $1
            RETURNING *
        `;
        values = [userId, savings];
    } else {
        return res.status(400).json({ error: "Missing parameters: income or savings must be provided" });
    }

    console.log("Updating portfolio:", values);
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Error updating portfolio" });
        } else {
            console.log("Updated portfolio:", result.rows[0]);
            res.json(result.rows);
        }
    });
});

// PUT request to update user information
app.put('/update_user', (req, res) => {
    console.log("Request Body:", req.body);
    const { userId, email, name } = req.body;

    const query = `
        UPDATE user_info
        SET fullname = $2,
            email = $3
        WHERE userId = $1
        RETURNING *
    `;
    const values = [userId, name, email];
    console.log("Updating user:", values);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Error updating user" });
        } else {
            console.log("Updated user:", result.rows[0]);
            res.json(result.rows);
        }
    });
});

app.get('/chart', (req, res) => {
    const { userId } = req.query;
    const query = `
       SELECT 
    category,
    SUM(amount) AS total
FROM transaction_history
WHERE userId = $1
AND type = 'debit'
GROUP BY category;

    `;
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).send("Error fetching chart data");
        } else {
            console.log("Query result:", result.rows);
            res.json(result.rows);
        }
    });
});

// DELETE request to delete a user
app.delete('/delete_user', (req, res) => {
    console.log("Request Body:", req.body);
    const { userId } = req.body;

    const query = `
        DELETE FROM user_info
        WHERE userId = $1
        RETURNING *
    `;
    const values = [userId];
    console.log("Deleting user:", values);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Error deleting user" });
        } else {
            console.log("Deleted user:", result.rows[0]);
            res.json(result.rows);
        }
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server is active on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("Closing server and database connection...");
    server.close(() => {
        console.log("Server closed");
        db.end(() => {
            console.log("Database connection closed");
            process.exit(0);
        });
    });
});
