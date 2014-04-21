var express = require('express'),
    io = require('socket.io'),
    http = require('http');

var app = express();

app.use(express.static('./client'));

app.get('/stops/:bbox', function(req, res)
{
    var options = {
        hostname: 'api.publictransport.tampere.fi',
        path: '/prod/?limit=20&epsg_in=wgs84&epsg_out=wgs84&request=stops_area&user=its_factory_temp&pass=ITS4devN&bbox=' + req.params.bbox
    };
    
    res.set('Content-Type', 'application/json');
    
    http.get(options, function(stopsRes) {
        var data = '';
        
        stopsRes.setEncoding('utf8');

        stopsRes.on('data', function(chunk){
            data += chunk;
        });
        
        stopsRes.on('end', function(){
            res.write(data);
            res.end();
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
