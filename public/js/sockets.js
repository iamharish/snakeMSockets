var socket = io('http://localhost:9999');

function sendJoinRequest(){
    socket.emit('joinRequest', { my: 'data' });
}

var name;
var position;

socket.on('accepted', function(data){
    console.log(JSON.stringify(data));
    name = data.name;
    position = data.position;
});
socket.on('rejected', function(data){
    console.log(JSON.stringify(data));
});

//To synchronize game start
/*socket.on('prepareStart', function(data){
    console.log("Game prepare command received");
    init(name, position, data.players, data.food);
    socket.emit("");
});*/

socket.on('start', function(data){
    console.log("Game start command received");
    init(name, position, data.players, data.food);
});

socket.on('direction', function(data){
    directionChangeHandler(data);
});

socket.on('end', function(data){
    console.log("Game start command received");
    init(name, position, data.players);
});

window.onbeforeunload = function (e) {
    socket.emit('leave', { 'name': name, 'position':position });
};