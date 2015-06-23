'use strict';

var http = require('http');
var server = http.createServer();
var io = require('socket.io').listen(server);
server.listen(4000);

var cookie_reader = require('cookie');
var querystring = require('querystring');
var redis = require('redis');
var redisClient = redis.createClient();

// Subscribe to Redis observer channel
redisClient.subscribe('observer');

// console.error(io);

// Configure socket.io to handle Django cookies
//io.configure(function () {
    /*
    io.set('authorization', function (data, accept) {
       if (data.headers.cookie) {
           data.cookie = cookie_reader.parse(data.headers.cookie);
           return accept(null, true);
       }
       return accept('error', true);
    });
    */
    // io.set('log level', 1);
//});

io.sockets.on('connection', function (socket) {

    console.log("Socket Connected, Listening on Port 4000");

    // redis message ---> observer
    redisClient.on('message', function (channel, message) {
        console.log("Received message from Redis: " + message);

        socket.send(message);
    });

    /*
    // observer ---> redis message
    socket.on('send_message', function () {
        var values = querystring.stringify({
           message: message,
           //sessionid: socket.handshake.cookie['sessionid']
        });

        var http_options = {
            host: 'localhost',
            port: '8000',
            path: '/observer/socket',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };

        var req = http.get(http_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (message) {
                console.log(message);
            });
        });

        req.write(values);
        req.end();
    });
    */
});
