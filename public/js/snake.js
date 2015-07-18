
//using these two variable for assgining color to snakes
var availableSnakeColors = ["#E6730E", "#9E0EE6"];
var snakeCount = 0;
var map = [];
var hitSpotX = -1;
var hitSpotY = -1;
var aggressorLength;
var snakes = [];
//current player snake
var snake;

var width = 65;
var height = 40;
var ctx1;
var ctx;
var turn = [];
var MR = Math.random;

var xV = [-1, 0, 1, 0];
var yV = [0, -1, 0, 1];

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

function init(name, position, players, food) {
    console.log("Game initialization started...");
    //Food, as many as snakes
    for (i = 0; i < players.length; i++) {
        placeFood(food[i][0], food[i][1]);
        var tempSnake = new Snake(players[i], i);
        snakes[i] = tempSnake;
        if(position === i){
            snake = tempSnake;
        }
    }
    startGame();
}

function startGame(){
    interval = setInt(clock, 120);
}

function Snake(name, position) {
    this.name = name;
    this.position = position;
    this.X = position * (width-1);
    this.Y = height / 2 | 0;
    this.score = 0;
    this.direction = (position + 3) % 4;
    this.tail = [];
    this.elements = 1;
    this.color = availableSnakeColors[snakeCount];
    this.move = function () {
        //if canvas edges have to be wall, then easy should be false
        if ((easy || (0 <= this.X && 0 <= this.Y && this.X < width && this.Y < height)) && (2 !== map[this.X][this.Y])) {
            //check if a hit happened
            if(hitSpotX != -1){
                if(this.elements > 1){
                    //decide if the hitSpot is within the snake tail
                    var tailLengthBelowHitSpot = 0;
                    for(var i=0;i<this.elements;i++){
                        if(this.tail[i][0] == hitSpotX && this.tail[i][1] == hitSpotY ){
                            tailLengthBelowHitSpot = this.elements - i;
                            break;
                        }
                    }
                    if(aggressorLength > tailLengthBelowHitSpot){
                        this.elements -= tailLengthBelowHitSpot;
                        for(var j=0; j < tailLengthBelowHitSpot; j++){
                            dir = this.tail.pop();
                            map[dir[0]][dir[1]] = 0;
                            ctx.clearRect(dir[0] * 10, dir[1] * 10, 10, 10);
                        }
                        hitSpotX = -1;
                        hitSpotY = -1;
                    } else {
                        rollCredits();
                    }
                } else {
                    //snake has no tail. Game Over
                    rollCredits();
                }
            } else {
                //regular snake movement
                if (1 === map[this.X][this.Y]) {
                    this.score += 50;
                    placeFood();
                    this.elements++;
                }

                ctx.fillRect(this.X * 10, this.Y * 10, 10 - 1, 10 - 1);
                ctx.fillStyle = this.color;
                map[this.X][this.Y] = 2;
                this.tail.unshift([this.X, this.Y]);

                this.X += xV[this.direction];
                this.Y += yV[this.direction];

                if (this.elements < this.tail.length) {
                    dir = this.tail.pop();
                    map[dir[0]][dir[1]] = 0;
                    ctx.clearRect(dir[0] * 10, dir[1] * 10, 10, 10);
                }
            }
        } else if (!turn.length) {
            if(hitSpotX == -1){
                hitSpotX = this.X;
                hitSpotY = this.Y;
                aggressorLength = this.elements;
            } else {
                //seems a head on collision as hitSpot already exists. Kill game
                rollCredits();
            }
        }
    };
    snakeCount++;
    return this;
}

function rollCredits() {
    var topScore = snakes[1].score;
    var winner = snakes[1].name;
    for (i = 1; i < snakes.length; i++) {
        var snake = snakes[i];
        if(snake.score > topScore){
            winner = snake.name;
        } else if(snake.score == topScore){
            //more better way to handle tie's would be needed. But for now - no winner
            winner = "players. Its a tie"
        }
    }
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
    //needs change
    placeFood();
    placeFood();
}

function clock() {
    for (i = 0; i < snakes.length; i++) {
        var snake = snakes[i];
        snake.move();
        //can be improved. we can check if it's a canvas boundaries and if so then do modulo. Which operation is costly modulo or if check
        if (easy) {
            snake.X = (snake.X + width) % width;
            snake.Y = (snake.Y + height) % height;
        }
    }
}

function placeFood(x, y) {
    //really missing this feature to not place food in obstacles.
    /*var x, y;
    do {
        x = MR() * width | 0;
        y = MR() * height | 0;
    } while (map[x][y]);*/
    map[x][y] = 1;
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
    //first snake arrow keys
    if (code == 0 && snake.direction != 2) {
        socket.emit('direction', { 'position': snake.position, 'direction': 0});
        //snake.direction = 0;
    } else if (code == 1 && snake.direction != 3) {
        socket.emit('direction', { 'position': snake.position, 'direction': 1});
        //snake.direction = 1;
    } else if (code == 2 && snake.direction != 0) {
        socket.emit('direction', { 'position': snake.position, 'direction': 2});
        //snake.direction = 2;
    } else if (code == 3 && snake.direction != 1) {
        socket.emit('direction', { 'position': snake.position, 'direction': 3});
        //snake.direction = 3;
    } else if (e.keyCode == 13) {
        restart();
    }
}

function directionChangeHandler(data){
    snakes[data.position].direction = data.direction;
}