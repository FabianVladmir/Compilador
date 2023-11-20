import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http"
import ACTIONS from "../client/src/Actions.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const userSocketMap = {};
const PORT = process.env.PORT || 4000;

let dateOb = new Date();

function getAllConnectedUsers(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map
        ((socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId]
            };
        });
}


io.on("connection", (socket) => {
    console.log("connected", socket.id);

    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        console.log(dateOb.getHours() + ":" + dateOb.getMinutes() )
        console.log(userSocketMap)
        const clients = getAllConnectedUsers(roomId);
        console.log(clients);
        if (Array.isArray(clients)) {
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    username,
                    socketId: socket.id,
                });
            });
        } else {
            console.log('Clients data is not an array:', clients);
        }
    });

    //code change
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    //code async
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });


    // disconnecting from socket
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});


//some

server.listen(PORT, () => {
    console.log(`Escuchando en el puerto ${PORT}`)
})
