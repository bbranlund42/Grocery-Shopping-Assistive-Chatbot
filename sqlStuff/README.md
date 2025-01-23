# Database Setup Instructions


## Prerequisites
- MySQL installed on your system
- Administrative access to MySQL

## Setup Steps

1. First, log into MySQL:
```sql
mysql -u root -p
```

2. Create the inventory database, then exit:
```sql
CREATE DATABASE GroceryStore;
exit;
```

3. Initialize the database with the setup script:
```sql
mysql -u root -p GroceryStore < /path/to/setup.sql
```
Note: Make sure to replace `/path/to/setup.sql` with the actual path to your setup.sql file on your system.

## What the Setup Script Does

The `setup.sql` script performs the following:
- Creates a table called `inventory`
- Configures the table with 4 columns:
  - name
  - location
  - price
  - quantity
- Populates the table with predefined values

## Table Structure
## setupInventory.sql sets up the inventory table

```sql
CREATE TABLE inventory(
   name VARCHAR(50) PRIMARY KEY,
   location VARCHAR(50) NOT NULL,
   price VARCHAR(30) NOT NULL,
   quantity INT(30) NOT NULL
);
```

## setupUser.sql sets up the user table
The `setup.sql` script performs the following:
- Creates a table called `user`
- Configures the table with 6 columns:
  - userid
  - userName
  - password
  - firstName
  - lastName
  - email
- Populates the table with predefined values

```sql
create table user(
    userid int(5) Not Null Primary Key,
    userName varchar(30) Not Null,
    password varchar(30) Not Null,
    firstName varchar(30) Not Null,
    lastName varchar(30) Not Null,
    email varchar(50)
);
```

## setupShopList.sql sets up the shopping list table
The `setup.sql` script performs the following:
- Creates a table called `shopList`
- Configures the table with 3 columns:
  - userid
  - currList
  - prevList
- Populates the table with predefined values

```sql
create table shopList(
    userid int(5) Not Null Primary Key,
    currList varchar(1000),
    prevList varchar(1000)
);
```

## Accessing and Querying the Database

### Method 1: Direct Database Connection
Connect directly to the GroceryStore database:
```sql
mysql -u root -p -D GroceryStore
```

### Method 2: Manual Database Selection
1. Log into MySQL:
```sql
mysql -u root -p
```

2. View available databases:
```sql
show databases;
```

3. Select the GroceryStore database:
```sql
use GroceryStore;
```

### Viewing Tables and Data

1. Show all tables in the database:
```sql
show tables;
```

2. View all data in the inventory table:
```sql
select * from inventory;
```
2. View all data in the user table:
```sql
select * from user;
```
2. View all data in the shopList table:
```sql
select * from shopList;
```