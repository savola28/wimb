var express = require('express'),
    io = require('socket.io'),
    http = require('http');

var app = express();

app.use(express.static('./client'));

var server = require('http').createServer(app);

server.listen(process.env.PORT);

var io = io.listen(server);

var getSIRIData = function ()
{
    http.get(
        "http://data.itsfactory.fi/siriaccess/vm/json",
        broadcastSIRIData
    ).on('error', function(e) {
        io.sockets.emit('vehicleUpdateError', e.message);
    });
};

var broadcastSIRIData = function (res)
{
        var siriData = '';
        
        res.on('data', function(chunk) {
            siriData += chunk;
        });

        res.on('end', function() {
            io.sockets.emit('vehicleUpdate', JSON.parse(siriData));
        });
};

var interval = null,
    intervalTime = 1000;

io.sockets.on('connection', function (socket)
{
    if (interval === null){
        interval = setInterval(getSIRIData, intervalTime);
    }
    
    socket.on('disconnect', function() {
        if (io.sockets.clients().length === 0){
            clearInterval(interval);
        }
    });
});
