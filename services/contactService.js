const pool = require("../db");

const identifyContact = async (email, phoneNumber) => {
    const client = await pool.connect();
    try {
        const existingContactsRes = await client.query(
            "SELECT * FROM Contacts WHERE email = $1 OR phonenumber = $2",
            [email, phoneNumber]
        );
        
        const existingContacts = existingContactsRes.rows;
        const exactMatch = existingContacts.find(
            (contact) => contact.email === email && contact.phonenumber === phoneNumber
        );
        
        const hasEmail = existingContacts.some(contact => contact.email === email);
        const hasPhone = existingContacts.some(contact => contact.phonenumber === phoneNumber);
        const bothExist = hasEmail && hasPhone;

        if (exactMatch) {
            const allLinkedContactsRes = await client.query(
                "SELECT * FROM Contacts WHERE id = $1 OR linkedid = $1",
                [exactMatch.linkedid || exactMatch.id]
            );
            
            const allLinkedContacts = allLinkedContactsRes.rows;

            return {
                primaryContactId: exactMatch.linkedid || exactMatch.id,
                emails: [...new Set(allLinkedContacts.map(c => c.email))],
                phoneNumbers: [...new Set(allLinkedContacts.map(c => c.phonenumber))],
                secondaryContactIds: allLinkedContacts
                    .filter(c => c.linkprecedence === "secondary")
                    .map(c => c.id),
            };
        }
        
        if (existingContacts.length > 0) {
            let contactGroups = new Map();
            existingContacts.forEach(contact => {
                let primaryId = contact.linkprecedence === "primary" ? contact.id : contact.linkedid;
                if (!contactGroups.has(primaryId)) {
                    contactGroups.set(primaryId, []);
                }
                contactGroups.get(primaryId).push(contact);
            });
            
            if (contactGroups.size > 1) {
                let sortedGroups = Array.from(contactGroups.keys()).sort((a, b) => {
                    let aContact = existingContacts.find(c => c.id === a);
                    let bContact = existingContacts.find(c => c.id === b);
                    return new Date(aContact.createdat) - new Date(bContact.createdat);
                });
                
                const oldestPrimary = sortedGroups[0];
                
                await client.query(
                    `UPDATE Contacts 
                    SET linkedid = $1, linkprecedence = 'secondary' 
                    WHERE id <> $1 
                    AND (phonenumber = $2 OR email = $3  
                    OR id IN (SELECT linkedid FROM Contacts WHERE phonenumber = $2 OR email = $3));`,
                    [oldestPrimary, phoneNumber, email]
                );
            }
            
            let primaryContacts = existingContacts.filter(c => c.linkprecedence === "primary");
            let primaryContact = primaryContacts.length > 0 ? primaryContacts[0] : null;
            
            if (!primaryContact) {
                const secondaryContact = existingContacts[0];
                const primaryContactRes = await client.query(
                    "SELECT * FROM Contacts WHERE id = $1",
                    [secondaryContact.linkedid]
                );
                primaryContact = primaryContactRes.rows[0];
            }
            
            if (email && phoneNumber && !bothExist) {
                await client.query(
                    `INSERT INTO Contacts (email, phonenumber, linkprecedence, linkedid, createdat, updatedat) 
                     VALUES ($1, $2, 'secondary', $3, NOW(), NOW())`,
                    [email, phoneNumber, primaryContact.id]
                );
            }
            
            const allLinkedContactsRes = await client.query(
                "SELECT * FROM Contacts WHERE id = $1 OR linkedid = $1",
                [primaryContact.id]
            );
            
            const allLinkedContacts = allLinkedContactsRes.rows;
            
            return {
                primaryContactId: primaryContact.id,
                emails: [...new Set(allLinkedContacts.map(c => c.email))],
                phoneNumbers: [...new Set(allLinkedContacts.map(c => c.phonenumber))],
                secondaryContactIds: allLinkedContacts
                    .filter(c => c.linkprecedence === "secondary")
                    .map(c => c.id),
            };
        }
        
        if (email && phoneNumber && !bothExist) {
            const newPrimaryRes = await client.query(
                `INSERT INTO Contacts (email, phonenumber, linkPrecedence, createdAt, updatedAt) 
                 VALUES ($1, $2, 'primary', NOW(), NOW()) RETURNING id, email, phonenumber`,
                [email, phoneNumber]
            );
            
            const newPrimary = newPrimaryRes.rows[0];
            
            return {
                primaryContactId: newPrimary.id,
                emails: [newPrimary.email],
                phoneNumbers: [newPrimary.phonenumber],
                secondaryContactIds: [],
            };
        }
        
        return { message: "No match found. Please provide both email and phone number." };
    } catch (error) {
        console.error("Error in identifyContact:", error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { identifyContact };
