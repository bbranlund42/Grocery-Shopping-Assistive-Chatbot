CREATE TABLE inventory(
   name VARCHAR(50) PRIMARY KEY,
   location VARCHAR(50) NOT NULL,
   price VARCHAR(30) NOT NULL,
   quantity INT(30) NOT NULL
);

INSERT INTO inventory (name, location, price, quantity) 
VALUES
('apple', 'A2', '0.69', 32),
('green apple', 'A2', '0.72', 28),
('banana', 'A3', '0.50', 17),
('pear', 'A3', '0.80', 9),
('water melon', 'A4', '4.99', 15),
('rice', 'C9', '3.19', 18),
('milk', 'D4', '2.19', 29),
('mountain dew', 'D2', '5.00', 38),
('water', 'D1', '7.00', 25),
('beans', 'C6', '3.50', 13);