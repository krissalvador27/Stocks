Stocks
======
@authors: Kris Salvador, Alexa Greenberg, Kien Ho

A small webapp written in Node.js that parses user uploaded csv stock data to create a database of historical financial information. Users can rank stocks and portfolios by annualized rate of return, find individuals total return and compare stock quotes. 

Where to find the main code:

server.js contains the back-end code, and the public/ folder contains the front-end code, including home.js.
Detailed comments (both at the top, and throughout the code) are in server.js and home.js, 
as well as in convert.py for how we instantiated the database with stock information from Yahoo.

Our test cases are in the tests.

Our stocks.db database has not been included, to save space.

All of the stock CSV files were loaded in an initial csv/folder, but were removed to save space.

To install the node modules used in the project, you would use the command 'npm install' once installing Node.js on your computer. 
This pulls the necessary module names from our package.json file.

Possible to do: 
- Update UI
  - Google analytics graphs
