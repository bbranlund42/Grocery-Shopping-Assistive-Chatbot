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
CREATE DATABASE inventory;
exit;
```

3. Initialize the database with the setup script:
```sql
mysql -u root -p inventory < /path/to/setup.sql
```
Note: Make sure to replace `/path/to/setup.sql` with the actual path to your setup.sql file on your system.

## What the Setup Script Does

The `setup.sql` script performs the following:
- Creates a table called `products`
- Configures the table with 4 columns:
  - name
  - location
  - price
  - quantity
- Populates the table with predefined values

## Table Structure

```sql
CREATE TABLE products(
   name VARCHAR(50) PRIMARY KEY,
   location VARCHAR(50) NOT NULL,
   price VARCHAR(30) NOT NULL,
   quantity INT(30) NOT NULL
);
```

## Accessing and Querying the Database

### Method 1: Direct Database Connection
Connect directly to the inventory database:
```sql
mysql -u root -p -D inventory
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

3. Select the inventory database:
```sql
use inventory;
```

### Viewing Tables and Data

1. Show all tables in the database:
```sql
show tables;
```

2. View all data in the products table:
```sql
select * from products;
```