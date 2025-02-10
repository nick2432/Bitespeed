const pool = require("../db");

const identifyContact = async (email, phoneNumber) => {
    const client = await pool.connect();
    try {
      console.log("Received Email:", email, "Received Phone Number:", phoneNumber);
  
      // Check if phoneNumber is undefined or null
      if (!phoneNumber) {
        console.warn("⚠️ Warning: phoneNumber is undefined or null! Setting to empty string.");
      }
      
      const safePhoneNumber = phoneNumber ? phoneNumber.toString() : '';

      const existingContactsRes = await client.query(
        "SELECT * FROM Contacts WHERE email = $1 OR phonenumber = $2",
        [email, safePhoneNumber]
      );
     //here
      const existingContacts = existingContactsRes.rows;
      const exactMatch = existingContacts.find(
        (contact) => contact.email === email && contact.phonenumber === safePhoneNumber
      );
  
      if (exactMatch) {
        return {
          primaryContactId: exactMatch.id,
          emails: [exactMatch.email],
          phoneNumbers: [exactMatch.phonenumber], 
          secondaryContactIds: [],
        };
      }
  
    
      const newPrimaryRes = await client.query(
        `INSERT INTO Contacts (email, phonenumber, linkPrecedence, createdAt, updatedAt) 
         VALUES ($1, $2, 'primary', NOW(), NOW()) RETURNING id, email, phonenumber`,
        [email, safePhoneNumber]
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
