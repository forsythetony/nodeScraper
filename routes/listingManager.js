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
		});
	}
	else
	{
		console.log("There was an error connecting to the database.");
	}
});

exports.getAllListings = function(req, res) {

	db.collection(collectionName, function(err, collection) {
		collection.find().toArray(function(err, items) {
			if (!err) {
				res.send(200, items);
			}
			else
			{
				res.send(500, "Error.");
			}
		});
	});
};