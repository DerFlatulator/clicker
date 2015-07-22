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


/**
 * Redis channels are:
 *     <interaction_name>.<class_name>.(client|observer)
 *     OR:
 *     <class_name>.(client|observer)
 *
 * Socket.IO namespaces are:
 *     /(client|observer)
 *
 * Socket.IO rooms are:
 *     <class_name>.<interaction_name>
 */

// Subscribe to Redis observer channels

//var redisChannels = [
//    'gameoflife.observer',
//    'bubblesort.observer',
//    'gameoflife.client',
//    'bubblesort.client'
//];


var namespaces = {
    client: makeNamespace('/client'),
    observer: makeNamespace('/observer')
};

var redisChannelGlob = '*.*'; // '*.*.*' is also valid
redisClient.psubscribe(redisChannelGlob);

/**
 * Attach a callback from redis,
 * forward it to the observer iff they are subscribed to the redisChannel
 * [redis message ---> observer]
 */
redisClient.on('pmessage', function (pattern, _channel, message) {

    var parts = _channel.split('.');
    if (parts.length < 2 || parts.length > 3)
        throw new RangeError("Redis channels MUST be in the form *.*.* or *.*");

    var is_to_room = parts.length === 3;

    var interaction_name = is_to_room ? parts[0] : null,
        class_name = is_to_room ? parts[1] : parts[0],
        type = is_to_room ? parts[2] : parts[1];

    if (!(type in namespaces)) {
        throw new RangeError('Redis channel type must be "client" or "observer"');
    }

    var nsp = namespaces[type];

    if (is_to_room) {
        var room = interaction_name + "." + class_name;

        console.log('Forwarding from', _channel, 'to', '/'+type, 'room:', room);
        nsp.emit(room, message);
    } else {
        console.log('Forwarding from', _channel, 'to', '/'+type, 'global');
        nsp.emit('message', message);
    }
    console.log('', message);
});

/**
 * Create a Socket.IO namespace
 * @param namespace in the form /name
 * @returns {Namespace}
 */
function makeNamespace(namespace) {

    var nsp = io.of(namespace);
    console.log('listening on', namespace);

    /**
     * Listen for connections from clients
     */
    nsp.on('connection', function (socket) {

        console.log("* New connection:", socket.client.id, socket.conn.remoteAddress,socket.handshake.time);

        /**
         * Called when an observer disconnects
         */
        socket.on('disconnect', function () {
            console.log("* Disconnection");
        });
    });

    return nsp;
}


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

