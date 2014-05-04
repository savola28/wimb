var express = require('express'),
    io = require('socket.io'),
    http = require('http'),
    querystring = require('querystring');

var app = express();

app.use(express.static('./client'));

app.get('/proxy', function(proxyReq, proxyRes)
{
    var options = {
        hostname: 'api.publictransport.tampere.fi',
        path: '/prod/?&user=its_factory_temp&pass=ITS4devN&' + querystring.stringify(proxyReq.query)
    };

    proxyRes.set('Content-Type', 'application/json');
    
    http.get(options, function(res) {
        var data = '';
        
        res.setEncoding('utf8');

        res.on('data', function(chunk){
            data += chunk;
        });
        
        res.on('end', function(){
            proxyRes.write(data);
            proxyRes.end();
        });
    });
});

var server = http.createServer(app);

server.listen(process.env.PORT);

var io = io.listen(server);

var fetchingData = false;

var getSIRIData = function ()
{
    if (fetchingData === true){
        return;
    }
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
            fetchingData = false;
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
