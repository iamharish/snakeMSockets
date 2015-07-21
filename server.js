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


var width = 65;
var height = 40;
var map = [];
for (i = 0; i < width; i++) {
    map[i] = [];
}

var xV = [-1, 0, 1, 0];
var yV = [0, -1, 0, 1];
var snakes = [];
var availableSnakeColors = ["#E6730E", "#9E0EE6"];
var easy = true;

var hitSpotX = -1;
var hitSpotY = -1;
var aggressorLength;
var MR = Math.random;

//Players Store
var players = [];
var playersSockets = [];
var playerStartTimes = [];
var maxPlayersCount = 2; //restricting to 2 for now
var startIn = 5000; //seconds. Game synchronization attempts will be made during this time

io.on('connection', function (socket) {
    socket.on('joinRequest', function (data) {
        console.log("Join Request Received: "+JSON.stringify(data));
        if(players.length < maxPlayersCount){
            //space for more players
            var position = players.length;
            players[players.length] = 'Player'+(players.length+1);
            console.log("Request accepted. Player"+players.length+" created");
            playersSockets.push(socket);
            var tempSnake = new Snake(players[position], position);
            snakes[players.length-1] = tempSnake;
            playerStartTimes[players.length-1] = startIn;

            //register all functions clients can perform
            socket.on('direction', function(data){
                snakes[data.position].direction = data.direction;
            });

            socket.on('restart', function(data){
                playerStartTimes = [];
                io.emit('restart', data);
            });

            socket.emit('accepted', {'position':position});
            if(players.length == maxPlayersCount){
                for(var i=0; i<maxPlayersCount; i++){
                    placeFood();
                }
                io.emit('prepareStart', {'snakes':snakes});
                startGame();
            }
        } else {
            console.log("Request rejected due to lack of space.");
            socket.emit('rejected', {'reason': 'No Space'});
        }
    });
});

var interval
function startGame(){
    interval = setInterval(clock, 180);
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

function Snake(name, position) {
    this.name = name;
    this.position = position;
    this.X = position * (width-1);
    this.Y = height / 2 | 0;
    this.score = 0;
    this.direction = position == 0? 2 : 0;
    this.tail = [];
    this.elements = 1;
    this.color = availableSnakeColors[position];
    this.move = function () {
        var dir;
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
                        if(tailLengthBelowHitSpot == this.elements){
                            //head-on collision
                            io.emit('end');
                            clearInterval(interval);
                        } else {
                            this.elements -= tailLengthBelowHitSpot;
                            for(var j=0; j < tailLengthBelowHitSpot; j++){
                                dir = this.tail.pop();
                                map[dir[0]][dir[1]] = 0;
                            }
                            hitSpotX = -1;
                            hitSpotY = -1;
                        }
                    } else {
                        io.emit('end');
                        clearInterval(interval);
                    }
                } else {
                    //snake has no tail. Game Over
                    io.emit('end');
                    clearInterval(interval);
                }
            } else {
                //regular snake movement
                if (1 === map[this.X][this.Y]) {
                    this.score += 50;
                    placeFood();
                    this.elements++;
                }
                this.tail.unshift([this.X, this.Y]);
                map[this.X][this.Y] = 2;

                this.X += xV[this.direction];
                this.Y += yV[this.direction];

                if (this.elements < this.tail.length) {
                    dir = this.tail.pop();
                    map[dir[0]][dir[1]] = 0;
                    io.emit('move',{'snake':this,'release':dir});
                } else {
                    io.emit('move',{'snake':this,'release':null});
                }
            }
        } else {
            if(hitSpotX == -1){
                hitSpotX = this.X;
                hitSpotY = this.Y;
                aggressorLength = this.elements;
            } else {
                //seems a head on collision as hitSpot already exists. Kill game
                io.emit('end');
                clearInterval(interval);
            }
        }
    };
    return this;
}

function placeFood() {
    var x, y;
     do {
     x = MR() * width | 0;
     y = MR() * height | 0;
     } while (map[x][y]);
    map[x][y] = 1;
    io.emit('placeFood', [x, y]);
}