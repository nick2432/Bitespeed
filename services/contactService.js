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
  
      if (existingContacts.length > 0) {
        // Find the first primary contact (directly or via linkedId)
        let primaryContact = existingContacts.find(c => c.linkprecedence === "primary");
  
        if (!primaryContact) {
          // If all are secondary, find their primary contact
          const secondaryContact = existingContacts[0];
          const primaryContactRes = await client.query(
            "SELECT * FROM Contacts WHERE id = $1",
            [secondaryContact.linkedid]
          );
          primaryContact = primaryContactRes.rows[0];
        }
  
        // Insert as secondary under the primary contact
        const newSecondaryRes = await client.query(
          `INSERT INTO Contacts (email, phonenumber, linkprecedence, linkedid, createdat, updatedat) 
           VALUES ($1, $2, 'secondary', $3, NOW(), NOW()) 
           RETURNING id, email, phonenumber, linkedid`,
          [email, safePhoneNumber, primaryContact.id]
        );
  
        const newSecondary = newSecondaryRes.rows[0];
  
        // Get all emails and phone numbers linked to this primary
        const allLinkedContactsRes = await client.query(
          "SELECT * FROM Contacts WHERE id = $1 OR linkedid = $1",
          [primaryContact.id]
        );
  
        const allLinkedContacts = allLinkedContactsRes.rows;
  
        return {
          primaryContactId: primaryContact.id,
          emails: [...new Set(allLinkedContacts.map(c => c.email))],
          phoneNumbers: [...new Set(allLinkedContacts.map(c => c.phonenumber))],
          secondaryContactIds: allLinkedContacts.filter(c => c.linkprecedence === "secondary").map(c => c.id),
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
