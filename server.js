require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models"); 
const Contact = require("./models/contact");
const ContactService = require("./services/contactService");

const app = express();
app.use(express.json());

app.get("/contacts", async (req, res) => {
  try {
    const contacts = await ContactService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

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
