import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;
const apiUrl = "http://localhost:3000";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/dashboard', async (req, res) => {
    try {
        const [userInfoResponse, transactionsResponse] = await Promise.all([
            axios.get(`${apiUrl}/`),
            axios.get(`${apiUrl}/transactions`)
        ]);

        const userInfo = userInfoResponse.data[0];
        const transactions = transactionsResponse.data;

        res.render("overview.ejs", {
            balance: userInfo.balance,
            income: userInfo.income,
            savings: userInfo.savings_amount,
            expenses: userInfo.expense_pie,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching user info:", error.message || error);
        res.status(500).send("Error fetching user info");
    }
});

app.post('/add_transaction', async (req, res) => {
    try {
        const { type, category, amount } = req.body;
        const userId = 'prince1398';

        await axios.post(`${apiUrl}/add_transaction`, { userId, type, category, amount });
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error adding transaction:", error.message || error);
        res.status(500).send("Error adding transaction");
    }
});

app.post('/update_portfolio', async (req, res) => {
    try {
        const { fullincome, savings } = req.body;
        const userId = 'prince1398';

        const payload = { userId };
        if (fullincome) payload.income = fullincome;
        if (savings) payload.savings = savings;

        if (Object.keys(payload).length > 1) {
            await axios.put(`${apiUrl}/update_portfolio`, payload);
            res.redirect('/dashboard');
        } else {
            res.status(400).send("No valid fields to update");
        }
    } catch (error) {
        console.error("Error updating portfolio:", error.message || error);
        res.status(500).send("Error updating portfolio");
    }
});

app.post('/update_user', async (req, res) => {
    try {
        const { fullname, userid } = req.body;

        console.log("Request body:", req.body);

        const response = await axios.put(`${apiUrl}/update_user`, {
            name: fullname,
            userId: userid
        });

        console.log("API response:", response.data);
        res.redirect('/dashboard/settings');
    } catch (error) {
        console.error("Error updating user:", error.message || error);
        res.status(500).send("Error updating user");
    }
});

app.get('/dashboard/settings', async (req, res) => {
    try {
        const result = await axios.get(`${apiUrl}/`);
        console.log("API Response Data:", result.data);

        res.render("settings.ejs", {
            name: result.data[0].fullname,
            user: result.data[0].userid
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is active on port ${port}`);
});
