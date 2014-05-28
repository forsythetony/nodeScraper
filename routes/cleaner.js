var dbName = "craigslist",
    collectionName = "jobListings";

var mongo = require('mongodb'),
    sprintf = require('sprintf'),
    moment = require('moment');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server("127.0.0.1", 27017, {auto_reconnect : true});

var db = new Db(dbName, server);

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
            else
            {
                cleanOldEntries(collection, function(err, cleanedItems) {
                    //  Insert the items that were cleaned here. 
                    if (!err) {
                        console.log(cleanedItems);
                    }
                    else
                    {
                        console.log(err);
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

function cleanOldEntries(collection, callback)
{
    //  Create date to query

    var queryDate = moment("5/28/2014 3:43 AM");

    var query = { 'dateAdded.pureDate' : {$lte : queryDate.valueOf()}};

    console.log(sprintf("The date that is being queried is %s or %s", queryDate.format("dddd, MMMM Do YYYY, h:mm:ss a"), queryDate.valueOf()));
    console.log("The query is: " + JSON.stringify(query));

    collection.remove(query, function(err, removed) {
        if (!err) {
            callback(null, removed);
        }
        else
        {
            callback(("Could not removed the documents. Error: " + err), null);
        }
    });
}