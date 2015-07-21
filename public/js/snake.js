
//using these two variable for assgining color to snakes
var map = [];
var hitSpotX = -1;
var hitSpotY = -1;
var aggressorLength;
var snakes = [];
//current player snake
var position;

var width = 65;
var height = 40;
var ctx1;
var ctx;

//tracking all snakes created in this array
var interval = 0;
var easy = true;
var i, dir;
var win = window;
var doc = document;
var canvas = doc.createElement('canvas');
var canvas1 = doc.createElement('canvas');
var setInt = win.setInterval;
var clInt = win.clearInterval;

function createStage(){
    console.log("Setting game stage");
    // canvas for snake and food
    canvas.setAttribute('width', width * 10);
    canvas.setAttribute('height', height * 10);
    ctx = canvas.getContext('2d');
    doc.body.appendChild(canvas);

    // first canvas for background grid
    canvas1.setAttribute('width', width * 10);
    canvas1.setAttribute('height', height * 10);
    ctx1 = canvas1.getContext('2d');
    doc.body.appendChild(canvas1);

    //vertical lines
    for (var i = 0; i < width; i++) {
        ctx1.beginPath();
        ctx1.moveTo(i * 10, 0);
        ctx1.lineTo(i * 10, height * 10);
        //set line color
        ctx1.strokeStyle = '#8C9191';
        ctx1.stroke();
    }

    //Horizontal lines
    for (var y = 0; y < height; y++) {
        ctx1.beginPath();
        ctx1.moveTo(0, y * 10);
        ctx1.lineTo(width * 10, y * 10);
        ctx1.stroke();
    }

    //Now request server for joining
    sendJoinRequest();
}

function init(snakes) {
    for (i = 0; i < width; i++) {
        map[i] = [];
    }
    console.log("Game initialization started...");
    snakes = this.snakes;
}

function snakeRenderer(snake, release){
    for(i = 0; i<snake.tail.length; i++){
        ctx.fillRect(snake.tail[i][0] * 10, snake.tail[i][1] * 10, 10 - 1, 10 - 1);
    }
    ctx.fillStyle = snake.color;
    snakes[snake.position] = snake;
    if(release != null){
        ctx.clearRect(release[0] * 10, release[1] * 10, 10, 10);
    }
}

function rollCredits() {
    var topScore = snakes[0].score;
    var winner = snakes[0].name;
    for (i = 1; i < snakes.length; i++) {
        var snake = snakes[i];
        if(snake.score > topScore){
            winner = snake.name;
        } else if(snake.score == topScore){
            //more better way to handle tie's would be needed. But for now - no winner
            winner = "players. Its a tie"
        }
    }
    var date = new Date();
    console.log(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+":"+date.getMilliseconds()+":"+"Game over");
    ctx.fillStyle = '#f00';
    ctx.font = 'italic bold 30px sans-serif';
    ctx.textBaseline = 'Middle';
    ctx.fillText('GAME OVER!!!', 220, 100);
    ctx.fillText("All hail the "+winner, 150, 150);
    ctx.fillStyle = 'green';
    ctx.font = ' italic 20px courier';
    ctx.textBaseline = 'Middle';
    ctx.fillText('Hit ENTER to RESTART!!', 15, 350);
    //clear off temp variables
    hitSpotX = -1;
    hitSpotY = -1;
}

function restart() {
    socket.emit('restart', { });
    socket.on('restart', function(data){
        ctx.clearRect(0, 0, width * 10, height * 10);
        map = [];
        for (i = 0; i < snakes.length; i++) {
            var snake = snakes[i];
            snake.X = 5 + (MR() * (width - 10)) | 0;
            snake.Y = 5 + (MR() * (height - 10)) | 0;
            snake.direction = MR() * 3 | 0;
            snake.elements = 1;
            snake.tail = [];
            snake.score = 0;
        }
        for (i = 0; i < width; i++) {
            map[i] = [];
        }
    });
}

function placeFood(x, y) {
    ctx.strokeRect(x * 10 + 1, y * 10 + 1, 10 - 2, 10 - 2);
    ctx.strokeStyle = "green";
}

for (i = 0; i < width; i++) {
    map[i] = [];
}

// Adding keyboard controls.
doc.onkeydown = function (e) {

    var code = e.keyCode - 37;

    /*
     * 0: left
     * 1: up
     * 2: right
     * 3: down
     **/
    console.log("Code"+code+":"+snakes[position]);
    if (code == 0 && snakes[position].direction != 2) {
        socket.emit('direction', { 'position': position, 'direction': 0});
        //snake.direction = 0;
    } else if (code == 1 && snakes[position].direction != 3) {
        socket.emit('direction', { 'position': position, 'direction': 1});
        //snake.direction = 1;
    } else if (code == 2 && snakes[position].direction != 0) {
        socket.emit('direction', { 'position': position, 'direction': 2});
        //snake.direction = 2;
    } else if (code == 3 && snakes[position].direction != 1) {
        socket.emit('direction', { 'position': position, 'direction': 3});
        //snake.direction = 3;
    } else if (e.keyCode == 13) {
        restart();
    }
}

function directionChangeHandler(data){
    snakes[data.position].direction = data.direction;
}