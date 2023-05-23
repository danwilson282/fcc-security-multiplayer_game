import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import gameSettings from './gameSettings.mjs';
const socket = io();
const canvas = document.getElementById('game-window')
const ctx = canvas.getContext('2d');

let keysPressed = {};
let you;
let opponents = [];
let collectable = {};
let playerSprite = new Image;
let opponentSprite = new Image;
let collectableSprite = new Image;
//mine
//initialise the game

//on connection
socket.on('connect', () =>{
    
    let x = random(0,(gameSettings.boardWidth-gameSettings.padding))
    let y = random(gameSettings.bannerHeight,(gameSettings.boardHeight-gameSettings.padding))
    you = new Player({x: x, y: y, score: 0, id: socket.id})
    socket.emit('new_player', you)

})

socket.on('new_collectable', c=>{
    collectable = c

})

socket.on('current_players', players=>{
    players.forEach(ply=>{
        opponents.push(new Player(ply))
    })
    //here, add list of current players
    init()
})

socket.on('send_move_to_others', player_info=>{
    const opp = opponents.find((opp) => opp.id === player_info.id);
    opp.x = player_info.x
    opp.y = player_info.y
    opp.score = player_info.score
})

socket.on('opponent_joined', player_info=>{
    opponents.push(new Player(player_info))
})

socket.on('player_left', id=>{
    let i = opponents.findIndex((opponents) => opponents.id === id);
    opponents.splice(i,1)
})

socket.on('request_col', c=>{
    collectable = new Collectible(c)
})

socket.on('opponent_scored', p=>{
    let i = opponents.findIndex((opponents) => opponents.id === p.id);
    opponents[i].score = p.score
})

//set up the canvas and initial player position
function init(){ 
    canvas.width = gameSettings.boardWidth;
    canvas.height = gameSettings.boardHeight;
    ctx.fillStyle = gameSettings.backgroundColour;
    playerSprite.src = gameSettings.playerSprite.file
    opponentSprite.src = gameSettings.opponentSprite.file
    collectableSprite.src = gameSettings.collectableSprite.file
    requestAnimationFrame(render);
}

//random number generator
function random(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function moveCharacter(keys){
    if (keys.ArrowUp==true || keys.w==true){
        if (checkLimit(you.y, 'y', -1)==true){
            you.movePlayer('up',1)
        }
        
    }
    if (keys.ArrowDown==true || keys.s==true){
        if (checkLimit(you.y, 'y', 1)==true){
            you.movePlayer('down',1)
        }
    }
    if (keys.ArrowLeft==true || keys.a==true){
        if (checkLimit(you.x, 'x', -1)==true){
            you.movePlayer('left',1)
        }
    }
    if (keys.ArrowRight==true || keys.d==true){
        if (checkLimit(you.x, 'x', 1)==true){
            you.movePlayer('right',1)
        }
    }
}

function render(){
    ctx.fillStyle = gameSettings.backgroundColour;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    
    //title bar
    ctx.beginPath();
    ctx.rect(5, 5, canvas.width-10, gameSettings.bannerHeight-5);
    ctx.strokeStyle = '#a8a8ac';
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.font = `12px 'Press Start 2P'`;
    ctx.textAlign = 'start';
    ctx.fillText('Score: '+you.score, gameSettings.padding, gameSettings.bannerHeight/2+6)
    ctx.textAlign = 'end';
    ctx.fillText(you.calculateRank(opponents), canvas.width-gameSettings.padding, gameSettings.bannerHeight/2+6)
    ctx.fillStyle = '#8f1007';
    ctx.font = `14px 'Press Start 2P'`;
    ctx.textAlign = 'center';
    ctx.fillText(gameSettings.title, canvas.width/2, gameSettings.bannerHeight/2+7)
    //draw player
    ctx.drawImage(playerSprite, you.x, you.y, gameSettings.playerSprite.width, gameSettings.playerSprite.height)
    //draw opponents
    opponents.forEach(opp=>{
        ctx.drawImage(opponentSprite, opp.x, opp.y, gameSettings.opponentSprite.width, gameSettings.opponentSprite.height)
    })
    //draw collectable
    ctx.drawImage(collectableSprite, collectable.x, collectable.y, gameSettings.collectableSprite.width, gameSettings.collectableSprite.height)
    moveCharacter(keysPressed)
    //check if caught collectable

    //checkCollision(you, collectable)
    if (you.collision(collectable)==true){
        socket.emit('collected', you)
    }
    requestAnimationFrame(render);
    
    if (Object.keys(keysPressed).length!=0){
        socket.emit('move_player', you)
    }
}
//check if at limit of screen
function checkLimit(val, axis, dir){
    if (val<=gameSettings.bannerHeight && axis=='y' && dir==-1){
        return false
    }
    else if(val>=(canvas.height-gameSettings.padding) && axis=='y' && dir==1){
        return false
    }
    else if (val<=0 && axis=='x' && dir==-1){
        return false
    }
    else if(val>=(canvas.width-gameSettings.padding) && axis=='x' && dir==1){
        return false
    }
    return true
}

function checkCollision(you, collectable){
    if (you.x>=(collectable.x-gameSettings.playerSprite.width) && you.y>=collectable.y-gameSettings.playerSprite.height && you.x<=(collectable.x+gameSettings.collectableSprite.width) && you.y<=(collectable.y+gameSettings.collectableSprite.height)){
        you.score++
        //add to score and new collectable
        socket.emit('collected', you)
    }
}

//keypress events

window.addEventListener('keydown', (event)=>{
    keysPressed[event.key] = true;
    event.preventDefault()
    
});
window.addEventListener('keyup', (event)=>{
    delete keysPressed[event.key];
});

