var Twitter = require('twitter');
var express = require('express');
var app = express();

//twitter api keys from env
var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var currentTweet;
var needTweet = true;
var keyword = 'typical';

//watch Twitter stream for tweets
client.stream('statuses/filter', {track: keyword}, function(stream) {
	stream.on('data', function(tweet) {
		//store the most recent tweet received
		currentTweet = tweet;

		//only process the tweet if one is needed (after delay)
		if(needTweet){
			typical();
		}
	});

	stream.on('error', function(error) {
		throw error;
	});
});

//Express server to keep heroku alive
app.get('/', function (req, res) {
  res.send('Typical!');
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

//process Tweet
var typical = function(){
	needTweet = false;	//Stop tweets being passed to typical function

	var delayNext = randomInt(300000, 600000); //delay before next tweet
	var delayTweet = randomInt(3000, 30000); //delay before replying (to prevent Twitter flagging reply as spam)
	
	var tweet = currentTweet;	//most recent Tweet from stream

	if(tweet.text.length + tweet.user.screen_name.length > 120){
		//If the tweet is too long, try the next tweet
		needTweet = true;
	} else {
		//Reply to the Tweet after delay
		setTimeout(function(){
			var replyText = 'Typical. RT:@' + tweet.user.screen_name + ' "' + tweet.text + '"';

			var replyTweet = {
				status: replyText,
				in_reply_to_status_id: tweet.id_str
			}

			//tweet it
			client.post('statuses/update', replyTweet, function(error, tweet, response){

				console.log(replyTweet);

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
