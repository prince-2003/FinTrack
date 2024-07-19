import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import bodyParser from "body-parser";
import { type } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;
const url = "http://localhost:3000";
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.listen(port, ()=>{
    console.log(`Server is Active ${port}`);
});

app.get('/dashboard', async (req, res) => {
    try {
        // Fetch data from both endpoints
        const [userInfoResponse, transactionsResponse] = await Promise.all([
            axios.get(`${url}/`),
            axios.get(`${url}/transactions`)
        ]);

        // Combine the results
        const userInfo = userInfoResponse.data[0];
        const transactions = transactionsResponse.data;

        // Render the template with the combined data
        res.render("overview.ejs", {
            balance: userInfo.balance,
            income: userInfo.income,
            savings: userInfo.savings_amount,
            expenses: userInfo.expense_pie,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching user info", error);
        res.status(500).send("Error fetching user info");
    }
});
app.get('/', function(req, res ){
       res.render("index.ejs");
});

app.post('/add_transaction', async (req, res) => {
    try {
        const { type, category, amount } = req.body;
        console.log(req.body);
        const userId = 'prince1398';
        const response = await axios.post(`${url}/add_transaction`, {
            userId: userId,
            type: type,
            category: category,
            amount: amount
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error adding transaction:", error.message || error);
        res.status(500).send("Error adding transaction");
    }
});

app.post('/update_portfolio', async (req, res) => {
    try {
        const { fullincome, savings } = req.body;
        const userId = 'prince1398';
     await axios.put(`${url}/update_portfolio`, {
            userId: userId,
            income: fullincome, savings: savings
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error updating portfolio:", error.message || error);
        res.status(500).send("Error updating portfolio");
    }
});

app.get('/dashboard/settings', function(req, res ){
    res.render("settings.ejs");   
});
