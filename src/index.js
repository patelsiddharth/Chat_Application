const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {GenerateMessage, GenerateLocationMessage} = require('./utils/messages')
const { AddUser, RemoveUser, GetUser, GetUsersInRoom } = require('./utils/users')

const port =process.env.PORT || 3000

const app = express();
const server = http.createServer(app);
const io =  socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.get('/', (req, res) => {
    res.send('Hello Chat App');
})

// conection event will fire whenever socket io server gets a new connection
// socket parameter in callback method represent a client
io.on('connection', (socket) => 
{
    console.log('New WebSocket connection')
    
    socket.on('Join', ({username, room}, callback) => 
    {
        const { error, user } = AddUser({id : socket.id, username, room,})
        
        if(error)
        {
            return callback(error)
        }

        socket.join(room)

        // emit is used to send an event to socket client
        socket.emit('WelcomeMessage', GenerateMessage(`Welcome ${user.username}`));

        io.to(user.room).emit('RoomData', {
            room : user.room,
            users : GetUsersInRoom(user.room)
        })

        // broadcast will emit event to all the client except for current client
        // to will emit event to all client connect to a single room
        socket.broadcast.to(user.room).emit('MessageAlert', GenerateMessage(`${user.username} has joined!`));

        callback();
    })


    // on is used to listent for an event
    // 1st parameter is event name and 2nd parameter is the callback which defines what to do when event occured
    socket.on('Message', (msg, callback) => 
    {
        const filter = new Filter();
        if(filter.isProfane(msg))
        {
            return callback('Profanity is not allowed bitch!!!');
        }
        // used io instead of client(socekt) since we want to update all the clients and not just one.
        const user = GetUser(socket.id);
        io.to(user.room).emit('MessageAlert', GenerateMessage(user.username, msg));
        callback();
    })

    socket.on('SendLocation', (location, callback)=> 
    {
        const locationURL = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        const user = GetUser(socket.id);
        io.to(user.room).emit('LocationMessageAlert', GenerateLocationMessage(user.username, locationURL));
        callback(locationURL);
    })
    // Disconnect is an inbuild event which is triggered when a client exits
    socket.on('disconnect', () => {
        const user = RemoveUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('MessageAlert', GenerateMessage(`${user.username} has left`));
            io.to(user.room).emit('RoomData', {
                room : user.room,
                users : GetUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})