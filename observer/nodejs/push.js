'use strict';

/*
 * TODO refactor:
 *  1. io.on 'connection'
 *  2. wait for receive message
 *  3. check recv msg for subscription. eg: 'subscribe': "gameoflife.observer"
 *  4. attach hooks from redis --> socket
 *
 * TODO add more redis channels
 *  <namespace>.<device>
 */


var http = require('http');
var server = http.createServer();
var io = require('socket.io').listen(server);
server.listen(4000);

var cookie_reader = require('cookie');
var querystring = require('querystring');
var redis = require('redis');
var redisClient = redis.createClient();

// Subscribe to Redis observer channels

var redisChannels = [
    'gameoflife.observer',
    'bubblesort.observer'
];

redisChannels.forEach(function (channel) {

    redisClient.subscribe(channel);

    var namespace = io.of('/' + channel);

    /**
     * Listen for connections from clients
     */
    namespace.on('connection', function (socket) {

        console.log("* Observer connection [" + socket.client.id + ", " + socket.conn.remoteAddress +
        "] - Time: " + socket.handshake.time);

        /**
         * Called when an observer disconnects
         */
        socket.on('disconnect', function () {
            console.log('* Observer disconnection');
        });

        /**
         * Attach a callback from redis,
         * forward it to the observer iff they are subscribed to the redisChannel
         * [redis message ---> observer]
         */
        redisClient.on('message', function (_channel, message) {
            if (_channel === channel) {
                console.log("* Forwarding message from <" + _channel + ">: " + message +
                    " [to: " + socket.client.id + "]");
                socket.send(message);
            }
        });
    });
});

// Configure socket.io to handle Django cookies
//io.configure(function () {
//    io.set('authorization', function (data, accept) {
//       if (data.headers.cookie) {
//           data.cookie = cookie_reader.parse(data.headers.cookie);
//           return accept(null, true);
//       }
//       return accept('error', true);
//    });
//     io.set('log level', 1);
//});

/**
 * Listen for connections from clients
 * TODO [this section is redundant. remove when above is tested]
 */
io.of('/').on('connection', function (socket) {

    console.log("* Observer connection [" + socket.client.id + ", " + socket.conn.remoteAddress +
            "] - Time: " + socket.handshake.time);

    socket.subscriptions = {};

    /**
     * Make socket subscriptions from clients to redis redisChannels.
     * If the channel does not exist, emit an error
     */
    socket.on('subscribe', function (channel) {
        if (! (channel in redisChannels) ) {
            socket.emit('error', {error: "unknown channel: " + channel});
        } else {
            socket.subscriptions[channel] = true;
        }
    });

    /**
     * Remove a socket subscription
     */
    socket.on('unsubscribe', function (channel) {
        delete socket.subscriptions[channel];
    });

    /**
     * Called when an observer disconnects
     */
    socket.on('disconnect', function () {
        console.log('* Observer disconnection [' + socket.client.id + "] - Time: " + socket.handshake.time);
    });

    /**
     * Attach a callback from redis,
     * forward it to the observer iff they are subscribed to the redisChannel
     * [redis message ---> observer]
     */
    redisClient.on('message', function (channel, message) {
        if (channel in socket.subscriptions) {
            console.log("* Forwarding message from <" + channel + ">: " + message +
            " [to: " + socket.client.id + "]");
            socket.emit(channel, message);
        }
    });
});
