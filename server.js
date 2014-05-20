var express = require('express')
 , app = express()
 , http = require('http')
 , server = http.createServer(app)
 , io = require('socket.io').listen(server, {log: false})
 , file = 'stocks.db'
 , fs = require('fs')
 , sql = require('sqlite3').verbose()
 , db = new sql.Database(file)
 , exec = require('child_process').exec
 , csv = require('csvtojson').core.Converter
 , portID = 0
 , indivID = 0
 , activityID = 0
 , individuals = []
 , portfolios = []
 , names = []
 , validStocks = ["MMM", "ABT", "ACE", "ACN", "ACT", "ADBE", "AES", "AET", "AFL", "A", "GAS", "APD", "ARG", "AKAM", "AA", "ALXN", "ATI", "AGN", "ADS", "ALL", 
                  "ALTR", "MO", "AMZN", "AEE", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", "ADI", "AON", "APA", "AIV", "AAPL", "AMAT", 
                  "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", "AVB", "AVY", "AVP", "BHI", "BLL", "BAC", "BK", "BCR", "BAX", "BBT", "BEAM", "BDX", "BBBY", "BMS", 
                  "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "CHRW", "CA", "CVC", "COG", "CAM", "CPB", "COF", "CAH", "KMX", "CCL", "CAT", 
                  "CBG", "CBS", "CELG", "CNP", "CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "CINF", "CTAS", "CSCO", "C", "CTXS", "CLF", "CLX", "CME", 
                  "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CMCSA", "CMA", "CSC", "CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "COV", "CCI", "CSX", "CMI", "CVS", 
                  "DHI", "DHR", "DRI", "DVA", "DE", "DAL", "DNR", "XRAY", "DVN", "DO", "DTV", "DFS", "DISCA", "DLTR", "D", "DOV", "DOW", "DTE", "DD", "DUK", "DNB", 
                  "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMC", "EMR", "ESV", "ETR", "EOG", "EQT", "EFX", "EQR", "EL", "EXC", "EXPE", "EXPD", "ESRX", 
                  "XOM", "FFIV", "FDO", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", "FLR", "FMC", "FTI", "F", "FRX", "FOSL", "BEN", "FCX", "FTR", 
                  "GME", "GCI", "GPS", "GRMN", "GD", "GE", "GIS", "GPC", "GNW", "GILD", "GS", "GT", "GOOG", "GWW", "HAL", "HOG", "HAR", "HRS", "HIG", "HAS", "HCP", "HCN", 
                  "HP", "HES", "HPQ", "HD", "HON", "HRL", "HSP", "HST", "HCBK", "HUM", "HBAN", "ITW", "IR", "TEG", "INTC", "ICE", "IBM", "IGT", "IP", "IPG", "IFF", "INTU", 
                  "ISRG", "IVZ", "IRM", "JBL", "JEC", "JNJ", "JCI", "JOY", "JPM", "JNPR", "KSU", "K", "KEY", "KMB", "KLAC", "KSS", "KR", "LB", "LLL", "LH", "LRCX", "LM", 
                  "LEG", "LEN", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", "LOW", "LSI", "MTB", "MAC", "M", "MRO", "MAR", "MMC", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", 
                  "MCK", "MWV", "MDT", "MRK", "MET", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", "MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NBR", "NDAQ", 
                  "NOV", "NTAP", "NFLX", "NWL", "NFX", "NEM", "NEE", "NKE", "NI", "NE", "NBL", "JWN", "NSC", "NTRS", "NOC", "NU", "NRG", "NUE", "NVDA", "ORLY", "OXY", "OMC", 
                  "OKE", "ORCL", "OI", "PCG", "PCAR", "PLL", "PH", "PDCO", "PAYX", "BTU", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PETM", "PFE", "PNW", "PXD", "PBI", 
                  "PCL", "PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PSA", "PHM", "PVH", "PWR", "QCOM", "DGX", "RRC", "RTN", "RHT", 
                  "REGN", "RF", "RSG", "RAI", "RHI", "ROK", "COL", "ROP", "ROST", "RDC", "R", "SWY", "CRM", "SNDK", "SCG", "SLB", "STX", "SEE", "SRE", "SHW", "SIAL", "SPG", 
                  "SLM", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT", "STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", 
                  "THC", "TDC", "TSO", "TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", "FOXA", "TSN", "TYC", "USB", "UNP", "UNH", 
                  "UPS", "X", "UTX", "UNM", "URBN", "VFC", "VLO", "VAR", "VTR", "VRSN", "VZ", "VRTX", "VIAB", "VNO", "VMC", "WMT", "WAG", "DIS", "GHC", "WM", "WAT", "WLP", 
                  "WFC", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WIN", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX", "XL", "YHOO", "YUM", "ZMH", "ZION"];

// Execute python script: http://nodejs.org/api/child_process.html
// exec('python test.py', function (error, stdout, stderr) {
//   console.log('stdout: ' + stdout);
// });

// Set up server port
server.listen(process.env.PORT || 8080);

// Load static files from /public folder
app.use(express.static(__dirname + '/public'));

// http://stackoverflow.com/questions/16949807/how-do-i-get-node-js-to-return-pages-without-file-extensions
app.get('/:file', function (req, res) {
    var file = req.params.file;
    res.sendfile('public/' + file + '.html');
});

// Allow websockets on Heroku host
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.of('/user').on('connection', function (socket) {
  socket.emit('connected');
  
  socket.on('clear-db', function() {
    db.serialize(function() {
      var to_delete = ['activity_records', 'indiv_invest_in_stock', 'indiv_invest_in_port', 
        'port_invest_in_stock', 'individual', 'portfolio'];
      for (var j = 0; j < to_delete.length; j++) {
        var delete_table = to_delete[j];
        db.all("DELETE from " + delete_table, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
    portID = 0;
    indivID = 0;
    activityID = 0;
    individuals = [];
    portfolios = [];
    names = [];
  });

  function updateIndividualTotalReturn(x) {
    if (x < individuals.length) {
      console.log('starting INDIVIDUAL ' + x + ' total return');
      totalReturnIndividual(x, function(totalReturn) {
        // updating Total Net Worth of Individual
        db.get("SELECT * FROM activity_records WHERE Action = 'individual' AND IndivID = " + x, function(err, indiv) {
          db.run("UPDATE individual SET Net_Worth = " + totalReturn*indiv.Amt_of_Activity + " WHERE IndivID = " + x);
          console.log("UPDATE individual SET Net_Worth = " + totalReturn*indiv.Amt_of_Activity + " WHERE IndivID = " + x);
        });

        // updating Total Return of Individual
        db.run("UPDATE individual SET Total_Return = " + totalReturn + " WHERE IndivID = " + x);
        console.log("UPDATE individual SET Total_Return = " + totalReturn + " WHERE IndivID = " + x);
        if ((x+1) < individuals.length) {
          updateIndividualTotalReturn(x+1);
        } else {
          updatePortfolioTotalReturn(0);
        }
      });
    } 
  }

  function updatePortfolioTotalReturn(x) {
    if (x < portfolios.length) {
      console.log('starting PORTFOLIO ' + x + ' total return');
      totalReturnPortfolio(x, function(totalReturn) {
        // updating Total Net Worth of Portfolio
        db.get("SELECT * FROM activity_records WHERE Action = 'fund' AND PortID = " + x, function(err, port) {
          db.run("UPDATE portfolio SET Net_Worth = " + totalReturn*port.Amt_of_Activity + " WHERE PortID = " + x);
          console.log("UPDATE portfolio SET Net_Worth = " + totalReturn*port.Amt_of_Activity + " WHERE PortID = " + x);
        });

        // updating Total Return of Portfolio
        db.run("UPDATE portfolio SET Total_Return = " + totalReturn + " WHERE PortID = " + x);
        console.log("UPDATE portfolio SET Total_Return = " + totalReturn + " WHERE PortID = " + x);  
        updatePortfolioTotalReturn(x+1);
      });
    } 
  }
    socket.on('totalreturn-db', function() {
      updateIndividualTotalReturn(0);
      lowRiskStocks();
  });
  
  socket.on('show-stocks', function (data) {
    db.serialize(function() {
      db.all("SELECT * FROM quotes WHERE StockID='" + data.stock + "' AND Date >= '" + data.start + "' AND Date <= '" + data.end + "'"
        , function(err, rows) {
        socket.emit('show-stocks-output', rows);
      });
    });
  });

  socket.on('show-portfolios', function (data) {
    db.serialize(function() {
      db.all("SELECT * FROM portfolio WHERE name='" + data.portfolio + "'"
        , function(err, rows) {
        socket.emit('show-portfolios-output', rows);
      });
    });
  });

  socket.on('show-individuals', function (data) {
    db.serialize(function() {
      db.all("SELECT * FROM individual WHERE name='" + data.individual + "'"
        , function(err, rows) {
        socket.emit('show-individuals-output', rows);
      });
    });
  });

  
  socket.on('rank-individuals', function (selection) {
    var columns;
    if (selection == 'Total_Return') {
      columns = selection;
    } else if (selection == 'Net_Worth') {
      columns = 'Cash, Value'; // need to fix later - should be sum of two
    } else {
      columns = selection; // annualized rate columns?
    }
    db.serialize(function() {
      db.all("SELECT * FROM individual ORDER BY " + columns + " DESC",
        function(err, rows) {
          console.log(rows);
          socket.emit('rank-individuals-output', rows);
        });
    });
  });

  socket.on('rank-portfolios', function (selection) {
    var columns;
    if (selection == 'Total_Return') {
      columns = selection;
    } else if (selection == 'Net_Worth') {
      columns = 'Cash, Value'; // need to fix later - should be sum of two
    } 
    db.serialize(function() {
      db.all("SELECT * FROM portfolio ORDER BY " + columns + " DESC",
        function(err, rows) {
          console.log(rows);
          socket.emit('rank-portfolios-output', rows);
        });
    });
  });

 socket.on('rank-stocks', function(data) {
    if (data == 'Increasing') {
      db.serialize(function() {
        db.all("SELECT q1.StockID as StockID FROM (SELECT * FROM quotes WHERE Date='2005-01-03' OR Date='2006-01-03' OR Date='2007-01-03' OR " +
          "Date='2008-01-02' OR Date='2009-01-02' OR Date='2010-01-04' OR Date='2011-01-03' OR Date='2012-01-03' OR Date='2013-01-02') AS q1, " +
          "(SELECT * FROM quotes WHERE Date='2005-01-03' OR Date='2006-01-03' OR Date='2007-01-03' OR " +
          "Date='2008-01-02' OR Date='2009-01-02' OR Date='2010-01-04' OR Date='2011-01-03' OR Date='2012-01-03' OR Date='2013-01-02') AS q2 " + 
          "WHERE q1.StockID = q2.StockID AND q1.AdjClose < q2.AdjClose AND ((q1.Date LIKE '%2005%' AND q2.Date LIKE '%2006%') OR (q1.Date LIKE '%2006%' AND q2.Date LIKE '%2007%') " + 
            "OR (q1.Date LIKE '%2007%' AND q2.Date LIKE '%2008%') OR (q1.Date LIKE '%2008%' AND q2.Date LIKE '%2009%') OR (q1.Date LIKE '%2009%' AND q2.Date LIKE '%2010%') OR " +
            "(q1.Date LIKE '%2010%' AND q2.Date LIKE '%2011%') OR (q1.Date LIKE '%2011%' AND q2.Date LIKE '%2012%') OR (q1.Date LIKE '%2012%' AND q2.Date LIKE '%2013%')) " +
            "GROUP BY q1.StockID HAVING count(*)>=8",
          function(err, rows) {
            console.log("err: " + err);
            console.log("rows: " + rows);
            // socket.emit('rank-stocks-output', rows);
            var increasingStockIDs = [];
            for (var i = 0; i < rows.length; i++) {
              increasingStockIDs.push("'" + rows[i].StockID + "'");
            }
            increasingStockIDs = increasingStockIDs.join(" OR StockID = ");
            console.log("WHERE StockID = " + increasingStockIDs + " AND ... ");
            db.all("SELECT StockID, Date, AdjClose FROM quotes WHERE (StockID = " + increasingStockIDs + ") AND (Date='2005-01-03' OR Date='2006-01-03' OR Date='2007-01-03' OR Date='2008-01-02' " + 
              "OR Date='2009-01-02' OR Date='2010-01-04' OR Date='2011-01-03' OR Date='2012-01-03' OR Date='2013-01-02')", function(err2, rows2) {
                console.log(err2);
                console.log(rows2);
                socket.emit('rank-stocks-output', rows2);
              });
          });
      });
    } else if (data == 'Risk') {
      db.serialize(function() {
        db.all("SELECT * From company WHERE Risk NOT NULL Order by Risk LIMIT 10", function(err, rows) {
          socket.emit('rank-stocks-risk-output', rows);
        });
      });
    }
  });

  socket.on('request-portfolio-names', function () {
    db.serialize(function() {
      db.all("SELECT Name FROM portfolio", function(err, rows) {
        socket.emit('reply-portfolio-names', rows);
      });
    });
  });

  socket.on('request-individual-names', function () {
    db.serialize(function() {
      db.all("SELECT Name FROM individual", function(err, rows) {
        socket.emit('reply-individual-names', rows);
      });
    });
  });

  socket.on('upload', function (files) {
    function processFile(i) {
      if (i < files.length) {
        var file = files[i];

          var stream = fs.createWriteStream('csv/' + file.name);

          stream.once('open', function(fd) {
            stream.write(file.data);
            stream.end();
          });

        /* 
         * Execute ruby script: http://nodejs.org/api/child_process.html
         * Sorting each CSV by date
         */ 
          exec('ruby sortscript.rb csv/' + file.name, function (error, stdout, stderr) {
            if (error) {
              console.log('sort csv error: ' + error);
            }
            if (stdout) {
              console.log(stdout);
            }
            if (stderr) {
              console.log(stderr);
            }
        
          console.log('after sort');
          
           // Parsing csv to json. Source: https://www.npmjs.org/package/csvtojson
          var fileStream = fs.createReadStream('csv/' + file.name);
          //new converter instance
          var csvConverter = new csv({constructResult:true});
          //end_parsed will be emitted once parsing finished
          csvConverter.on("end_parsed",function(jsonObj){
             console.log(jsonObj); //here is your result json object
             console.log("Finished Parsing jsonObj");
             console.log(jsonObj.length);

             function rowLoop(row) {
              if (row < jsonObj.length) {
                console.log('row ' + row);
             // for (var row = 0; row < jsonObj.length; row++) {
                var action = jsonObj[row].action
                  , name = jsonObj[row].name
                  // regex checks for both 05/25/2005 and 2005-05-25 date formats
                  , date_regex = /^(20((0[5-9])|(1[0-3]))-(0[1-9]|(1[0-2]))-(0[1-9]|([1-3][0-9])))|(((([1-9])|(1[0-2]))\/([1-9]|([1-3][0-9]))\/20((0[5-9])|(1[0-3])))(\s)*)$/ 
                  
            /* jsonObj is an array of objects where each
            * objects corresponds to the ordered rows of the uploaded scripts.
            * Parameters of the objects are as followed
            *   - action: {fund / individual / buy / sell / sellbuy}
            *   - name
            *   - param3: {cash initialization of fund or individual / StockID / fund name}
            *   - param4: {date of fund or individual / money amount of transaction / StockID}
            *   - param5: {null / date of buy, sell or sellbuy}
            */

                  if (action == 'fund') { // adding fund to portfolio table
                    db.serialize(function() {
                      cash = jsonObj[row].param3;
                      start_date = jsonObj[row].param4;
      
                      // If not already in the db && date is within range
                      if (names.indexOf(name) == -1 && start_date.match(date_regex) != null) {
                        names.push(name);
                        // Inserting into db
                        port_data = [portID, name, start_date, cash, 0, 0, 0];
                        console.log(port_data);
                        db.run("INSERT INTO portfolio (PortID, Name, Start_Date, Cash, Value, Total_Return, Net_Worth) VALUES (?, ?, ?, ?, ?, ?, ?);", port_data);

                        // Inserting activity into db
                        var activity_data = [activityID, 'fund', cash, start_date, portID, null, null, null];
                        db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                        activityID += 1;

                        /* Inserting into local portfolios array
                         * All portfolio objs have
                         *  - id:                 portID
                         *  - value:              total value of port (includes individual investment and appreciation)
                         *  - shares_from_indiv:  amount invested in port by individuals (this will be an aggregate %tage)
                         *  - beg_val:            beginning cash investment of port
                         */
                         
                        new_port = {  id: portID
                                    , value: 0
                                    , shares_from_indiv: 0
                                    , cash: Number(cash)
                                    , cash_from_indivs: 0
                                    };
                        portfolios.push(new_port)
                        portID += 1;
                        if ((row+1) < jsonObj.length) {
                          rowLoop(row+1);
                        } else {
                         processFile(i+1);
                        }
                      }
                    });
                  }

                  if (action == 'individual') {
                    db.serialize(function() {
                      cash = jsonObj[row].param3;
                      start_date = jsonObj[row].param4;

                      // If not already in db && date is within range
                      if (names.indexOf(name) == -1 && start_date.match(date_regex) != null) {
                        names.push(name);
                        // Inserting into db
                        indiv_data = [indivID, name, start_date, cash, 0, 0, 0];
                        console.log(indiv_data);
                        db.run("INSERT INTO individual (IndivID, Name, Start_Date, Cash, Value, Total_Return, Net_Worth) VALUES (?, ?, ?, ?, ?, ?, ?);", indiv_data);
                        
                        // Inserting activity into db
                        var activity_data = [activityID, 'individual', cash, start_date, null, indivID, null, null];
                        db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                        activityID += 1;

                        /* Inserting into local individuals array
                         * All individuals objs have
                         *  - id:                 indivID
                         *  - value:              total value of indiv (cash + investments in stocks/ports)
                         *  - beg_val:            beginning cash investment of indiv
                         */
                        new_indiv = { id: indivID
                                    , value: 0
                                    , cash: Number(cash)
                                    };
                        individuals.push(new_indiv)
                        indivID += 1;
                        if ((row+1) < jsonObj.length) {
                          rowLoop(row+1);
                        } else {
                          processFile(i+1);
                        }
                      }
                    });
                  }

               //STILL NEED TO UPDATE CASH AND VALUE IN DATABASE
                  if (action == 'buy') {
                      //Checks if name is portfolio. If not, find individual. 
                      db.serialize(function() {
                        var name = jsonObj[row].name,
                            stockID_or_fundName = jsonObj[row].param3,
                            cash = jsonObj[row].param4,
                            start_date = jsonObj[row].param5;
                        
                        if (start_date.match(date_regex) != null) {
                          db.all("SELECT PortID FROM portfolio WHERE Name = '" + name + "'",

                            function(err,name_rows) {
                              if (name_rows.length == 0) { //if not portfolio then individual

                                db.all("SELECT IndivID FROM individual WHERE Name = '" + name + "'",
                                  function(err,indiv_rows) {
                                    if(indiv_rows.length == 0) {
                                      console.log("SELECT IndivID FROM individual WHERE Name = '" + name + "'");
                                      console.log("No Find"); //No name in database
                                    } else { //individual buying
                                      db.all("SELECT * FROM portfolio WHERE Name ='" + stockID_or_fundName + "'", 
                                        function(err,port_rows) {
                                          if (port_rows.length == 0) {
                                            if (validStocks.indexOf(stockID_or_fundName) != -1) { //individual buying stock
                                              indiv_invest_stock = [stockID_or_fundName, indiv_rows[0].IndivID, start_date];
                                              console.log("indiv invest stock = " + indiv_invest_stock);
                                              db.run("INSERT INTO indiv_invest_in_stock (StockID, IndivID, Invest_In_Stock_Date) VALUES (?, ?, ?);",
                                                     indiv_invest_stock);

                                              activity_data = [activityID, "buy", cash, start_date, null, indiv_rows[0].IndivID, stockID_or_fundName, null];

                                              //subtract cash from individual, update value in array
                                              individuals[indiv_rows[0].IndivID].cash -= Number(cash);
                                              individuals[indiv_rows[0].IndivID].value += Number(cash);
                                              
                                              //update cash & value in db
                                              db.run("UPDATE individual SET Cash = " +  individuals[indiv_rows[0].IndivID].cash + ", Value = " +  individuals[indiv_rows[0].IndivID].value
                                                            + " WHERE IndivID = " + indiv_rows[0].IndivID);
                                              console.log('update cash and val in buying: ' + "UPDATE individual SET Cash = " +  individuals[indiv_rows[0].IndivID].cash + ", Value = " +  individuals[indiv_rows[0].IndivID].value
                                                            + " WHERE IndivID = " + indiv_rows[0].IndivID);

                                              db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                  "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                                              activityID += 1;
                                              if ((row+1) < jsonObj.length) {
                                                rowLoop(row+1);
                                              } else {
                                                processFile(i+1);
                                              }
                                            }
                                            
                                            //STILL NEED TO UPDATE INDIVIDUAL CASH, ETC
                                          } else { // individual buying portfolio
                                            console.log("** Indiv buying portfolio, updating cash & value of portfolio");
                                            indiv_invest_port = [port_rows[0].PortID, indiv_rows[0].IndivID, start_date];
                                            console.log("indiv invest port = " + indiv_invest_port);
                                            db.run("INSERT INTO indiv_invest_in_port (PortID, IndivID, Invest_In_Port_Date) VALUES (?, ?, ?);", indiv_invest_port);

                                            activity_data = [activityID, "buy", cash, start_date, null, indiv_rows[0].IndivID, null, port_rows[0].PortID];
                                            
                                            // updating individuals cash & value after buy
                                            individuals[indiv_rows[0].IndivID].cash -= Number(cash);
                                            individuals[indiv_rows[0].IndivID].value += Number(cash);
                                            portfolios[port_rows[0].PortID].cash_from_indivs += Number(cash);


                                            //update cash & value in db ... STILL NEED TO UPDATE PORTFOLIO
                                            db.run("UPDATE individual SET Cash = " +  individuals[indiv_rows[0].IndivID].cash + ", Value = " +  individuals[indiv_rows[0].IndivID].value
                                                            + " WHERE IndivID = " +  indiv_rows[0].IndivID);
                                            console.log('indiv buy portfolio: ' + "UPDATE individual SET Cash = " +  individuals[indiv_rows[0].IndivID].cash + ", Value = " +  individuals[indiv_rows[0].IndivID].value
                                                            + " WHERE IndivID = " +  indiv_rows[0].IndivID);

                                            // updating portfolios cash & value after individual's investment
                                            db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + port_rows[0].PortID, function (err, port_stock_rows) {
                                              
                                              if (port_stock_rows.length > 0) {
                                                var pctCash = 1, 
                                                    newCash = portfolios[port_stock_rows[0].PortID].cash;

                                                for (var i = 0; i < port_stock_rows.length; i++) {
                                                  pctCash -= port_stock_rows[i].Percent;
                                                  portfolios[port_stock_rows[0].PortID].value += port_stock_rows[i].Percent * cash;
                                                }

                                                console.log("updating cash pctCash (" + pctCash + ") * investment (" + cash + ")");
                                                newCash += pctCash * Number(cash);

                                                db.run("UPDATE portfolio SET Cash = " +  newCash +  ", Value = " + portfolios[port_stock_rows[0].PortID].value + " WHERE PortID = " +  port_stock_rows[0].PortID);                            
                                                portfolios[port_stock_rows[0].PortID].cash = newCash;
                                              } else { 
                                                //portfolio owns no stocks, simply increment cash
                                                console.log("Portfolio owns no stocks, updating just orig + investment = " + Number(cash) + " + " + portfolios[port_rows[0].PortID].cash);
                                                portfolios[port_rows[0].PortID].cash += Number(cash);
                                                db.run("UPDATE portfolio SET Cash = " +  portfolios[port_rows[0].PortID].cash + " WHERE PortID = " +  port_rows[0].PortID);    
                                              }
                                              
                                            });

                                            db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                                            activityID += 1;
                                            if ((row+1) < jsonObj.length) {
                                              rowLoop(row+1);
                                            } else {
                                              processFile(i+1);
                                            }
                                          }
                                          
                                        });
                                    }
                                  });

                              } else { //portfolio buying stock
                                if (validStocks.indexOf(stockID_or_fundName) != -1){
                                  var curr_value = Number(portfolios[Number(name_rows[0].PortID)].cash) + Number(portfolios[Number(name_rows[0].PortID)].value);

    //                               db.all("SELECT * FROM activity_records WHERE PortID = '" + name_rows[0].PortID + "' AND Action = 'fund'", 
    //                                      function (err, activity_rows) {
    //                                        init_val = Number(activity_rows[0].Amt_of_Activity);
    //                               });
                                  
                                  var percent = cash/curr_value;
                                  console.log('percent: ' + percent + ", which is from cash: " + cash + " divided by curr_value: " + curr_value);

                                  port_invest_data = [percent, stockID_or_fundName, name_rows[0].PortID, start_date];
                                  console.log("port invest data = " + port_invest_data)
                                  db.run("INSERT INTO port_invest_in_stock (Percent, StockID, PortID, Port_Invest_In_Stock_Date) VALUES (?, ?, ?, ?);", port_invest_data);

                                  activity_data = [activityID, "buy", cash, start_date, name_rows[0].PortID, null, stockID_or_fundName, null];

                                  db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                        "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);

                                  activityID += 1;
                                  //subtract cash from portfolio, add to value in array
                                  portfolios[name_rows[0].PortID].cash -= Number(cash);
                                  portfolios[name_rows[0].PortID].value += Number(cash);

                                  db.run("UPDATE portfolio SET Cash = " +  portfolios[name_rows[0].PortID].cash + ", Value = " +  portfolios[name_rows[0].PortID].value
                                                            + " WHERE PortID = " + name_rows[0].PortID);
                                    if ((row+1) < jsonObj.length) {
                                      rowLoop(row+1);
                                    } else {
                                      processFile(i+1);
                                    }
                                }
                              }
                          });
                        }
                      });
                  }

                  if (action == 'sell') { 
                  db.serialize(function() {
                    var name = jsonObj[row].name,
                    stockID_or_fundName = jsonObj[row].param3,
                    sell_date = jsonObj[row].param4;
                    if (sell_date.match(date_regex) != null) { // valid date of transaction
                      db.all("SELECT PortID FROM portfolio WHERE Name = '" + name + "'", 
                        function (err, port_rows) {
                          // seller is a portfolio, grab PortID
                          // console.log(port_rows);
                          // console.log("stockID_or_fundName: " + stockID_or_fundName);
                          if (port_rows.length != 0 && validStocks.indexOf(stockID_or_fundName) != -1) {
                            var PortID = port_rows[0].PortID;
                            // checking portfolio has invested in said stock & that it is not a portfolio
                            db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + PortID + " AND StockID = '" + stockID_or_fundName + "'", 
                              function (err, port_invest_in_stock_rows) {
                                // portfolio has invested in this stock
                                if (port_invest_in_stock_rows && port_invest_in_stock_rows.length != 0) { 
                                  //parse date to match date format in quotes table
                                  var correctDate; 

                                  if (sell_date.indexOf('/') > 0) {
                                    var parsedDate = sell_date.split('/');
                                    if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                      correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                    } else {
                                      correctDate = parsedDate[2] + "-"; 
                                    }

                                    if (parsedDate[0] < 10)
                                      correctDate = correctDate + "0" + parsedDate[0] + "-";
                                    else
                                      correctDate = correctDate + parsedDate[0] + "-";

                                    if (parsedDate[1] < 10)
                                      correctDate = correctDate + "0" + parsedDate[1];
                                    else
                                      correctDate = correctDate + parsedDate[1];

                                  } else if (sell_date.indexOf('-') > 0) {
                                    correctDate = sell_date;
                                  }
                                  // querying for price of stock now
                                  db.all("SELECT * FROM quotes WHERE StockID = '" + stockID_or_fundName 
                                          + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1", 
                                    function(err, quote_curr_rows) {
                                      if (quote_curr_rows && quote_curr_rows.length != 0) {
                                        var sell_price = Number(quote_curr_rows[0].AdjClose);

                                        var boughtDate = port_invest_in_stock_rows[0].Port_Invest_In_Stock_Date;
                                        var correctDate; 
                                        if (boughtDate.indexOf('/') > 0) {
                                          var parsedDate = boughtDate.split('/');
                                          if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                            correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                          } else {
                                            correctDate = parsedDate[2] + "-"; 
                                          }

                                          if (parsedDate[0] < 10)
                                            correctDate = correctDate + "0" + parsedDate[0] + "-";
                                          else
                                            correctDate = correctDate + parsedDate[0] + "-";

                                          if (parsedDate[1] < 10)
                                            correctDate = correctDate + "0" + parsedDate[1];
                                          else
                                            correctDate = correctDate + parsedDate[1];

                                        } else if (boughtDate.indexOf('-') > 0) {
                                          correctDate = boughtDate;
                                        }

                                        // querying for price when stock was first bought
                                        db.all("SELECT * FROM quotes WHERE StockID = '" + stockID_or_fundName 
                                                + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1",
                                          function(err, quote_old_rows) {
                                          if (quote_old_rows && quote_old_rows.length != 0) {
                                            old_price = Number(quote_old_rows[0].AdjClose);
                                            ratio = sell_price / old_price;

                                            // querying for original amount of transaction
                                            db.all("SELECT * FROM activity_records WHERE Action = 'buy' AND PortID = " + PortID 
                                                + " AND Stock_Invested_In = '" + stockID_or_fundName + "'", //+ "' AND Date_of_Activity = '" + correctDate + "'", 
                                                function(err, activity_rec_rows) {
                                                  if (activity_rec_rows.length != 0) {
                                                    amt_of_orig_investment = activity_rec_rows[0].Amt_of_Activity;
                                                    tot = amt_of_orig_investment * (sell_price / old_price);

                                                    // Updating our local portfolio object
                                                    portfolios[PortID].cash += tot;
                                                    portfolios[PortID].value -= amt_of_orig_investment;
                                                    
                                                    // Updating our database
                                                    db.run("UPDATE portfolio SET Cash = " + portfolios[PortID].cash + ", Value = " + portfolios[PortID].value
                                                          + " WHERE PortID = " + PortID);

                                                    // Deleting from port_invest_in_stock
                                                    db.run("DELETE FROM port_invest_in_stock WHERE PortID = " + PortID + " AND StockID = '" 
                                                                                                                        + stockID_or_fundName + "'");

                                                    // Updating activity records
                                                    activity_data = [activityID, "sell", amt_of_orig_investment, sell_date, PortID, null, stockID_or_fundName, null];
                                                    db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                          "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                                                    activityID += 1;
                                                    console.log("port sell data = " + activity_data);
                                                    if ((row+1) < jsonObj.length) {
                                                      rowLoop(row+1);
                                                    } else {
                                                      processFile(i+1);
                                                    }
                                                  }
                                                });
                                          }
                                        }
                                   );
                                  }//if quote_curr_rows end
                                });//SELECT quote_curr_rows end
                            }//if port_rows.length !=0 end
                          });//SELECT port_invest_in_stock end

                          } else { // seller is an individual
                            console.log("INDIVIDUAL SELL");
                            db.all("SELECT IndivID FROM individual WHERE Name = '" + name + "'", 
                              function (err, indiv_rows) {
                                if (indiv_rows.length != 0) {
                                  var IndivID = indiv_rows[0].IndivID;
                                
                                  console.log("INDIV ROWS");
                                  console.log(indiv_rows);
                                  db.all("SELECT * FROM indiv_invest_in_stock WHERE StockID = '" + stockID_or_fundName + "' AND IndivID = " + IndivID,
                                // db.all("SELECT * FROM indiv_invest_in_stock",// WHERE StockID = 'DOW' AND IndivID = 0",
                                    function(err, indiv_invest_in_stock_rows) {

                                      console.log("indiv invest in stock rows");
                                      console.log(indiv_invest_in_stock_rows);
                                      // indiv selling stock
                                      if (indiv_invest_in_stock_rows.length != 0 && validStocks.indexOf(stockID_or_fundName) != -1) {
                                        //parsing date of sell
                                        var correctDate; 
                                          if (sell_date.indexOf('/') > 0) {
                                            var parsedDate = sell_date.split('/');

                                            if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                              correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                            } else {
                                              correctDate = parsedDate[2] + "-"; 
                                            }

                                            if (parsedDate[0] < 10)
                                              correctDate = correctDate + "0" + parsedDate[0] + "-";
                                            else
                                              correctDate = correctDate + parsedDate[0] + "-";

                                            if (parsedDate[1] < 10)
                                              correctDate = correctDate + "0" + parsedDate[1];
                                            else
                                              correctDate = correctDate + parsedDate[1];

                                          } else if (sell_date.indexOf('-') > 0) {
                                            correctDate = sell_date;
                                          }
                                        db.all("SELECT * FROM quotes WHERE StockID = '" + stockID_or_fundName 
                                                + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1", 
                                          function(err, quote_curr_rows) {
                                            if (quote_curr_rows && quote_curr_rows.length != 0) {
                                              var sell_price = Number(quote_curr_rows[0].AdjClose);
                                              
                                              var boughtDate = indiv_invest_in_stock_rows[0].Invest_In_Stock_Date;
                                              var correctDate; 
                                              if (boughtDate.indexOf('/') > 0) {
                                                var parsedDate = boughtDate.split('/');

                                                if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                                  correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                                } else {
                                                  correctDate = parsedDate[2] + "-"; 
                                                }

                                                if (parsedDate[0] < 10)
                                                  correctDate = correctDate + "0" + parsedDate[0] + "-";
                                                else
                                                  correctDate = correctDate + parsedDate[0] + "-";

                                                if (parsedDate[1] < 10)
                                                  correctDate = correctDate + "0" + parsedDate[1];
                                                else
                                                  correctDate = correctDate + parsedDate[1];

                                              } else if (boughtDate.indexOf('-') > 0) {
                                                correctDate = boughtDate;
                                              }
                                              
                                                // querying for price when stock was first bought
                                              db.all("SELECT * FROM quotes WHERE StockID = '" + stockID_or_fundName 
                                                       + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1",
                                                function(err, quote_old_rows) {
                                                if (quote_old_rows && quote_old_rows.length != 0) {
                                                  console.log("SELECT * FROM quotes WHERE StockID = '" + stockID_or_fundName 
                                                       + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1");
                                                  old_price = Number(quote_old_rows[0].AdjClose);
                                                  console.log('old_price: ' + old_price);
                                                  ratio = sell_price / old_price;
                                                  
                                                  // querying for original amount of transaction
                                                  db.all("SELECT * FROM activity_records WHERE Action = 'buy' AND IndivID = " + IndivID 
                                                      + " AND Stock_Invested_In = '" + stockID_or_fundName + "'",
                                                      function(err, activity_rec_rows) {
                                                        if (activity_rec_rows.length != 0) {
                                                          amt_of_orig_investment = activity_rec_rows[0].Amt_of_Activity;
                                                          console.log('amt_of_orig_investment: ' + amt_of_orig_investment);
                                                          tot = amt_of_orig_investment * (sell_price / old_price);
                                                          console.log('tot: ' + tot + 'amt of orig * sell: ' + sell_price + '/ old : ' + old_price);

                                                          // Updating our local portfolio object
                                                          individuals[IndivID].cash += tot;
                                                          individuals[IndivID].value -= amt_of_orig_investment;

                                                          // Updating our database
                                                          db.run("UPDATE individual SET Cash = " + individuals[IndivID].cash + ", Value = " + 
                                                                 individuals[IndivID].value + " WHERE IndivID = " + IndivID);
                                                          console.log('individual sell: ' + "UPDATE individual SET Cash = " + individuals[IndivID].cash + ", Value = " + 
                                                                 individuals[IndivID].value + " WHERE IndivID = " + IndivID);

                                                          // Deleting from indiv_invest_in_stock
                                                          db.run("DELETE FROM indiv_invest_in_stock WHERE IndivID = " + IndivID + " AND StockID = '" 
                                                                                                                              + stockID_or_fundName + "'");

                                                          // Updating activity records
                                                          activity_data = [activityID, "sell", amt_of_orig_investment, sell_date, null, IndivID, stockID_or_fundName, null];
                                                          db.run("INSERT INTO activity_records (ActivityID, Action, Amt_of_Activity, Date_of_Activity, PortID, IndivID, " + 
                                                                                                "Stock_Invested_In, Port_Invested_In) VALUES (?,?,?,?,?,?,?,?);", activity_data);
                                                          activityID += 1;
                                                          console.log("indiv sell stock data = " + activity_data);
                                                            if ((row+1) < jsonObj.length) {
                                                              rowLoop(row+1);
                                                            } else {
                                                              processFile(i+1);
                                                            }
                                                        }
                                                      });
                                                  
                                                }
                                              });
                                            } else {
                                              rowLoop(row+1);
                                            } // end quote_curr_rows lengh if
                                          }); // end select quotes for quote_curr_rows
                                        
                                      } else { // indiv not selling stock, probably selling portfolio
                                        //check if selling portfolio and calculate
                                        var correctDate; 

                                        if (sell_date.indexOf('/') > 0) {
                                          var parsedDate = sell_date.split('/');
                                          if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                            correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                          } else {
                                            correctDate = parsedDate[2] + "-"; 
                                          }

                                          if (parsedDate[0] < 10)
                                            correctDate = correctDate + "0" + parsedDate[0] + "-";
                                          else
                                            correctDate = correctDate + parsedDate[0] + "-";

                                          if (parsedDate[1] < 10)
                                            correctDate = correctDate + "0" + parsedDate[1];
                                          else
                                            correctDate = correctDate + parsedDate[1];

                                        } else if (sell_date.indexOf('-') > 0) {
                                          correctDate = sell_date;
                                        }

                                        db.all("SELECT * FROM indiv_invest_in_port WHERE PortID = " + stockID_or_fundName + " AND IndivID = " + IndivID, 
                                          function(err, indiv_invest_in_port_rows) {
                                            console.log("Selling from a stock")
                                            // selling portfolio individual owns
                                            // ELSE ignore overall transaction
                                            if (indiv_invest_in_port_rows.length != 0) {
                                              PortID = indiv_invest_in_port_rows[0].PortID;

                                              console.log("SELECT * FROM port_invest_in_stock WHERE PortID = " + PortID);
                                              db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + PortID, 
                                                function (err, port_invest_in_stock_rows) {

                                                  console.log("SELECT * FROM activity_records WHERE IndivID = " + IndivID + " AND PortID = " + PortID + " AND Action = 'buy'");
                                                  db.all("SELECT * FROM activity_records WHERE IndivID = " + IndivID + " AND PortID = " + PortID + " AND Action = 'buy'",
                                                    function (err, activity_rows) {
                                                        // orig amount of investment within fund
                                                         orig_amt = activity_rows[0].Amt_of_Activity;
                                                         console.log("Original amt of investment: " + orig_amt);
                                                         // Percent held in portfolio
                                                         percent_held_in_port = orig_amt / (portfolios[PortID].Cash + portfolios[PortID].Value);
                                                         console.log("Percent share of port for " + IndivID + " is " + percent_held_in_port);
                                                         console.log("Portfolios current total before sell is " + (portfolios[PortID].Cash + portfolios[PortID].Value));
                                                         console.log("%tage held by " + IndivID + " in " + PortID + " is percent_held_in_port : " + percent_held_in_port);

                                                        // portfolio holds stock
                                                        // ELSE portfolio does not have stocks so just decrement its cash value
                                                        if (port_invest_in_stock_rows.length != 0) {

                                                          indiv_port_total = 0;
                                                          tot_percent_of_port_invest_in_stocks = 0;

                                                          for (var i = 0; i < port_invest_in_stock_rows.length; i++) {
                                                            StockID = port_invest_in_stock[i].StockID;
                                                            

                                                            db.get("SELECT * FROM quotes WHERE StockID = " + StockID + " AND Date = '" + correctDate + "' AND Action = 'sell'",
                                                              function(err, quote) {
                                                                curr_stock_price = quote.AdjClose;

                                                                if (activity_rows.Date_of_Activity.indexOf('/') > 0) {
                                                                  var parsedDate = sell_date.split('/');
                                                                  if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                                                                    correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                                                                  } else {
                                                                    correctDate = parsedDate[2] + "-"; 
                                                                  }

                                                                  if (parsedDate[0] < 10)
                                                                    correctDate = correctDate + "0" + parsedDate[0] + "-";
                                                                  else
                                                                    correctDate = correctDate + parsedDate[0] + "-";

                                                                  if (parsedDate[1] < 10)
                                                                    correctDate = correctDate + "0" + parsedDate[1];
                                                                  else
                                                                    correctDate = correctDate + parsedDate[1];

                                                                } else if (sell_date.indexOf('-') > 0) {
                                                                  correctDate = sell_date;
                                                                }

                                                                db.get("SELECT * FROM quotes WHERE StockID = " + StockID + " AND Date = '" + correctDate + "' AND Action = 'buy'",
                                                                  function(err, old_quote) {
                                                                    old_stock_price = old_quote.AdjClose;

                                                                    db.get("SELECT * FROM port_invest_in_stock WHERE StockID = " + StockID + " AND PortID = " + PortID,
                                                                      function(err, port_invest_in_stock) {
                                                                        port_pct_in_stock = port_invest_in_stock.Percent;
                                                                        appreciationRate = curr_stock_price / old_stock_price;
                                                                        port_curr_val = portfolios[PortID].cash + portfolios[PortID].value;
                                                                        tot_percent_of_port_invest_in_stocks += port_pct_in_stock;

                                                                        indiv_port_total += port_pct_in_stock * port_curr_val * percent_held_in_port * appreciationRate;


                                                                        // On the last stock
                                                                        if (i == port_invest_in_stock_rows.length - 1) {
                                                                          portfolios[PortID].value -= indiv_port_total;
                                                                          portfolios[PortID].cash -= port_curr_val * (1 - tot_percent_of_port_invest_in_stocks) * percent_held_in_port;

                                                                          indiv_port_total += port_curr_val * (1 - tot_percent_of_port_invest_in_stocks) * percent_held_in_port;

                                                                          individuals[IndivID].value -= orig_amt;
                                                                          individuals[IndivID].cash += indiv_port_total;

                                                                          /*db.run("UPDATE portfolio SET Cash = " +  portfolios[name_rows[0].PortID].cash + ", Value = " +  portfolios[name_rows[0].PortID].value
                                                            + " WHERE PortID = " + name_rows[0].PortID);*/

                                                                          db.run("UPDATE portfolio SET Cash = " + portfolios[PortID].cash + ", Value = " + portfolios[PortID].value + " WHERE PortID = " + PortID);
                                                                          db.run("UPDATE individual SET Cash = " + individuals[IndivID].cash + " WHERE IndivID = " + IndivID);
                                                                          db.run("UPDATE individual SET Value = " + individuals[IndivID].value + " WHERE IndivID = " + IndivID);
                                                                          db.run("DELETE FROM indiv_invest_in_port WHERE IndivID = " + IndivID + " AND PortID = " + PortID);
                                                                        }
                                                                      });

                                                                  });
                                                              });
                                                          }

                                                        } else {
                                                          // updating cash and value of portfolio & individual who has now sold his share of the fund
                                                          individuals[IndivID].cash += orig_amt;
                                                          individuals[IndivID].value -= orig_amt;
                                                          portfolios[PortID].cash -= orig_amt;
                                                          portfolios[PortID].cash_from_indivs -= orig_amt;

                                                           // updating cash and value of portfolio & individual who has now sold his share of the fund
                                                          db.run("UPDATE individual SET Cash = " + individuals[IndivID].cash + ", Value = " + individuals[IndivID].value + " WHERE IndivID = " + IndivID);
                                                          db.run("UPDATE portfolio SET Cash = " + portfolios[PortID].cash);
                                                        }
                                                    })
                                                  
                                                });
                                            }
                                        });
                                        console.log("WE MADE IT TO THE END");
                                        if ((row+1) < jsonObj.length) {
                                           rowLoop(row+1);
                                        } else {
                                           processFile(i+1);
                                        }
                                      }
                                  }); // end select from indiv_invest_in_stock
                                  
                                  
                                } else {
                                  rowLoop(row+1);
                                } //end if indiv_rows.length != 0
                              });// end select individ from individual

                          }//end else for seller is an individual
                      }); // end select from portfolio
                    } // end regex check
                  }); // end serialize
                } // end action == sell

                  if (action == 'sellbuy') {
                    if ((row+1) < jsonObj.length) {
                      rowLoop(row+1);
                    } else {
                      processFile(i+1);
                    }
                  }
                } // end of if statement 
              } // end of rowLoop() function
              rowLoop(0);
              socket.emit('finished-upload', file.name);
              // processFile(i+1);
          }); // end of csvConverter
          //read from file
          fileStream.pipe(csvConverter);
        }); // end of exec statement
      } else {        
        console.log('Uploaded all scripts to the database');
      } // end of if statement
    } // end of processFile() function
    processFile(0);
  });
});

// Calculating total return on individual
function totalReturnIndividual(IndivID, callback) {
  db.serialize(function(){
  var total_return = 0;
  var tempPercent;
  // querying for all the portfolios the individual invested in
  db.all("SELECT * FROM indiv_invest_in_port WHERE IndivID = " + IndivID + "", function (err, rows) {
    console.log('in db');
    // iterating through portfolios owned
    var indiv_total = 0;
    var portStocksTotal = 0;

    function portfolioLoop(i) {
      if (i < rows.length) {
        var portID = Number(rows[i].PortID),
           // port_total_value = portfolios[portID].value + portfolios[portID].cash + portfolios[portID].cash_from_indivs;
           port_total_value = portfolios[portID].value + portfolios[portID].cash;
           // portStocksTotal = 0;
           
           // querying for all stocks the portfolio invested in
        db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + portID, function (err, stock_rows){

          function stocksLoop(j) {
            // iterating through the stocks of this portfolio
            // for (var j = 0; j < stock_rows.length; j++){
            if (j < stock_rows.length) {
              // Need to ensure date is valid | querying for old_stock_price in quotes
              var invest_in_stock_date = stock_rows[j].Port_Invest_In_Stock_Date;
              var correctDate; 

              if (invest_in_stock_date.indexOf('/') > 0) {
                var parsedDate = invest_in_stock_date.split('/');
                if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                  correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                } else {
                  correctDate = parsedDate[2] + "-"; 
                }

                if (parsedDate[0] < 10)
                  correctDate = correctDate + "0" + parsedDate[0] + "-";
                else
                  correctDate = correctDate + parsedDate[0] + "-";

                if (parsedDate[1] < 10)
                  correctDate = correctDate + "0" + parsedDate[1];
                else
                  correctDate = correctDate + parsedDate[1];

              } else if (invest_in_stock_date.indexOf('-') > 0) {
                correctDate = invest_in_stock_date;
              }
              tempPercent = stock_rows[j].Percent;
              console.log('correctDate: ' + correctDate);
              db.all("SELECT * FROM quotes WHERE StockID = '" + stock_rows[j].StockID + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1",
                 function (err, old_quote_rows){
                  console.log("SELECT * FROM quotes WHERE StockID = '" + stock_rows[j].StockID + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1");
                var old_stock_price = Number(old_quote_rows[0].AdjClose);
                
                // querying for new_stock_price in quotes
                db.all("SELECT * FROM quotes WHERE StockID = '" + old_quote_rows[0].StockID + "' AND Date = '2013-12-31'", 
                 function (err, new_quote_rows){
                   // calculation of total return for this stock of the portfolio
                  var new_stock_price = Number(new_quote_rows[0].AdjClose);
                  var appreciationRate = new_stock_price/old_stock_price;
                  console.log('appreciation rate is new_stock: ' + new_stock_price + ' divided by old stock: ' + old_stock_price);
                  console.log('percent: ' + tempPercent + ', portfolio total value: ' + port_total_value + ', appreciationRate: ' + appreciationRate);
                  var addThis = tempPercent * port_total_value * appreciationRate;
                  portStocksTotal += addThis;
                  console.log('addThis: ' + addThis);
                  console.log('portStocksTotal after addThis: '+ portStocksTotal);
                  if ((j+1) < stock_rows.length) {
                    stocksLoop(j+1);
                  } else {
                   addCash();
                  }
                });    
              });
            } // end of if check
          } //end of stocksLoop()
          stocksLoop(0);
          function addCash() {
           portStocksTotal += portfolios[portID].cash;
           console.log('portfolios cash value: ' + portfolios[portID].cash);
           console.log('after adding cash: ' + portStocksTotal);
           db.all("SELECT * FROM activity_records WHERE Port_Invested_In = " + portID + " AND IndivID = " + IndivID + "",
             function (err, amt_rows){
              if (amt_rows) {
                var amount = amt_rows[0].Amt_of_Activity;
                var indiv_port_value = (amount / port_total_value) * portStocksTotal;
                indiv_total += indiv_port_value;
                console.log('indiv total: ' + indiv_total);
                if ((i+1) < rows.length) {
                  portfolioLoop(i+1);
                } else {
                  queryStocksIndividualOwns();
                }
              } else {
                console.log("SELECT * FROM activity_records WHERE Port_Invested_In = " + portID + " AND IndivID = " + IndivID + " was unsuccessful");
              }
            });  
          } // end of addCash()
        }); // end of portfolioLoop's db.all
      } // end of if check
    } // end of portfolioLoop()
    portfolioLoop(0);
    if (rows.length == 0) { // if no stocks
      queryStocksIndividualOwns();
    }

    function queryStocksIndividualOwns() {
       // querying for all the stocks that this individual owns
       db.all("SELECT * FROM indiv_invest_in_stock WHERE IndivID = " + IndivID + "",
             function (err, indiv_stock_rows) {
          console.log('query for all stocks that individual owns: ' + indiv_stock_rows.length);
          var indiv_stock_total = 0;

          function stockQuery(k) {
            // for (var k = 0; k < indiv_stock_rows.length; k++) {
            if (k < indiv_stock_rows.length) {

            var invest_in_stock_date = indiv_stock_rows[k].Invest_In_Stock_Date;
            var correctDate; 

            if (invest_in_stock_date.indexOf('/') > 0) {
              var parsedDate = invest_in_stock_date.split('/');
              if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
              } else {
                correctDate = parsedDate[2] + "-"; 
              }

              if (parsedDate[0] < 10)
                correctDate = correctDate + "0" + parsedDate[0] + "-";
              else
                correctDate = correctDate + parsedDate[0] + "-";

              if (parsedDate[1] < 10)
                correctDate = correctDate + "0" + parsedDate[1];
              else
                correctDate = correctDate + parsedDate[1];

            } else if (invest_in_stock_date.indexOf('-') > 0) {
              correctDate = invest_in_stock_date;
            }

            db.all("SELECT * FROM quotes WHERE StockID = '" + indiv_stock_rows[k].StockID + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1",
              function (err, old_quote_rows) {
              var old_stock_price = Number(old_quote_rows[0].AdjClose);
              console.log('old stock price: ' + old_stock_price);
               
               // querying for new_stock_price in quotes
               db.all("SELECT * FROM quotes WHERE StockID = '" + old_quote_rows[0].StockID + "' AND Date = '2013-12-31'", 
                 function (err, new_quote_rows){
                  if (err) {
                    console.log(err);
                  }
                   // calculation of total return for this stock of the portfolio
                   
                   var new_stock_price = Number(new_quote_rows[0].AdjClose);
                   console.log('new stock price: ' + new_stock_price);
                   var appreciationRate = new_stock_price/old_stock_price;
                   console.log('appreciation rate: ' + appreciationRate);    

                   db.all("SELECT * FROM activity_records WHERE IndivID = " + IndivID + " AND Stock_Invested_In = '" + new_quote_rows[0].StockID + "'",
                          function(err, activity_rows) {
                            var amt_of_investment = activity_rows[0].Amt_of_Activity;
                            console.log('investment amg (' + amt_of_investment + ') * appreciation (' + appreciationRate + ')');
                            indiv_total += amt_of_investment * appreciationRate;

                            console.log("indiv total is " + indiv_total + " after adding amt of investment with appreciation " + (amt_of_investment * appreciationRate));
                            if ((k+1) < indiv_stock_rows.length) {
                                stockQuery(k+1);
                            } else {
                              finalStep();
                            }
                   }); // end of select from activity_record 
                }); // end of select from quotes where date='2013-12-31'
              }); // end of select from quotes where order by date limit 1
            } // end of stocks loop (close if statement)
          } // end of stockQuery() function
          stockQuery(0);
          if (indiv_stock_rows.length == 0) {
            finalStep();
          }
      }); // end of select indiv_invest_in_stock
    } // end of queryStocksIndividualOwns() function

    function finalStep() {
       // adding cash to individual's total
       indiv_total += individuals[IndivID].cash;
       console.log('indiv total added cash : ' + indiv_total);

       db.all("SELECT * FROM activity_records WHERE Action = 'individual' AND IndivID = " + IndivID, function (err, init_rows) {
         if (init_rows && init_rows[0]) {
           var orig_amt = Number(init_rows[0].Amt_of_Activity);
           console.log('total return is indiv total: ' + indiv_total + ' / orig _ amount : ' + orig_amt);
           total_return = indiv_total / orig_amt;
           callback(total_return);
           // db.run("UPDATE individual SET Total_Return = " + total_return + " WHERE IndivID = " + IndivID);
         } else {
          console.log("SELECT * FROM activity_records WHERE Action = 'individual' AND IndivID = " + IndivID + " was unsuccessful");
          callback(total_return);
         }
       }); // end of db.all 
     } // end of finalStep()
    }); // end of initial db.all
    // console.log('at end :(');
    // callback(total_return);
  }); // end of serialize
}

function totalReturnPortfolio (PortID, callback) {
    // var port_stock_rows_temp;
    db.serialize(function(){
     // querying for all the stocks that this portfolio
     var port_total = 0
         , port_total_value = portfolios[PortID].value + portfolios[PortID].cash;
    
      var port_stock_total = 0;
       db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + Number(PortID),
           function (err, port_stock_rows) {
              if (port_stock_rows && port_stock_rows.length > 0) {
                function portInvestInStockLoop(k) {
                  if (k < port_stock_rows.length) {

                    var invest_in_stock_date = port_stock_rows[k].Port_Invest_In_Stock_Date;
                    var correctDate; 

                    if (invest_in_stock_date.indexOf('/') > 0) {
                      var parsedDate = invest_in_stock_date.split('/');
                      if (isNaN(parseInt(parsedDate[2][parsedDate[2].length-1]))) {
                        correctDate = parsedDate[2].substring(0,parsedDate[2].length-1) + "-";
                      } else {
                        correctDate = parsedDate[2] + "-"; 
                      }

                      if (parsedDate[0] < 10)
                        correctDate = correctDate + "0" + parsedDate[0] + "-";
                      else
                        correctDate = correctDate + parsedDate[0] + "-";

                      if (parsedDate[1] < 10)
                        correctDate = correctDate + "0" + parsedDate[1];
                      else
                        correctDate = correctDate + parsedDate[1];

                    } else if (invest_in_stock_date.indexOf('-') > 0) {
                      correctDate = invest_in_stock_date;
                    }

                    db.all("SELECT * FROM quotes WHERE StockID = '" + port_stock_rows[k].StockID + "' AND Date >= '" + correctDate + "' ORDER BY Date LIMIT 1",
                           function (err, old_quote_rows) {

                            var old_stock_price = Number(old_quote_rows[0].AdjClose);
                            console.log("old stock price: " + old_stock_price);
                             // querying for new_stock_price in quotes
                             db.all("SELECT * FROM quotes WHERE StockID = '" + old_quote_rows[0].StockID + "' AND Date = '2013-12-31'", 
                                   function (err, new_quote_rows){
                                   // calculation of total return for this stock of the portfolio
                                   var new_stock_price = Number(new_quote_rows[0].AdjClose);
                                   console.log('new stock price: ' + new_stock_price);
                                   var appreciationRate = new_stock_price/old_stock_price;
                                   console.log('appreciationRate : ' + appreciationRate);
                                   
                                   db.all("SELECT * FROM port_invest_in_stock WHERE PortID = " + PortID + " AND StockID='" + new_quote_rows[0].StockID + "'",
                                          function(err, activity_rows) {
                                            var amt_of_investment = activity_rows[0].Percent * port_total_value;
                                            console.log('finding amt of investment from percent (' +  activity_rows[0].Percent + ') * port_total_value (' + port_total_value + ')');
                                            console.log('amt of investment: ' + amt_of_investment);
                                            port_stock_total += amt_of_investment * appreciationRate; 
                                            if ((k+1) < port_stock_rows.length) {
                                              portInvestInStockLoop(k+1);
                                            } else {
                                              portBuy();
                                            }
                                   });
                            });    
                    });

                  } // end of if statement
                } // end of portInvestInStock() function
                portInvestInStockLoop(0);

                function portBuy() {
                  // adding cash not invested to portfolio
                  console.log('add cash not invested to portfolio: ' + portfolios[PortID].cash);
                  port_stock_total += portfolios[PortID].cash;
                  db.all("SELECT * FROM activity_records WHERE Action = 'buy' AND Port_Invested_In = " + PortID, 
                    function (err, indiv_rows) {
                      var pctOfPort = 1;

                      function portSell(i) { 
                        if (i < indiv_rows.length) {
                          var indiv = indiv_rows[i].IndivID;

                          db.all("SELECT * FROM activity_records WHERE Action = 'sell' AND Port_Invested_In = " + PortID + " AND IndivID = " + indiv,
                            function(err, indiv_sold_rows) {
                              if (indiv_sold_rows.length == 0) {
                                pctOfPort -= (indiv_rows[i].Amt_of_Activity) / port_total_value;
                                console.log('indiv did not sell, percent of port: ' + pctOfPort);
                              }
                              if ((i+1) < indiv_rows.length) {
                                portSell(i+1);
                              } else {
                                console.log("multiply port_stock_total " + port_stock_total + " by pctOfPort " + pctOfPort);
                                port_stock_total *= pctOfPort;
                                console.log('port stock total multiplied by pct of port. new port stock: ' + port_stock_total);
                                portFund();
                              }
                            });
                        }
                      } // end of portSell() function
                      portSell(0);
                      if (indiv_rows.length == 0) {
                        portFund();
                      }
                  });
                }

                function portFund() {
                  db.all("SELECT * FROM activity_records WHERE Action = 'fund' AND PortID = " + PortID, 
                    function (err, orig_port_rows) {
                      port_stock_total /= orig_port_rows[0].Amt_of_Activity;
                      console.log("Portfolio's total return: " + port_stock_total);
                      callback(port_stock_total);
                  });
                } // end of portFund() function
               // port_stock_total += portfolios[PortID].cash + portfolios[PortID].cash_from_indivs;
       } else { // end of if statement
          console.log('select from port_invest_in_stock where PortID = ' + PortID + ' was unsuccessful');
       }
     }); // end of first db.all
   });
}

// NEED TO FIX STILL .. ALL INDIVIDUALS MUST BE RANKED IN TERMS OF TOTAL NET_WORTH
function majorityParticipants() {
  var mPs = [];
  
  db.all("SELECT * FROM portfolio", function(err, port_rows) {
    for (var i = 0; i < port_rows.length; i++) {
      var PortID = port_rows[i].PortID;
      
      db.all("SELECT Amt_of_Activity, portfolio.Name \"portName\", individual.Name \"indivName\" FROM activity_records, portfolio, individual WHERE Port_Invested_In = " + PortID + 
      "AND Action = 'buy' AND EXISTS(SELECT IndivID FROM indiv_invest_in_port WHERE PortID = " + PortID + ") AND portfolio.PortID = " + PortID + 
             " AND individual.IndivID = activity_records.IndivID ORDER BY Amt_of_Activity DESC;",
        function(err, activity_rows){
          var maxAmount = activity_rows[0].Amt_of_Activity, 
              currAmount = maxAmount,
              numParticipants = 0,
              index = 0,
              majorityParticipants = [],
              port = activity_rows[0].portName;
          
          while (currAmount == maxAmount){
            numParticipants++;
            index++;
            currAmount = activity_rows[index].Amt_of_Activity;
          }
          
          for (var j = 0; j < numParticipants; j++){
            majorityParticipants.push(activity_rows[j].indivName);
          }
          

          // pushing an object where obj.fund = portfolio and obj.majority = array of individual's names who have highest (can be more than 1)
          mPs.push( { fund: port, majority: majorityParticipants })
      });
      
    } // end of looping through portfolios
    
  }); // select * from portfolios end
  
  return mPs;
}

// ranks Portfolios by Net_Worth
function rankPortfoliosByNetWorth() {
  db.all("SELECT Name, Net_Worth FROM portfolio ORDER BY Net_Worth", function (err, port_rows) {
    return port_rows;
  });
}

// ranks Individuals by Net_Worth
function rankIndividualsByNetWorth() {
  db.all("SELECT Name, Net_Worth FROM individual ORDER BY Net_Worth", function (err, indiv_rows) {
    return indiv_rows;
  });
}


//SELECT I1.Name, (SELECT count(*) + 1 FROM individual as I2 WHERE I1.Net_Worth < I2.Net_Worth) "Rank"
 //
//FROM individual "I1" WHERE I1.IndivID = 0;

// ADD numeric Risk attribute to company table!!!... also need to serialize... Alexa help again
// updates Risk for every valid company, after running this, need to query company table for top 5 lowest
function lowRiskStocks(){
  db.serialize(function(){
    //get all companies/stockids
    db.all("SELECT StockID FROM quotes GROUP BY StockID", function(err, stock_rows){
      // console.log(stock_rows);
      var numStocks = stock_rows.length;

      //loop through all companies
      function loopThroughStocks(i) { 
        if (i < numStocks) {
          var StockID = stock_rows[i].StockID;
          console.log(StockID);
          //get all stock prices for a company in order of date
          db.all("SELECT StockID, Date, AdjClose FROM quotes WHERE StockID = '" + StockID +"' ORDER BY Date", function(err, price_rows){
            console.log("SELECT StockID, Date, AdjClose FROM quotes WHERE StockID = '" + StockID +"' ORDER BY Date");
            var numPrices = price_rows.length,
                maxDrop = 0,
                previousHigh = price_rows[0].AdjClose;
            //find maximum drop percentage
            function findMaxDropPercentage(j) {
              if (j < numPrices) {
                if (price_rows[j].AdjClose > previousHigh){ //new high, get previous price to compute drop with previous
                  var currDrop = 1 - (price_rows[j-1].AdjClose / previousHigh);
                  if (currDrop > maxDrop){
                    maxDrop = currDrop;
                  }
                  previousHigh = price_rows[j].AdjClose;
                }
                if ((j+1) < numPrices) {
                  findMaxDropPercentage(j+1);
                } else {
                  //update in database
                  db.run("UPDATE company SET Risk = " + maxDrop + " WHERE StockID = '" + StockID + "'");
                  console.log("UPDATE company SET Risk = " + maxDrop + " WHERE StockID = '" + StockID + "'");
                  loopThroughStocks(i+1);
                }
              } // end of inner if statement
            } // end of findMaxDropPercentage() function
            findMaxDropPercentage(0);
          }); // end select adjclose from quotes
        } // end of outer if statement
      } // end of loopThroughStocks() function
      loopThroughStocks(0);
    }); // end select stockid
  }); // end serialize
}

