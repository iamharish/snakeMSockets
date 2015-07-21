var socket = io();

function sendJoinRequest(){
    socket.emit('joinRequest', { my: 'data' });
}

socket.on('accepted', function(data){
    console.log(JSON.stringify(data));
    position = data.position;
});
socket.on('rejected', function(data){
    console.log(JSON.stringify(data));
});

//To synchronize game start
socket.on('prepareStart', function(data){
    var date = new Date();
    console.log(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+":"+date.getMilliseconds()+":"+"Game prepare command received:"+JSON.stringify(data));
    init(data.snakes);
});

socket.on('start', function(data){
    console.log("Game start command received");
    startGame();
});

socket.on('move', function(data){
    console.log('move:'+JSON.stringify(data));
    snakeRenderer(data.snake, data.release);
});

socket.on('placeFood', function(data){
    console.log('placeFood:'+JSON.stringify(data));
    placeFood(data[0], data[1]);
});

socket.on('direction', function(data){
    directionChangeHandler(data);
});

socket.on('end', function(data){
    console.log("Game end command received");
    rollCredits();
});

window.onbeforeunload = function (e) {
    socket.emit('leave', { 'name': name, 'position':position });
};




