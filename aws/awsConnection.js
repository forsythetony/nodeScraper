var AWS 	= require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');

AWS.config.update({region: 'us-east-1'});
var sns = new AWS.SNS();

exports.publishMessage = function(message, callback) {
	var params = {};

	sns.listTopics(params, function(err, data) {
		if (err) {
			
		}
		else {
			var topics = data['Topics'];
			var topicA = topics[0]['TopicArn'];

			params = { Message : "Hi", Subject : message, TopicArn : topicA};

			sns.publish(params, function(err, data) {
				
			});

		}
	});
}