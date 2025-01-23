# MongoDB Setup and Usage

This guide outlines how to set up and run a MongoDB database, create collections, insert data, and perform basic queries.

## Prerequisites

Ensure MongoDB is installed on your system. If not, follow the [official installation guide](https://www.mongodb.com/docs/manual/installation/).

---

## Starting and Stopping MongoDB Service

Use the following commands to manage the MongoDB service:

- **Start the MongoDB Service**
```bash
  sudo systemctl start mongod
  sudo systemctl status mongod
  sudo systemctl stop mongod
```

Connecting to MongoDB
To start the MongoDB shell, run:
```bash
mongosh
```

Working with the Database
Switch to a Database
To use or create a new database, enter:
```bash
use database;
```

Create Collections and Insert Data
Products Collection
Create the products collection and add initial data:
```javascript
db.createCollection("products");
db.products.insertMany([
  {
    "product_id": "P001",
    "product_name": "Apple",
    "category": "Fruit",
    "quantity": 100,
    "price": 0.5,
    "description": "Fresh red apple"
  },
  {
    "product_id": "P002",
    "product_name": "Banana",
    "category": "Fruit",
    "quantity": 150,
    "price": 0.3,
    "description": "Ripe yellow bananas"
  }
]);
```

Users Collection
Create the users collection and add initial data:
```javascript
db.createCollection("users");
db.users.insertMany([
  {
    "user_id": "U001",
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "hashedpassword1", // Store hashed passwords, not plain text
    "shopping_list": [
      { "product_id": "P001", "quantity": 3 },
      { "product_id": "P002", "quantity": 5 }
    ]
  },
  {
    "user_id": "U002",
    "name": "Jane Smith",
    "email": "janesmith@example.com",
    "password": "hashedpassword2",
    "shopping_list": [
      { "product_id": "P002", "quantity": 2 }
    ]
  }
]);
```

Querying the Database
View All Documents in a Collection
For Users:
```javascript
db.users.find();
```
For Products:
```javascript
db.products.find();
```

Index Creation for Faster Lookups Create an index on the product_id field to optimize lookups:
```javascript
db.products.createIndex({ "product_id": 1 });
```


Find Specific Product by ID
```javascript
db.products.find({ "product_id": "P001" });
```

Additional Notes
Ensure passwords in the users collection are hashed for security. Do not store plain-text passwords.
Indexing significantly improves the performance of database queries, especially for large datasets.

# After you get the above setup, then start the node.js server

### How to start the node.js server

1. **Open a Terminal or Command Prompt:**
   - Navigate to the directory containing `server.js` using the `cd` command.

2. **Install Dependencies:**
   - If your project has a `package.json` file listing required packages, install them by running:
     ```bash
     npm install
     ```

3. **Start the Server:**
   - Run the following command to start the server:
     ```bash
     node server.js
     ```

4. **Verify the Server is Running:**
   - Open a web browser and navigate to `http://localhost:PORT`, replacing `PORT` with the port number specified in your `server.js` file.