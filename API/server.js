import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

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

// Connect to database
db.connect()
    .then(() => {
        console.log("Connected to database");
    })
    .catch(err => {
        console.error("Error connecting to database", err);
    });

// Routes
// GET request
app.get('/', (req, res) => {
    const userId = 'prince1398';

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


app.get(`/transactions`, (req, res) => {
    const userId = 'prince1398';

    const query = `
        SELECT *
        FROM transaction_history
        WHERE userId = $1
    `;

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

// POST requests
app.post('/register', (req, res) => {
    console.log("Request Body:", req.body);

    const { userId, fullName } = req.body;

    const query = `
        INSERT INTO user_info (userId, fullName)
        VALUES ($1, $2)
        RETURNING *
    `;
    const values = [userId, fullName];

    console.log("Inserting user:", values);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Error inserting user" });
        } else {
            console.log("Inserted user:", result.rows[0]);
            res.status(201).json(result.rows[0]);
        }
    });
});

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



// PUT requests
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

app.put('/update_user', (req, res) => {
    console.log("Request Body:", req.body);

    const { userId, name } = req.body;

    const query = `
        UPDATE user_info
        SET fullname = $2
        WHERE userId = $1
        RETURNING *
    `;
    const values = [userId, name];

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

// DELETE request
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
