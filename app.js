const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const productsRoute = require("./routes/productRoutes");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.use(morgan("dev"));

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    morgan(":method :url :status :response-time ms ")
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/products", productsRoute);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});