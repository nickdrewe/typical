var Twitter = require('twitter');

//twitter api keys from env
var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var currentTweet;
var typicalLoop = false;

client.stream('statuses/filter', {track: 'typical'}, function(stream) {
	stream.on('data', function(tweet) {
		// console.log(tweet.text);
		currentTweet = tweet;

		//start typical loop after first tweet received
		if(!typicalLoop){
			typical();
		}
	});

	stream.on('error', function(error) {
		throw error;
	});
});


//once a minute
var typical = function(){
	typicalLoop = true;

	var delayNext = randomInt(300000, 600000); //delay before next tweet
	var delayTweet = randomInt(3000, 30000); //delay before replying (spam)
	
	var tweet = currentTweet;

	// console.log(tweet.text.length + tweet.user.screen_name.length);

	if(tweet.text.length + tweet.user.screen_name.length > 120){
		//If the tweet is too long, try the next tweet
		typicalLoop = false;
	} else {
		//Reply to the tweet

		setTimeout(function(){
			//tweet
			var replyText = 'Typical. RT:@' + tweet.user.screen_name + ' "' + tweet.text + '"';
			//console.log(replyText);

			var replyTweet = {
				status: replyText,
				in_reply_to_status_id: tweet.id_str
			}

			// console.log(replyTweet);

			//tweet
			client.post('statuses/update', replyTweet, function(error, tweet, response){
				// console.log(response);

				console.log(replyTweet);
				// if (!error) {
				// 	console.log(error);
				// }
			});

		}, delayTweet);

		//wait for a while before next tweet;
		console.log('Next typical tweet in ' + Math.round(delayNext/1000/60) + ' minutes.');
		setTimeout(function(){
			typical();
		}, delayNext)
	}
}

var randomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
}
