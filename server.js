const express = require("express");
const { identifyContact } = require("./services/contactService");

const app = express();
app.use(express.json());

app.post("/identify", async (req, res) => {
  console.log("Incoming Request Body:", req.body); // Debug log

  // Extract fields correctly
  const { email, phonenumber } = req.body; 
  const phoneNumber = phonenumber; // Match the request body

  console.log("Extracted Email:", email, "Extracted Phone Number:", phoneNumber); // Verify

  try {
    const result = await identifyContact(email, phoneNumber);
    res.json({ contact: result });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
