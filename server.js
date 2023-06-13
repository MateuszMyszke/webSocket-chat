const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});
const io = socket(server);

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, '/client/')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});


io.on('connection', (socket) => {
  console.log('New client! Its id' + socket.id);
  socket.on('join', (userName) => {
    users.push({ id: socket.id, name: userName });
    socket.broadcast.emit('message', {
      author: 'Chatbot',
      content: `<i>${userName}</i> has joined the conversation!`,
    });
  });
  socket.on('message', (message) => {
    console.log('Oh, I\'ve got something from ' + socket.id);
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    if(users.length > 0) {
      const user = users.find((user) => user.id === socket.id);
      users.splice(users.indexOf(user), 1);
      socket.broadcast.emit('message', {
        author: 'Chatbot',
        content: `<i>${user.name}</i> has left the conversation... :(`,
      })
    }
  });
});
