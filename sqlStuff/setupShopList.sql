create table shopList(
    userid int(5) Not Null Primary Key,
    currList varchar(1000),
    prevList varchar(1000)
);

INSERT INTO shopList (userid, currList, prevList) 
VALUES
(00001, 'apples, green apples, banana, coffee', 'apples, beans'),
(00002, 'milk, water', 'corn, olives'),
(00003, 'apple, pear', 'turkey, chicken, milk'),
(12345, 'hot dog, bun, ketchup', 'chips, coke'),
(55493, 'paper plates, cups', 'pickles, eggs'),
(00004, 'brownies, cookies, milk', 'corn, peas, potatoes'),
(78324, 'hamburger meat, buns, mustard, pickles', 'olive oil, chicken, rice'),
(11111, 'cups, pepsi, water, toilet paper', 'okra, turnips'),
(12543, 'pepsi, mountain dew, cups, paper towels', 'chicken, apples'),
(77777, 'ketchup, mustard, mayonaise', 'apples, olives, tomatoes');