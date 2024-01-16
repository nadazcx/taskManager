import {io,Socket}  from "socket.io-client";

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: [ 'websocket' ]
    };

    const socket =  io("http://localhost:8080", options);
    return socket;
};