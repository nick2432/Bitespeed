require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models"); 
const Contact = require("./models/contact");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000; 

sequelize.authenticate()
  .then(() => {
    console.log("Connected to PostgreSQL!");
    return sequelize.sync({ force: false }); 
  })
  .then(() => {
    console.log("Database & tables synced!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("Error connecting to database:", err));
