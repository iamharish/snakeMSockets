var socket = io('http://localhost:9999');

function sendJoinRequest(){
    socket.emit('joinRequest', { my: 'data' });
}

var name;
socket.on('accepted', function(data){
    console.log(JSON.stringify(data));
    name = data.name;
    players = data.players;
});
socket.on('rejected', function(data){
    console.log(JSON.stringify(data));
});

socket.on('start', function(data){
    console.log("Game start command received");
    init(name, data.players);
});