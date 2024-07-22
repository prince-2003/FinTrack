import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { name } from "ejs";

// Get the current file name and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;
const apiUrl = "http://localhost:3000";

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Route for rendering the home page
app.get('/', (req, res) => {
    res.render("index.ejs");
});

// Route for rendering the login page
app.get('/login', (req, res) => {
    res.render("login.ejs");
});

// Route for registering a new user
app.post('/register', async (req, res) => {
    try {
        const { fullName, userId, email, password } = req.body;

        await axios.post(`${apiUrl}/register`, {
            fullName: fullName,
            userId: userId,
            password: password,
            email: email
        });
        res.cookie('userId', userId);
        res.render('register.ejs', {name: fullName});
    } catch (error) {
        console.error("Error registering user:", error.message || error);
        res.status(500).send("Error registering user");
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Request body:", req.body);

        // Authenticate the user with the external API
        const authResponse = await axios.post(`${apiUrl}/login`, { email, password });
        console.log("API Response:", authResponse.data);

        // Extract user ID from the auth response
        const userId = authResponse.data.userId;

        // Set the userId in the cookie
        res.cookie('userId', userId);

        // Redirect to the dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        res.status(500).send("Error logging in");
    }
});

// Route for rendering the dashboard
app.get('/dashboard', async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const [userInfoResponse, transactionsResponse] = await Promise.all([
            axios.get(`${apiUrl}/`, { params: { userId } }),
            axios.get(`${apiUrl}/transactions`, { params: { userId } })
        ]);

        const userInfo = userInfoResponse.data[0];
        const transactions = transactionsResponse.data;

        // Render the overview page with fetched data
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

// Route for adding a new transaction
app.post('/add_transaction', async (req, res) => {
    try {
        const { type, category, amount } = req.body;
        const userId = req.cookies.userId;
        console.log('userId', userId);

        await axios.post(`${apiUrl}/add_transaction`, { userId, type, category, amount });
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error adding transaction:", error.message || error);
        res.status(500).send("Error adding transaction");
    }
});

// Route for updating user portfolio


app.post('/portfolio', async (req, res) => {
    try {
        const { income, savings } = req.body;
        const userId = req.cookies.userId;
        await axios.post(`${apiUrl}/portfolio`, { userId, income, savings });
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error updating portfolio:", error.message || error);
        res.status(500).send("Error updating portfolio");
    }
});

app.post('/update_portfolio', async (req, res) => {
    try {
        const { fullincome, savings } = req.body;
        const userId = req.cookies.userId;

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

// Route for updating user information
app.post('/update_user', async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const { fullname, email } = req.body;

        console.log("Request body:", req.body);

        const response = await axios.put(`${apiUrl}/update_user`, {
            name: fullname,
            email: email,
            userId: userId
        });

        console.log("API response:", response.data);
        res.redirect('/dashboard/settings');
    } catch (error) {
        console.error("Error updating user:", error.message || error);
        res.status(500).send("Error updating user");
    }
});

// Route for rendering the settings page
app.get('/dashboard/settings', async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const result = await axios.get(`${apiUrl}/`, { params: { userId } });
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
app.get('/chart', async (req, res) => {
    try {
        const userId = req.cookies.userId;  // Get userId from cookies
        if (!userId) {
            return res.status(400).send("User ID is required");  // Handle case where userId is missing
        }

        // Fetch data from the API
        const result = await axios.get(`${apiUrl}/chart`, { params: { userId } });
        console.log("API Response Data:", result.data);

        // Send the API response data back to the client
        res.status(200).json(result.data);

    } catch (error) {
        console.error("Error fetching data:", error);

        // Send a generic error message to the client
        res.status(500).send("Internal Server Error");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is active on port ${port}`);
});
