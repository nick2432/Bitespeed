const express = require("express");
const { identifyContact } = require("./services/contactService");

const app = express();
app.use(express.json());

app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Either email or phoneNumber is required" });
    }

    const contact = await identifyContact(email, phoneNumber);
    res.status(200).json({ contact });
  } catch (error) {
    console.error("Error in /identify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
