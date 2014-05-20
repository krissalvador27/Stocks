#!/usr/bin/env ruby
require 'date'

fileName = ARGV[0]
originalFile = File.open(fileName, "r")
split = originalFile.read.split("\n")
originalFile.close

def sortDate(a,b)
	aSplit = a.split("/");
	bSplit = b.split("/");
	yearCompare = aSplit[2].to_i <=> bSplit[2].to_i
	if yearCompare != 0
		return yearCompare
	else 
		monthCompare = aSplit[0].to_i <=> bSplit[0].to_i
		if monthCompare != 0
			return monthCompare
		else
			return aSplit[1].to_i <=> bSplit[1].to_i
		end
	end 
end

sort = split.sort { |a,b| 
	dateA = a
	if a.rpartition(",")[-1].length == 1
		dateA = a.rpartition(",")[-3].rpartition(",")[-1]
	else
		dateA = a.rpartition(",")[-1]
	end
	dateB = b
	if b.rpartition(",")[-1].length == 1
		dateB = b.rpartition(",")[-3].rpartition(",")[-1]
	else
		dateB = b.rpartition(",")[-1]
	end
	sortDate(dateA,dateB)
}

puts sort


puts fileName
newFile = File.open(fileName, "w")
newFile.puts sort
newFile.close
puts "done!"