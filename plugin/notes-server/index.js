var http      = require('http');
var https = require('https');
var express   = require('express');
var fs        = require('fs');
var io        = require('socket.io');
var Mustache  = require('mustache');
var path = require('path');

var privateKey  = fs.readFileSync(path.join(__dirname, 'fake-keys/privatekey.pem'));
var certificate = fs.readFileSync(path.join(__dirname, 'fake-keys/certificate.pem'));
var credentials = {key: privateKey, cert: certificate};

var app       = express();
var staticDir = express.static;
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


io = io(httpServer);

var opts = {
	httpPort : process.env.PORT || 8080,
    httpsPort : process.env.PORT || 8443,
	baseDir :   __dirname + '/../../'
};

io.on( 'connection', function( socket ) {

	socket.on( 'new-subscriber', function( data ) {
		socket.broadcast.emit( 'new-subscriber', data );
	});

	socket.on( 'statechanged', function( data ) {
		delete data.state.overview;
		socket.broadcast.emit( 'statechanged', data );
	});

	socket.on( 'statechanged-speaker', function( data ) {
		delete data.state.overview;
		socket.broadcast.emit( 'statechanged-speaker', data );
	});

});

[ 'css', 'js', 'images', 'plugin', 'lib' ].forEach( function( dir ) {
	app.use( '/' + dir, staticDir( opts.baseDir + dir ) );
});

app.get('/', function( req, res ) {

	res.writeHead( 200, { 'Content-Type': 'text/html' } );
	fs.createReadStream( opts.baseDir + '/index.html' ).pipe( res );

});

app.get( '/notes/:socketId', function( req, res ) {

	fs.readFile( opts.baseDir + 'plugin/notes-server/notes.html', function( err, data ) {
		res.send( Mustache.to_html( data.toString(), {
			socketId : req.params.socketId
		}));
	});

});

// Actually listen
httpsServer.listen( opts.httpsPort || null );

var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

var slidesLocation = 'http://localhost' + ( opts.port ? ( ':' + opts.port ) : '' );

console.log( brown + 'reveal.js - Speaker Notes' + reset );
console.log( '1. Open the slides at ' + green + slidesLocation + reset );
console.log( '2. Click on the link in your JS console to go to the notes page' );
console.log( '3. Advance through your slides and your notes will advance automatically' );
