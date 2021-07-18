var http = require('http');
var fs = require('fs');

var server = http.createServer(function (request, response) {
    response.writeHead(200);
    if (request.method === 'GET') {
        if (request.url === '/checkstatus') {
            response.end(status.toString());
            return;
        }
        fs.createReadStream('./views/index.html').pipe(response);
    }
    else if (request.method === 'POST') {
        status = 0;
        var outputFile = fs.createWriteStream('output');
        var total = request.headers['content-length'];
        var progress = 0;

        request.on('data', function (chunk) {
            progress += chunk.length;
            var perc = parseInt((progress / total) * 100);
            console.log('percent complete: ' + perc + '%\n');
            status = perc;
        });

        request.pipe(outputFile);

        request.on('end', function () {
            response.end('\nArchived File\n\n');
        });
    }

});

server.listen(5000, function () {
    console.log('Server is listening on 5000');
});