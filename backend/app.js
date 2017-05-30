var cloudinary = require('cloudinary');
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var cookieParser = require('cookie-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var _ = require("underscore");
var app = express();
app.use(cors());
app.use(cookieParser());   
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

//cloudinry config
cloudinary.config({ 
  cloud_name: 'shivanu31', 
  api_key: '572472537769639', 
  api_secret: 'gkRxLhy0hNwrcmUlKTsD_DSlAyk' 
});

//mongo config

//to avoid mongopromise depreciation warning 
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/talentdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("database connection success");
});
//mongo collections
var cardSchema = mongoose.Schema({
	cardNumber:Number,
	username: String,
	profilepicurl: String,
	top2Comments: [],
	aboutThePost: String, 
	categorySelected: String,
	sliderInCreate: [],
	options: [],
	time:Date,
	location: String,
	totalVotes: {type: Number, default:0}
});
var cardModel = mongoose.model('cards', cardSchema);

var userdetailsSchema = mongoose.Schema({
	username:String,
	phoneno: Number,
	emailid:String,
	profilepicurl:String,
	password:String, 
	status: {type: String, default:"inactive"},
	lastPostUserResponded: String,
	firstLogin:{type: Boolean, default: true}
});
var userdetailsCollection = mongoose.model('userdetails', userdetailsSchema);

var commentsSchema = mongoose.Schema({
	postNumber: String, 
	comments: []
});

var commentsModel = mongoose.model("comments", commentsSchema);

var votesSchema = mongoose.Schema({
	postNumber: Number, 
	votes:[{
		userId:String,
		optionNoSelected: Number
	}]
})
var votesModel = mongoose.model("votes", votesSchema)

//html page render
	//app.get('/',function(request, response){ 
	//	response.sendFile(path.join(__dirname+"/frontEnd/templates/index.html"));
	//});
	//get requests
app.get("/getUserCards", function(request, response){
	var username = request.query.username; 
	cardModel.find({username: username}, '-_id -v',{sort:{time: -1}},  function(err, results){
		if(err){
			response.send({success: false, message: "failed to fetch cards"});
		} else{
			response.send({success: true, cards: results});
		}
	})
})
//post requests
app.post('/upload',multipartyMiddleware, function(request, response){
	console.log(request.body.content);

	cloudinary.uploader.upload(request.body.content, function(result) { 
	  console.log(result); 
	});
	response.send("username")
});
//login request
app.post('/loginRequest',function(request, response){ 
	var username1 = request.body.username;
	var password1 = request.body.password;

	userdetailsCollection.find({username: username1, password: password1}, function(err, document){
		if(err){
			response.send({error: "loginFailure"});
		}
		else if(document.length === 0){
			response.send({error: "no such user"})
		}
		else{
			response.send(document[0]);
			if(document[0].firstLogin === true){
				var newStatus = false;
				// changeFirstLoginStatus(document[0].username, newStatus);
			}

		}
	})
//	console.log(request.cookies)
});
var changeFirstLoginStatus = function(username, newStatus){
	userdetailsCollection.update({username: username}, {firstLogin: newStatus}, function(err, updated){
		if(err){
			console.log("error in changing login status");
		} else{
			console.log("login status changed successfully");
		}
	})
}
app.post('/submitVote', function(request, response){
	var cardNumber = parseInt(request.body.cardNumber);
	var userId = request.body.userId;
	var optionNoSelected = parseInt(request.body.optionNoSelected);
	var voteObject = {
		"userId": userId,
		"optionNoSelected": optionNoSelected
	};
	// console.log(cardNumber, userId);
	votesModel.findOne({$and:[
							{postNumber: cardNumber},
							{'votes.userId': userId}
							]}, function(err, record){
								if(err){
									response.send({success: false, message: "error in getting previous value"});
								} else{
									// var previousVoteIndex = record.votes.optionNoSelected;

									votesModel.update({$and:[
															{postNumber: cardNumber},
															{'votes.userId': userId}
															]},
									 				{$set:{'votes.$.optionNoSelected': optionNoSelected}}, function(err, updated){
													if(err){
														response.send(err);
													} else if(updated.nModified === 0){
															votesModel.update({postNumber: cardNumber}, {$push: {votes: voteObject}}, {upsert: true}, function(err, updated){
																if(err){
																	response.send({message: "error while pushing", error: err})
																} else{
																	incrementVote(cardNumber, optionNoSelected, false);
																	response.send({message: "vote Pushed", success: true})
																	console.log("new record added")
																}
															})
														
													} else{
														var previousVoteObj = _.filter(record.votes, function(obj){return obj.userId === userId});
														// console.log(record.votes,previousVoteObj )
														var previousVoteIndex = previousVoteObj[0].optionNoSelected
														incrementVote(cardNumber, optionNoSelected, true, previousVoteIndex);
														response.send({success: true, message: "vote updated"});
														console.log("updated")
													}
									})



								}
							});
});
var incrementVote = function(cardNumber, optionNoSelected, decrementPreviousVote, previousOptionNoSelected){
	cardModel.update({$and:[
							{cardNumber: cardNumber},
							{'options.indexOfOption': optionNoSelected}
							]}, {$inc:{'options.$.votes': 1}}, function(err, success){
								if(err){console.log(err)}
									else{
										console.log("vote incremented")
									}
							})
	if(decrementPreviousVote){
		cardModel.update({$and:[
							{cardNumber: cardNumber},
							{'options.indexOfOption': previousOptionNoSelected}
							]}, {$inc:{'options.$.votes': -1}}, function(err, success){
								if(err){console.log(err)}
									else{
										console.log( "votes decremented")
									}
							})
	}else{
		cardModel.update({$and:[
							{cardNumber: cardNumber},
							{'options.indexOfOption': optionNoSelected}
							]}, {$inc:{totalVotes: 1}}, function(err, success){
								if(err){console.log(err)}
									else{
										console.log("total incremented")
									}
							})
	}
}
// fetch votes
app.post('/fetchVotes', function(request, response){
	var start = request.body.start;
	var end = request.body.end;
	var userName = request.body.username;
	// console.log(start, end, userName)
	votesModel.find({$and: [
							{postNumber:{$gte: end}},
							{postNumber:{$lte: start}},
							{'votes.userId': userName}
							]
		}, function(err, result){
			if(err){
				response.send({success: false, error:err});
			} else{
				var votesToSend = {};
				_.each(result, function(post){
					var obj = {};
					obj.postNumber = post.postNumber;
					obj.userVote = (_.filter(post.votes, function(vote){
						return vote.userId === userName;
					}))[0].optionNoSelected;
					votesToSend[""+obj.postNumber] = obj.userVote;
				})
				response.send({success: true, result: votesToSend})
			}
		})
})
// post comment
app.post('/postComment', function(request, response){
	var postNumber = request.body.cardNumber;
	var comment = {};
	comment.username = request.body.username;
	comment.comment = request.body.comment;
	comment.time = new Date();
	commentsModel.update({postNumber:postNumber}, {$push:{comments: comment}} ,{upsert: true}, function(err, success){
		if(err){
			// response.send({success: false, result: err});
		} else{
			// response.send({success: true, result: success});
		}
		// add top 2 comments in post details
		cardModel.findOne({cardNumber: postNumber}, function(err, post){
			if(err){

			} else{
				var top2Comments = post.top2Comments;
				if(top2Comments.length > 0){
					top2Comments[1] = top2Comments[0];
				}
				top2Comments[0] = comment;
				cardModel.update({cardNumber: postNumber}, {top2Comments: top2Comments}, function(err, updates){
					if(err){

					} else{
						response.send({success: true, top2Comments: top2Comments});
					}
				})
			}
		})
	})
})
app.get("/fetchComments", function(request, response){
	var cardNumber = request.query.cardNumber;
	commentsModel.findOne({postNumber: cardNumber}, function(err, comments){
		if(err){
			response.send({success: false});
		} else{
			response.send({success: true, comments: comments});
		}
	});
})
//signup request
app.post('/signupRequest', function(request, response){
	var userdetails = request.body.userdetails;
	userdetails.profilepicurl = '';
	// console.log(JSON.stringify(request.body.userdetails))
	new userdetailsCollection(userdetails).save(function(err, userdetails){
		if(err){
			// console.log(err)
			response.send({status:"failure", statusInfo:"db store failed"})
		}
		else{
			response.send({status: "success"})
		}
	})
})
// add post
app.post("/postCard", function(request, response){
	var cardDetails = request.body.cardDetails;
	cardDetails.time = new Date();
	cardModel.find().count(function(err, count){
		if(err){
			response.send({success:false, message:'error while assigning card number', error: err});
		} else{
			cardDetails.cardNumber = ++count;
			var dataToSave = new cardModel(cardDetails);
			dataToSave.save(function(err, data){
				if(err){
					response.send({success:false, message:'error while saving card', error: err});
				} else{
					response.send({success: true, cardDetails: cardDetails});
				}
			})
		}
	})
});
// getch cards queue
app.get("/fetchCardsQueue", function(request, response){
	var postUserHadLastSeen = parseInt(request.query.postNumber);
	var todaysDate = new Date();
	
	if(postUserHadLastSeen === 0){
		cardModel.find().count(function(err, count){
			if(err){
				response.send({success: false, message: "error while counting records", error:err})			
			} else{
				// console.log(count)
				cardModel.find({cardNumber:{$lte: count}}, null,{sort:{time: -1}, limit: 7}, function(err, results){
					if(err){
						response.send({success: false, message: "error while fetching", error:err})
					} else{
						response.send({success: true, posts: results});
					}
				})
			}
		})
	} else{
		cardModel.find({cardNumber:{$lt: postUserHadLastSeen}}, null,{sort:{time: -1}, limit: 7}, function(err, results){
			if(err){
				response.send({success: false, message: "error while fetching", error:err})
			} else{
				response.send({success: true, posts: results});
			}
		})
	}
	// var dateSevenDaysBack = todaysDate.setDate(todaysDate.getDate() -7);
	// console.log(dateSevenDaysBack)
	// cardModel.find({$and: [{time: {$gte: dateSevenDaysBack}},
	// 						  {cardNumber: {$gt: postUserHadLastSeen}}
	// 						]}, null, {limit: 7}, function(err, results){
	// 							response.send({queue: results, status: "success"})
	// 						})
})
//server start
app.listen(3000,function(req, res){
	console.log("server started successfully");
});
