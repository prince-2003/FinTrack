import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, "public")));
app.listen(port, ()=>{
    console.log(`Server is Active ${port}`);
});

app.get('/', function(req, res ){
    res.render("index.ejs");   
});
app.get('/dashboard', function(req, res ){
    res.render("overview.ejs");   
});
app.get('/dashboard/settings', function(req, res ){
    res.render("settings.ejs");   
});
