const express = require('express');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI (local or Atlas)
const dbName = 'database'; // Your database name

// Create an Express app
const app = express();
const port = 3001;

// Create a MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Route to get all products
app.get('/products', async (req, res) => {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const productsCollection = db.collection('products');

        // Find all products
        const products = await productsCollection.find().toArray();
        
        // Send the products as JSON response
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    } finally {
        // Close the connection
        await client.close();
    }
});

// Route to get all users
app.get('/users', async (req, res) => {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Find all users
        const users = await usersCollection.find().toArray();
        
        // Send the users as JSON response
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    } finally {
        // Close the connection
        await client.close();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});