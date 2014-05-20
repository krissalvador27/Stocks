import sys, csv, sqlite3, os

stockFiles = os.listdir("csv")

con = sqlite3.connect(sys.argv[1])
cur = con.cursor()
# Create the tables within stock.db, should only be initialized once (the columns have been updated since this was instantiated)
cur.execute("CREATE TABLE quotes (StockID, Date, Open, High, Low, Close, Volume, AdjClose);")
cur.execute("CREATE TABLE company (StockID, Name, Sector, Industry, Location);")
cur.execute("CREATE TABLE individual (IndivID, Name, Start_Date);")
cur.execute("CREATE TABLE portfolio (PortID, Name, Start_Date);")
cur.execute("CREATE TABLE activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, Stock_Invested_In, Port_Invested_In);")
cur.execute("CREATE TABLE indiv_invest_in_stock (StockID, IndivID, Invest_In_Stock_Date);")
cur.execute("CREATE TABLE indiv_invest_in_port (PortID, IndivID, Invest_In_Port_Date);")
cur.execute("CREATE TABLE port_invest_in_stock (StockID, PortID, Port_Invest_In_Stock_Date);")

# CSV to SQLite3. Source: http://stackoverflow.com/questions/2887878/importing-a-csv-file-into-a-sqlite3-database-table-using-python
# Making the Quotes table
for file in stockFiles:
	csvfile = "csv/" + file
	tab = os.path.splitext(file)[0]

	# Log which table is being added to the database 
	print(tab)
	with open(csvfile,'rb') as fin: 
	    reader = csv.reader(fin) 
	    # Skip header. Source: http://stackoverflow.com/questions/21527054/typeerror-csv-reader-object-is-not-subscriptable
	    next(reader, None) 
	    for row in reader:
	    	to_db = [unicode(tab, "utf8"), unicode(row[0], "utf8"), unicode(row[1], "utf8"), unicode(row[2], "utf8"), unicode(row[3], "utf8"), unicode(row[4], "utf8"),unicode(row[5], "utf8"),unicode(row[6], "utf8")]
	    	cur.execute("INSERT INTO quotes (StockID, Date, Open, High, Low, Close, Volume, AdjClose) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", to_db)
	    	con.commit()

# Company CSV to SQLite3
csvfile = "csv/company_info.csv"

with open(csvfile,'rU') as fin:
	reader = csv.reader(fin) 
	# Skip header. Source: http://stackoverflow.com/questions/21527054/typeerror-csv-reader-object-is-not-subscriptable
	next(reader, None)
	for row in reader:
		to_company = [row[0].decode('cp1252'), row[1].decode('cp1252'), row[3].decode('cp1252'), row[4].decode('cp1252'), row[5].decode('cp1252')]
		cur.execute("INSERT INTO company (StockID, Name, Sector, Industry, Location) VALUES (?, ?, ?, ?, ?);", to_company)
		con.commit()