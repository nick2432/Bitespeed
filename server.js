const express = require("express");
const { identifyContact } = require("./services/contactService");
const app = express();
app.use(express.json());

app.post("/identify", async (req, res) => {
  console.log("Incoming Request Body:", req.body); // Debug log

  // Extract fields correctly
  const { email, phonenumber } = req.body; 
  if (!email && !phonenumber) {
    return res.status(400).json({ error: "Please provide at least an email or phone number." });
  }

  try {
    const result = await identifyContact(email, phonenumber);
    res.json({ contact: result });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
