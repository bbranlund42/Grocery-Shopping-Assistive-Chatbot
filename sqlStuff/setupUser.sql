create table user(
    userid int(5) Not Null Primary Key,
    userName varchar(30) Not Null,
    password varchar(30) Not Null,
    firstName varchar(30) Not Null,
    lastName varchar(30) Not Null,
    email varchar(50)
);

INSERT INTO user (userid, userName, password, firstName, lastName, email) 
VALUES
(00001, 'Alice23', '1234', 'Alice', 'Smith', 'alice@email.com'),
(00002, 'Bob69', '1234', 'Bob', 'Johnson', 'bob@email.com'),
(00003, 'Charlie34', '1234', 'Charlie', 'Williams', 'charlie@email.com'),
(12345, 'Dallas21', '1234', 'Dallas', 'Brown', 'dallas@email.com'),
(55493, 'Evan89', '1234', 'Evan', 'Jones', 'evan@email.com'),
(00004, 'Faye47', '1234', 'Faye', 'Miller', 'faye@email.com'),
(78324, 'George90', '1234', 'George', 'Martinez', 'george@email.com'),
(11111, 'Heather43', '1234', 'Heather', 'Wilson', 'heather@email.com'),
(12543, 'Issac66', '1234', 'Issac', 'Anderson', 'issac@email.com'),
(77777, 'Jacob24', '1234', 'Jacob', 'Thomas', 'jacob@email.com');