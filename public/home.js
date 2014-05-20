var socket
, files = []
, filesData = []
, finishedUpload = [];

/* 
 * home.js contains our front-end Javascript code, which displays links the user's selections
 * and clicks to queries made to the back-end, through websocket messages. These messages are queried
 * in server.js, and the query responses are sent back as objects/arrays to home.js, which then displays
 * them in a tabular format for the user.
 *
 * home.js also contains a way to upload CSV files and sent their data to server.js, which then
 * uploads that information into the database and performs further calculations.
 * 
 * Further comments are made at the top of server.js.
 * 
 */

$(function() {
	if (io) {
		socket = io.connect('/user');
		socket.on('connected', function() {
		});

		socket.on('finished-upload', function (file) {
			finishedUpload.push(file);
			if (finishedUpload.length == files.length) {
				var uploadedFiles = finishedUpload.join(", ");
				$('#upload-success').text(uploadedFiles + ' successfully downloaded!');
				files = [];
				finishedUpload = [];
			}
		});

		/*
		 * Detecting files. 
		 * Source: http://code.tutsplus.com/tutorials/how-to-create-a-resumable-video-uploade-in-node-js--net-25445
		 */
		$('#file').change(selectFile);

		function queryStocks() {
			// List from http://424.kelehers.me/project/s_and_p.txt
			var stockNames = ["MMM", "ABT", "ACE", "ACN", "ACT", "ADBE", "AES", "AET", "AFL", "A", 
				"GAS", "APD", "ARG", "AKAM", "AA", "ALXN", "ATI", "AGN", "ADS", "ALL", "ALTR", "MO", 
				"AMZN", "AEE", "AEP", "AXP", "AIG", "AMT", "AMP", "ABC", "AME", "AMGN", "APH", "APC", 
				"ADI", "AON", "APA", "AIV", "AAPL", "AMAT", "ADM", "AIZ", "T", "ADSK", "ADP", "AN", "AZO", 
				"AVB", "AVY", "AVP", "BHI", "BLL", "BAC", "BK", "BCR", "BAX", "BBT", "BEAM", "BDX", "BBBY", 
				"BMS", "BBY", "BIIB", "BLK", "HRB", "BA", "BWA", "BXP", "BSX", "BMY", "BRCM", "CHRW", "CA", 
				"CVC", "COG", "CAM", "CPB", "COF", "CAH", "KMX", "CCL", "CAT", "CBG", "CBS", "CELG", "CNP", 
				"CTL", "CERN", "CF", "SCHW", "CHK", "CVX", "CMG", "CB", "CI", "CINF", "CTAS", "CSCO", "C", 
				"CTXS", "CLF", "CLX", "CME", "CMS", "COH", "KO", "CCE", "CTSH", "CL", "CMCSA", "CMA", "CSC", 
				"CAG", "COP", "CNX", "ED", "STZ", "GLW", "COST", "COV", "CCI", "CSX", "CMI", "CVS", "DHI", 
				"DHR", "DRI", "DVA", "DE", "DAL", "DNR", "XRAY", "DVN", "DO", "DTV", "DFS", "DISCA", "DLTR", 
				"D", "DOV", "DOW", "DTE", "DD", "DUK", "DNB", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", 
				"EW", "EA", "EMC", "EMR", "ESV", "ETR", "EOG", "EQT", "EFX", "EQR", "EL", "EXC", "EXPE", "EXPD", 
				"ESRX", "XOM", "FFIV", "FDO", "FAST", "FDX", "FIS", "FITB", "FSLR", "FE", "FISV", "FLIR", "FLS", 
				"FLR", "FMC", "FTI", "F", "FRX", "FOSL", "BEN", "FCX", "FTR", "GME", "GCI", "GPS", "GRMN", "GD", 
				"GE", "GIS", "GPC", "GNW", "GILD", "GS", "GT", "GOOG", "GWW", "HAL", "HOG", "HAR", "HRS", "HIG", 
				"HAS", "HCP", "HCN", "HP", "HES", "HPQ", "HD", "HON", "HRL", "HSP", "HST", "HCBK", "HUM", "HBAN", 
				"ITW", "IR", "TEG", "INTC", "ICE", "IBM", "IGT", "IP", "IPG", "IFF", "INTU", "ISRG", "IVZ", 
				"IRM", "JBL", "JEC", "JNJ", "JCI", "JOY", "JPM", "JNPR", "KSU", "K", "KEY", "KMB", "KLAC", "KSS", 
				"KR", "LB", "LLL", "LH", "LRCX", "LM", "LEG", "LEN", "LUK", "LLY", "LNC", "LLTC", "LMT", "L", 
				"LOW", "LSI", "MTB", "MAC", "M", "MRO", "MAR", "MMC", "MAS", "MA", "MAT", "MKC", "MCD", "MHFI", 
				"MCK", "MWV", "MDT", "MRK", "MET", "MCHP", "MU", "MSFT", "MHK", "TAP", "MDLZ", "MON", "MNST", 
				"MCO", "MS", "MOS", "MSI", "MUR", "MYL", "NBR", "NDAQ", "NOV", "NTAP", "NFLX", "NWL", "NFX", 
				"NEM", "NEE", "NKE", "NI", "NE", "NBL", "JWN", "NSC", "NTRS", "NOC", "NU", "NRG", "NUE", 
				"NVDA", "ORLY", "OXY", "OMC", "OKE", "ORCL", "OI", "PCG", "PCAR", "PLL", "PH", "PDCO", "PAYX", 
				"BTU", "PNR", "PBCT", "POM", "PEP", "PKI", "PRGO", "PETM", "PFE", "PNW", "PXD", "PBI", "PCL", 
				"PNC", "RL", "PPG", "PPL", "PX", "PCP", "PCLN", "PFG", "PG", "PGR", "PLD", "PRU", "PSA", "PHM", 
				"PVH", "PWR", "QCOM", "DGX", "RRC", "RTN", "RHT", "REGN", "RF", "RSG", "RAI", "RHI", "ROK", 
				"COL", "ROP", "ROST", "RDC", "R", "SWY", "CRM", "SNDK", "SCG", "SLB", "STX", "SEE", "SRE", "SHW", 
				"SIAL", "SPG", "SLM", "SJM", "SNA", "SO", "LUV", "SWN", "SE", "STJ", "SWK", "SPLS", "SBUX", "HOT",
				"STT", "SRCL", "SYK", "STI", "SYMC", "SYY", "TROW", "TGT", "TEL", "TE", "THC", "TDC", "TSO", 
				"TXN", "TXT", "HSY", "TRV", "TMO", "TIF", "TWX", "TWC", "TJX", "TMK", "TSS", "TSCO", "RIG", 
				"FOXA", "TSN", "TYC", "USB", "UNP", "UNH", "UPS", "X", "UTX", "UNM", "URBN", "VFC", "VLO", "VAR",
				"VTR", "VRSN", "VZ", "VRTX", "VIAB", "VNO", "VMC", "WMT", "WAG", "DIS", "GHC", "WM", "WAT", "WLP",
				"WFC", "WDC", "WU", "WY", "WHR", "WFM", "WMB", "WIN", "WEC", "WYN", "WYNN", "XEL", "XRX", "XLNX",
				"XL", "YHOO", "YUM", "ZMH", "ZION"];
			stockNames.sort();
			var string = '';
			for (var i = 0; i < stockNames.length; i++) {
				var val = stockNames[i];
				string += '<option value="' + val + '">' + stockNames[i] + '</option>';
			}
			$('#stock-select, #stock1-select, #stock2-select').empty().append(string);

			$('#start-date, #start-date2, #end-date, #end-date2').datepicker(
				{ 
					minDate : new Date(2005, 0, 1), 
					maxDate : new Date(2013, 11, 31),
					changeMonth : true,
      				changeYear : true
				}
			);
		}
		queryStocks();
	}
});

/*
 * Converts any table result to a downloadable CSV
 * Source: http://www.apnacode.com/jquery/how-to-export-html-table-to-csv-using-jquery/
 */
function exportToCSV() {
	var csv = $("#table").table2CSV( { delivery : 'value' } );
	window.location.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csv);
}

// Hides other divs, shows current div, and clears table
function replaceDivs(show_div) {
	$('#table').empty();
	var divs = ['#show-ports', '#show-indivs', '#show-stocks', '#rank-ports', '#rank-indivs', '#rank-stocks', '#compare-stocks'];
	for (var i = 0; i < divs.length; i++) {
		var currDiv = divs[i];
		if (currDiv != show_div) {
			$(currDiv).hide();
		}
	}
	$(show_div).show();
}

// Requests server.js for portfolio and individual names, which are shown in a dropdown for the user
function requestPortIndivNames(type, selectDiv, divToShow) {
	var request;
	var reply;
	if (type == 'port') {
		request = 'request-portfolio-names';
		reply = 'reply-portfolio-names';
	} else if (type == 'individual') {
		request = 'request-individual-names';
		reply = 'reply-individual-names';
	}
	socket.emit(request);
	socket.on(reply, function(portNames) {
		var string; 
		if (type == 'individual') {
			string = '<option value="All_Individuals">All Individuals</option>';
		} else if (type == 'port') {
			string = '<option value="All_Portfolios">All Portfolios</option>';
		}
		for (var i = 0; i < portNames.length; i++) {
			var val = portNames[i].Name;
			string += '<option value="' + val + '">' + val + '</option>';
		}
		$(selectDiv).empty().append(string);
		replaceDivs(divToShow);
	});
}

// Detects what the user selected from Show, Compare, Rank and Stocks, Individuals, Portfolios
function behaviorSelect() {
	var behavior = $('#behavior-select').val();
	var stockPort = $('#stockport-select').val();
	// Show tables
	if (behavior == 'show') {
		if (stockPort == 'stock') {
			replaceDivs('#show-stocks');
		} else if (stockPort == 'port') {
			requestPortIndivNames('port', '#port-select', '#show-ports');
		} else {
			requestPortIndivNames('individual', '#indiv-select', '#show-indivs');
		}
	// Rank individuals/portfolios
	} else if (behavior == 'rank') {
		if (stockPort == 'port') {
			replaceDivs('#rank-ports');
		} else if (stockPort == 'individual') {
			replaceDivs('#rank-indivs');
		} else {
			replaceDivs('#rank-stocks');
		}
	// Compare tables
	} else {
		if (stockPort == 'stock') {
			replaceDivs('#compare-stocks');
		}
	}
}

/*
 * Dropdown of all stocks in the database, start and end date choices, and a 
 * submit button to display results in a table 
 */
function showStocksSelect() {
	// Convert date to same format as stored in SQL database
	function dateFormat(date) {
		var string = date.getFullYear() + '-';
		var month = date.getMonth() + 1;
		month < 10 ? string += ('0' + month) : string += month;
		string += '-';
		var day = date.getDate();
		day < 10 ? string += ('0' + day) : string += day;
		return string;
	}
	var stock = $('#stock-select').val();
	var startDate = new Date($('#start-date').val());
	var endDate = new Date($('#end-date').val());
	socket.emit('show-stocks', 
		{ stock : stock, start : dateFormat(startDate), end : dateFormat(endDate) });
	socket.on('show-stocks-output', function(rows) {
		$('#table').empty().append('<tr><th>Date</th><th>Open</th><th>High</th>' +
			'<th>Low</th><th>Close</th><th>Volume</th><th>AdjClose</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'StockID') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}
	});
}

/*
 * Two dropdowns of stocks in the database, start and end date choices, and a 
 * submit button to display side-by-side results of stocks and their AdjClose 
 * between those two dates.
 */

function compareStocksSelect() {
	// Convert date to same format as stored in SQL database
	function dateFormat(date) {
		var string = date.getFullYear() + '-';
		var month = date.getMonth() + 1;
		month < 10 ? string += ('0' + month) : string += month;
		string += '-';
		var day = date.getDate();
		day < 10 ? string += ('0' + day) : string += day;
		return string;
	}
	var stock1 = $('#stock1-select').val();
	var stock2 = $('#stock2-select').val();
	var startDate = new Date($('#start-date2').val());
	var endDate = new Date($('#end-date2').val());
	socket.emit('compare-stocks', 
		{ stock1 : stock1, stock2 : stock2, start : dateFormat(startDate), end : dateFormat(endDate) });
	socket.on('compare-stocks-output', function(obj) {
		var rows1 = obj.stock1, rows2 = obj.stock2;
		$('#table').empty().append('<tr><th>' + stock1 + ' Date</th><th>' + stock1 + ' AdjClose</th><th>' + stock2 + ' Date</th>' +
			'<th>' + stock2 + ' AdjClose</th></row>');
		for (i in rows1) {
			var row1 = rows1[i];
			var rowString = '<tr>';
			for (j in row1) {
				rowString += '<td>' + row1[j] + '</td>';
			}
			var row2 = rows2[i];
			for (j in row2) {
				rowString += '<td>' + row2[j] + '</td>';
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}
	});
}


// Dropdown of all portfolios in the database, and a submit button to display results in a table 
function showPortsSelect() {
	var port = $('#port-select').val();
	socket.emit('show-portfolios', { portfolio : port });
	socket.on('show-portfolios-output', function(rows) {
		$('#table').empty().append('<tr><th>Net Worth</th><th>Total_Return</th><th>Value</th><th>Cash</th>' +
			'<th>Name</th><th>Start_Date</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'PortID') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
}

// Dropdown of all individuals in the database, and a submit button to display results in a table 
function showIndivsSelect() {
	var indiv = $('#indiv-select').val();
	socket.emit('show-individuals', { individual : indiv });
	socket.on('show-individuals-output', function(rows) {
		$('#table').empty().append('<tr><th>Net_Worth</th><th>Total_Return</th><th>Value</th><th>Cash</th>' +
			'<th>Name</th><th>Start_Date</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'IndivID') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
}

/*
 * Rank stocks by strictly increasing prices, top five stocks with lowest risk, and annualized rate of return. 
 * Advanced queries on server.js side.
 */
function rankStocksSelect() {
	var selection = $('#rank-stocks-options').val();
	socket.emit('rank-stocks', selection);
	socket.on('rank-stocks-output', function(rows) {
		$('#table').empty().append('<tr><th>StockID</th><th>Date</th><th>AdjClose</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				rowString += '<td>' + row[j] + '</td>';
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
	socket.on('rank-stocks-risk-output', function(rows) {
		$('#table').empty().append('<tr><th>Risk</th><th>StockID</th><th>Name</th><th>Sector</th><th>Industry</th><th>Location</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'Annualized_Rate') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
	socket.on('rank-stocks-annualized-output', function(rows) {
		$('#table').empty().append('<tr><th>Annualized Rate</th><th>StockID</th><th>Name</th><th>Sector</th><th>Industry</th><th>Location</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'Risk') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
}

/*
 * Rank individuals by total return and final net worth. 
 * Advanced queries on server.js side.
 */
function rankIndivsSelect() {
	var selection = $('#rank-indiv-options').val();
	socket.emit('rank-individuals', selection);
	socket.on('rank-individuals-output', function(rows) {
		$('#table').empty().append('<tr><th>Net Worth</th><th>Total_Return</th><th>Name</th></row>');
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'IndivID' && j!= 'Value' && j!='Cash' && j != 'Start_Date') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
}

/*
 * Rank portfolios by total return, final net worth, and majority participants. 
 * Advanced queries on server.js side.
 */
function rankPortsSelect() {
	var selection = $('#rank-port-options').val();
	socket.emit('rank-portfolios', selection);
	socket.on('rank-portfolios-output', function(rows) {
		if (selection == 'Majority_Participants') {
			$('#table').empty().append('<tr><th>PortID</th><th>Majority</th><th>Ranks</th></row>');
		} else {
			$('#table').empty().append('<tr><th>Net Worth</th><th>Total_Return</th>' +
				'<th>Name</th></row>');
		}
		for (i in rows) {
			var row = rows[i];
			var rowString = '<tr>';
			for (j in row) {
				if (j != 'PortID' && j != 'Value' && j != 'Cash' && j != 'Start_Date') {
					rowString += '<td>' + row[j] + '</td>';
				}
			}
			rowString += '</tr>';
			$('#table').append(rowString);
		}	
	});
}


function selectFile(evt) {
	$('#upload-success').empty();
	files = evt.target.files;
}

/* Read from uploaded files.
 * Source: http://stackoverflow.com/questions/11829537/html5-filereader-how-to-return-result
 */
function readFiles(files, callback) {
	function readOneFile(i) {
	// for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var reader = new FileReader();
		reader.onload = function (evt) {
			filesData.push({ name : file.name, data : evt.target.result });
			// Once all of the file data has been added to the array, go to 
			// callback function, in order to pass scripts' data to the server
			if (filesData.length == files.length) {
				callback(filesData);
			} else {
				readOneFile(i+1);
			}
		};
		reader.readAsText(file);
	}
	readOneFile(0);
};

function uploadFile() {
	if ($('#file').val()) {
		readFiles(files, function(array) {
			console.log(array);
			socket.emit('upload', array);	
			filesData = [];			
		});
	} else {
		alert('Click "Choose File" to select a file.');
	}
}


// Refresh database from the new information that was added
function refreshDB() {
	socket.emit('clear-db');
}

// Additional calculations once everything has been added into the database
function calculateDB()() {
	socket.emit('calculate-db');
}
