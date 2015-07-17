var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var static = require('node-static');

var file = new(static.Server)('./public');

app.listen(9999);

console.log("Server running on port 9999");

function handler (req, res) {
    file.serve(req, res);
}

//Players Store
var players = [];
var maxPlayersCount = 2; //restricting to 2 for now

io.on('connection', function (socket) {
    socket.on('joinRequest', function (data) {
        console.log("Join Request Received: "+JSON.stringify(data));
        if(players.length < maxPlayersCount){
            //space for more players
            players[players.length] = 'Player'+(players.length+1);
            console.log("Request accepeted. Player"+players.length+" created");
            socket.emit('accepted', {'name': players[players.length-1], 'position':players.length-1, 'players':players});
            if(players.length == maxPlayersCount){
                io.emit('start', {'players':players});
            }
        } else {
            console.log("Request rejected due to lack of space.");
            socket.emit('rejected', {'reason': 'No Space'});
        }
    });
});