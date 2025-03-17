require("dotenv").config();
const { sequelize } = require("./models/index");
const express = require("express");
const PORT = process.env.PORT || 3003;
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute')

const app = express();
app.use(express.json());

sequelize.authenticate()
    .then(() => console.log('Database connection successful!'))
    .catch(err => console.error('Database connection failed:', err));

app.get("/", (req, res) => {
    res.send("Hello from Home Side!");
})

app.use("/api/auth", authRoute);
app.use("/api", userRoute);

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
})

