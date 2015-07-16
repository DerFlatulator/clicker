'use strict';

/*
 *  1. io.on 'connection'
 *  2. wait for receive message
 *  3. check recv msg for subscription. eg: 'subscribe': "gameoflife.observer"
 *  4. hooks from redis --> socket
 *
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

