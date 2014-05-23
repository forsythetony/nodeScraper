var express = require('express'),
	listings = require('./routes/listingManager')''

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

app.get('/listings', listings.getAllListings);

app.listen(3000);
console.log("Listening on port 3000");