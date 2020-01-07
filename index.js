/*

Game Server for Dodge game created during MadCamp Week2

By Kyoung Hur

*/

var GAME_COUNTDOWN = 5; // 5 seconds countdown before game starts.

function User(id, name)
{
    this.id = id;
    this.name = name;
}

var ArrayList = require('arraylist')
var app = require('express')();
var http = require('http').Server(app);
var socketio = require('socket.io')(http);

// Create a list of user playing
var listUsers = new ArrayList;

// List of players in queue
var matchlist = new ArrayList;
var match_created = false;


app.get('/', function(req, res) {

    res.sendFile('index.html', {root: __dirname }) // When user use GET method, return an default index.

});

function sleep(sec)
{
    return new Promise(resolve => setTimeout(resolve, sec*1000)); // Sleep
}

function startGame(room)
{
    console.log('Starting game');



}
// Start Server
const server = http.listen(80, function() {
	console.log('SERVER GAME STARTED ON PORT: 80');


});

var io = socketio.listen(server);

io.on('connection', function(socket) {

    console.log('A new user '+socket.id+' is connected');

    socket.on('open_game', function(objectClient) {
    	console.log(objectClient);
    	var user = new User(socket.id, objectClient);

    	console.log('User: '+user.id+' name '+user.name);

    	listUsers.add(user);
    	console.log('Total online users: '+listUsers.length);
    });

    socket.on('disconnect', function(name) {
    	console.log('User '+name+' has disconnected');

	for (var i=0; i<listUsers.length; i++) {
	    if (listUsers[i].id == socket.id) {
		listUsers.remove(i);
		break;
	    }
	}
	for (var i=0; i<matchlist.length; i++) {
            if (matchlist[i].name == name) {
                matchlist.remove(i);
                break;
            }
        }

	if (matchlist.length == 0)
            match_created = false;
    });

    socket.on('create_game', function(name) {
	if (match_created) {
	    console.log('match create failed');
	    socket.emit('create_failed');
	}
	else {
	    var user = new User(socket.id, name);
	    matchlist.add(user);
	    match_created = true;
	    socket.emit('room_created');
	    console.log('match create success');
	}
    });

    socket.on('join_game', function(name)
    {
	if (!match_created) {
	    console.log('match not created');
	    socket.emit('join_failed');
	}
	else {
	    var user = new User(socket.id, name);
            matchlist.add(user);
            console.log('User '+user.name+' connected to server');
/*
	    var name_list = new ArrayList;
	    for (var i=0; i<matchlist.length; i++) {
		name_list.add(matchlist[i].name);
		console.log('players in match: '+matchlist[i].name);
	    }
*/
	    socket.emit('join_success', matchlist[0].name);
	    socket.broadcast.emit('user_entered', name);
	}
    });

    socket.on('leave_room', function(name)
    {
	for (var i=0; i<matchlist.length; i++) {
            if (matchlist[i].name == name) {
                console.log('removed player'+matchlist[i].name);
                matchlist.remove(i);
		break;
            }
        }
	if (matchlist.length == 0)
	    match_created = false;
	socket.broadcast.emit('user_left_room', name);
    });

    socket.on('start_game', function()
    {
	io.emit('game_started');
    });

});




