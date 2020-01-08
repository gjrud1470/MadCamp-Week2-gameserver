/*

Game Server for Dodge game created during MadCamp Week2

By Kyoung Hur

*/

var TIMER = 500; // a hunter generated every TIMER ms.
var GENERATE_FLAG = false // make this true to generate hunters.

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
    return new Promise(resolve => setTimeout(resolve, sec)); // Sleep for sec ms
}

function getRandomInt(max)
{
    return Math.floor(Math.random()*Math.floor(max)); // Create random int from 0 to max
}

async function generate_hunters()
{
    var hunter_number = 0;
    do {
	var generate_flag = GENERATE_FLAG

	var hunter_type = getRandomInt(10);
	if (hunter_type < 8)
	{
	    var hunter_id = 0;
	}
	else
	{
	    var hunter_id = 0;
	}

	var x = Math.random();
	var y = Math.random();

	//console.log('generated hunter');
	io.emit('generate_hunter', {id: hunter_id, hunter_number: hunter_number, x: x, y: y});

	hunter_number++;
	await sleep(TIMER)
    } while (generate_flag);
}


// Start Server
const server = http.listen(80, function() {
	console.log('SERVER GAME STARTED ON PORT: 80');


});

var io = socketio.listen(server);

io.on('connection', function(socket) {

    //console.log('A new user '+socket.id+' is connected');

    socket.on('open_game', function(objectClient) {
    	//console.log(objectClient);
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
	{
            match_created = false;
	    GENERATE_FLAG = false;
	}
    });

    socket.on('create_game', function(name) {
	GENERATE_FLAG = false;

	if (false && match_created) {
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
	GENERATE_FLAG = true;
	generate_hunters();
    });

    socket.on('player1_move', function(angle, strength)
    {
	io.emit('player1_move', {angle: angle, strength: strength});
    });

    socket.on('player2_move', function(angle, strength)
    {
        io.emit('player2_move', {angle: angle, strength: strength});
    });

    socket.on('player1_shoot', function(angle)
    {
        io.emit('player1_shoot', angle);
    });

    socket.on('player2_shoot', function(angle)
    {
        io.emit('player2_shoot', angle);
    });

    socket.on('stop_game', function()
    {
	GENERATE_FLAG = false;
	match_created = false;
	matchlist.clear();
	console.log('game stopped');
    });

    socket.on('ask_player_dead', function(hit_id)
    {
	socket.broadcast.emit('is_player_dead', hit_id);
    });

    socket.on('player_truly_dead', function(hit_id)
    {
	console.log('player '+hit_id+' died');
	io.emit('player_dead', hit_id);
    });

    socket.on('player_not_dead', function(hit_id)
    {
	io.emit('player_not_dead', hit_id);
    });
});




