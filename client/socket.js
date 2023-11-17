import {io} from 'socket.io-client';

const initSocket = async() => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000000000,
        transports: ['websocket']
    };
    return io('http://localhost:4000', options);
}

export default initSocket;

