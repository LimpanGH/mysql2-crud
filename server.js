//const express = require("express") // Common.js moduler
import express from 'express'; // ES6 modules, inkluder "type": "module" i package.json
import bodyparser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyparser.json());
app.use(cors());

// connect to DB
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'banksajt',
  port: 8889, // windows användare 8888
});

//Hjälpfunktion för att se att de ser bättre ut
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// HTTP Methods: ------------------------------------------------ ⬇

// Post för att skapa en user
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await query(
      'INSERT INTO users (username, password) VALUES (?, ?)', // Spara username och password i tabellen users
      [username, password]
    );
    res.status(201).send('User created');
  } catch (error) {
    console.log('Error creating user, error');
    res.status(500).send('Error creating user');
  }
});

// Post för att logga in som user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE username = ?', [username]); // Hämta raden i DB med givet username
    const user = result[0];
    if (user.password === password) {
      return res.status(200).send('Login successful!');
    } else {
      return res.status(401).send('invalid usernamw or password');
    }
  } catch (error) {
    console.log('Error creating user, error');
    res.status(500).send('Error creating user');
  }
});


app.put('/new-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    // Fetch the user from the database
    const result = await query('SELECT * FROM users WHERE username = ?', [username]);
    const user = result[0];

    // Check if the user exists and the old password matches
    if (!user) {
      return res.status(404).send('User not found');
    }
    if (user.password !== oldPassword) {
      return res.status(401).send('Invalid old password');
    }

    // Update the user's password
    const updateResult = await query('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id]);
    console.log('updateResult', updateResult);

    res.status(204).send('Password updated');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Error updating password');
  }
});


app.delete('/users', async (req, res) => {
  const { username } = req.body;
  try {
    // Ta bort raden där username är är lika med username från body.
    const deleteResult = await query('DELETE FROM users WHERE username = ?', [username]);
    console.log('deleteResult', deleteResult);
    res.send('User deleted');
  } catch (e) {
    res.status(500).send('Error deleting user');
  }
});

// HTTP Methods: ------------------------------------------------ ⬆

app.listen(PORT, () => {
  console.log(`Servern kör på http://localhost:${PORT}`);
});
