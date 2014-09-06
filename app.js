var express = require('express'),
    http = require('http'),
    querystring = require('querystring');

var app = express();

app.use(express.static('./static'));

app.get('/vm', function(proxyReq, proxyRes){
    proxyGet('http://data.itsfactory.fi/siriaccess/vm/json?', proxyReq, proxyRes);
});

app.get('/api', function(proxyReq, proxyRes){
    proxyGet('http://api.publictransport.tampere.fi/prod/?user=its_factory_temp&pass=ITS4devN', proxyReq, proxyRes);
});

http.createServer(app).listen(process.env.PORT);

function proxyGet(url, proxyReq, proxyRes){
    
    var params = querystring.stringify(proxyReq.query);
    
    if (params){
        url += '&' + params;
    }
    
    proxyRes.set('Content-Type', 'application/json');
    
    http.get(url, function(res) {
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
}
