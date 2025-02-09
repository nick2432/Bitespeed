const pool = require("../db");

const identifyContact = async (email, phoneNumber) => {
  const client = await pool.connect();
  try {
    // Check if an exact match already exists
    const existingContactsRes = await client.query(
      "SELECT * FROM Contacts WHERE email = $1 AND phoneNumber = $2",
      [email, phoneNumber]
    );
   
    if (existingContactsRes.rows.length > 0) {
      const existingContact = existingContactsRes.rows[0];
      //console.log(existingContactsRes.rows.length);
      return {
        primaryContactId: existingContact.id,
        emails: [existingContact.email],
        phoneNumbers: [existingContact.phonenumber],
        secondaryContactIds: [],
      };
    }
    // If no exact match, insert a new primary contact
    const newPrimaryRes = await client.query(
      "INSERT INTO Contacts (email, phonenumber, linkPrecedence, createdAt, updatedAt) VALUES ($1, $2, 'primary', NOW(), NOW()) RETURNING *",
      [email, phoneNumber]
    );

    const newPrimary = newPrimaryRes.rows[0];

    return {
      primaryContactId: newPrimary.id,
      emails: [newPrimary.email],
      phoneNumbers: [newPrimary.phonenumber],
      secondaryContactIds: [],
    };
  } catch (error) {
    console.error("Error in identifyContact:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { identifyContact };
