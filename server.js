const path = require('path');
const express = require('express');
const app = express();

// API Config



app.use(express.static(path.join(__dirname, '/dist')));

app.get('/api/json', (req, res) => {
  res.send({'name': 'Alex', 'email': 'atnelon@andrew.cmu.edu'});
});

app.get('*', (req, res, next) => {
  res.sendFile(__dirname+"/dist/index.html");
});

// Socket Config


const http = require('http').createServer(app);
const io = require('socket.io')(http);


io.on('connection', (socket) => {
  updateClients();

  socket.on('disconnect', () => {
    updateClients()
  });


  socket.on('request to play', (socket) => {
    console.log('Request to play: ', socket);
    io.emit('received request', socket);
  })

  // socket.on('show clients', () => {
  //   updateClients()
  // })
});

function updateClients() {
  io.of('/').clients((error, clients) => {
    if (error) throw error;
    io.emit('show clients', clients);
    console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
  });
}



http.listen(3000, () => {
  console.log('listening to port 3000')
});
