//const express = require("express") // Common.js moduler
import express from "express" // ES6 modules, inkluder "type": "module" i package.json
import bodyparser from "body-parser" 
import cors from "cors"
import mysql from "mysql2/promise"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(bodyparser.json())
app.use(cors())

// connect to DB
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "banksajt",
    port: 8889, // windows användare 8888
  });

  //Hjälpfunktion för att se att de ser bättre ut
async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

app.post('/users', async (req, res) => {

    const {username, password} = req.body;

    try {
        const result = await query(
            // Spara username och password i tabellen users
            "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, password]);
          res.status(201).send("User created")
    } catch(error) {
        console.log("Error creating user, error");
        res.status(500).send("Error creating user")
    }

});

app.post('/login', async (req, res) => {

    const {username, password} = req.body;

    try {
          // Hämta raden i DB med givet username
        const result = await query("SELECT * FROM users WHERE username = ?", [
            username,
          ]);

      const user = result[0] 

      if (user.password === password) {
        return res.status(200).send("Login successful!")
      } else {
        return res.status(401).send("invalid usernamw or password");
      }


    } catch(error) {
        console.log("Error creating user, error");
        res.status(500).send("Error creating user")
    }

});

app.put("/new-password", async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

  // Hämta raden i DB med givet username
  const result = await query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  const user = result[0];

  try {
    const updateResult = await query(
        // Uppdatera lösenord där för id med newPssword
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, user.id]
    );
    console.log("updateResult", updateResult);

    res.status(204).send("User updated");

  } catch (e) {
    res.status(500).send("Error updating user");
  }

});

app.delete("/users", async (req, res) => {

    const { username } = req.body;
  
    try {
        // Ta bort raden där username är är lika med username från body. 
      const deleteResult = await query("DELETE FROM users WHERE username = ?", [
        username,
      ]);
      console.log("deleteResult", deleteResult);
      res.send("User deleted");
    } catch (e) {
      res.status(500).send("Error deleting user");
    }
  });



app.listen(PORT, () => {
    console.log(`Servern kör på http://localhost:${PORT}`)
})