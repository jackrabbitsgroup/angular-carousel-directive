var http = require('http');

var port =3000;
var host ='localhost'

http.createServer(function (req, res) {
	// res.writeHead(200, {'Content-Type': 'text/plain'});
	// res.end('Hello World\n');
	
	res.sendfile('index.html');
}).listen(port, host);
console.log('Server running at http://'+host+':'+port.toString()+'/');