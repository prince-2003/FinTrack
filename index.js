import express from "express";
const app= express();
const port=3000;
app.use(express.static("public"));
app.listen(port, ()=>{
    console.log(`Server is Active ${port}`);
});

app.get('/', function(req, res ){
    res.render("index.ejs");   
})
