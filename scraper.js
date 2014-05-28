var dbName = "craigslist",
	collectionName = "jobListings";

var mongo = require('mongodb'),
	sprintf = require('sprintf'),
	moment = require('moment'),
	sms = require('./aws/awsConnection');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server("127.0.0.1", 27017, {auto_reconnect : true});

var db = new Db(dbName, server);

var request = require('request');
var cheerio = require('cheerio');

var url = "http://columbiamo.craigslist.org/search/web?query=+";
var baseUrl = "http://columbiamo.craigslist.org/web";

db.open(function(err, db) {
    if (!err) {
        console.log(sprintf("Connected to the %s database.", dbName.toString()));
        db.collection(collectionName, {strict : true}, function(err, collection) {
            if (err) {
                console.log(sprintf("The %s collection does not exist.", collectionName));
                db.createCollection(collectionName, function(err, result) {
                    if (err) {
                        console.log("The collection could not be created.");

                    }
                    else
                    {
                        console.log(sprintf("The collection %s was successfully created!", collectionName));
                    }
                });
            }
        });
    }
    else
    {
        console.log("There was an error connecting to the database.");
    }
});

/*
    request(url, (function(index) {return function(err, resp, body) {
        $ = cheerio.load(body);
        $('div.content span.pl').each(function(moreIndex))
    }}))


    request(url, (function(pool) { return function(err, resp, body) {
        $ = cheerio.load(body);
        $('#calendar .days td').each(function(day) {
            $(this).find('div').each(function() {
                event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');
                if (event.length >= 2 && (event[1].match(/open swim/i) || event[1].match(/family swim/i)))
                    console.log(pool + ',' + days[day] + ',' + event[0] + ',' + event[1]);
            });
        });
    }})(pool));
*/
var listings = new Array();

request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    
    $ = cheerio.load(body);
    $("div[class='content'] p[class='row']").each(function(index) {
        /*$(this).find("span[class='pl']").each(function() {
            event = $(this).text().trim();
            console.log(event);
        });

        $(this).find("span[class='l2']").each(function(i) {
            event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');
            console.log(event[0] + "");
        })*/


        event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');
        
        var a = $(this).find('a');
        var href = a.attr('href');
        
        if (event.length > 2) {

            //  Clean up date posted

            var dateString = event[0];

            dateString = dateString + ", " + moment().year();

            dateString = moment(dateString);





            var listing = {"datePosted" : {
                                "pureDate" : dateString.valueOf(),
                                "prettyDate" : dateString.format("dddd, MMMM Do YYYY, h:mm:ss a")
                            },
                            "title" : event[1],
                            "location" : event[2],
                            "link" : href,
                            "dateAdded" : {
                                "pureDate" : moment().valueOf(),
                                "prettyDate" : moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
                                }
                            };

            listings.push(listing);

        }
    });
    

    parseData(listings, function(err,data) {
        if (!err) {
            console.log(data);
            storeDataInDatabase(data, function(err, result) {
            	if (err) {
            		console.log("urrrr");
            	}
            	else
            	{
            		console.log("There was no error");
            	}
            });
        }
    });

  }
});

function parseData(listings, callback)
{
    var parsedArray = new Array();

    for(i = 0; i < listings.length; i++)
    {
        var ad = listings[i];

        var title = ad["title"];
        title = title.toString();

        var currentDate = moment();

        var patt = "/[Ll]aptop/";

        var matches = title.match(/PHP|ios|html/);

        console.log(title);
       if (matches) {
            parsedArray.push(ad);
        }

    }

    callback(null, parsedArray);
};

function storeDataInDatabase(data, callback)
{
	var error;

	if (!data) {
		error = "The data provided was null.";
		callback(error, null);
	}
	else
	{
		
		db.collection(collectionName, {strict : true}, function(err, collection) {
			if (!err) {
				collection.insert(data, function (err, result) {
					if (!err) {
						callback(null, result);
						//sms.publishMessage("Data was successfully stored in the database!", function(err) {

						// });
					}
					else
					{
						error = "The items could not be inserted into the database";

						callback(error, null);
					}
				});
			}
		});
			
		
	}
}