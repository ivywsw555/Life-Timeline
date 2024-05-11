const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

var url = `mongodb://localhost:27017/LifeTimeline`;
var dbName = "LifeTimeline"

app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],

    }
});

function findSocketByUserName(io, userName) {
    for (let [id, socket] of io.sockets.sockets) {
        if (socket.userName === userName) {
            return socket;
        }
    }
    return null;
}


io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('testMessage', (data) => {
        console.log(data);
    });
    socket.on('sendMessage', async (message) => {
        console.log("A message received", message);
        const client = new MongoClient(url);
        try {
            await client.connect();
            const db = client.db(dbName);
            const messagesCollection = db.collection('messages');

            const insertedMessage = await messagesCollection.insertOne({
                ...message,
                createdAt: new Date()
            });

            const recipientSocket = findSocketByUserName(io, message.toUserName);

            if (recipientSocket) {
                recipientSocket.emit('receiveMessage', {
                    ...message,
                    _id: insertedMessage.insertedId,
                    createdAt: new Date()
                });
            }

            socket.emit('messageSent', {
                ...message,
                _id: insertedMessage.insertedId,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Failed to save message:', error);
            socket.emit('sendMessageError', { message: 'Message could not be sent.' });
        } finally {
            client.close();
        }
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3001, '0.0.0.0', () => {
    console.log('Server listening on port 3001');
});