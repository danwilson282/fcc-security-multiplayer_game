require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const nanoid = require('nanoid').nanoid
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

//Helmet
app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.use(helmet.noCache())
app.use(helmet.hidePoweredBy({setTo: 'PHP 7.4.3'}))


//mystuff
const server = http.createServer(app);
const io = socket(server)
let activePlayers = []
let collectable = []

//start new collectible
const Collectible = require('./public/Collectible');
collectable = new Collectible({id:nanoid()})
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 



//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//sockets stuff
io.on('connection', (socket)=>{
  //when a player joins
  socket.emit('current_players', activePlayers)
  socket.on('new_player', (player) => {
    activePlayers.push(player)
    socket.broadcast.emit('opponent_joined', player)
    socket.emit('new_collectable', collectable)
  })
  //when a player moves
  socket.on('move_player', (player) => {
    socket.broadcast.emit('send_move_to_others', player)
  })
  //player disconnects
  socket.on('disconnect', ()=>{
    let i = activePlayers.findIndex((activePlayers) => activePlayers.id === socket.id);
    activePlayers.splice(i,1)
    socket.broadcast.emit('player_left', socket.id)
  })
  //listen for new collectable
  socket.on('collected', person=>{
    collectable = collectable.setNew({id:nanoid()})
    io.sockets.emit('new_collectable', collectable)
    socket.broadcast.emit('opponent_scored', person)
  })

});
const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
