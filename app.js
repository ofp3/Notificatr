var express = require('express');
var busboy = require('connect-busboy');
var fs = require('fs');
var app = express();
app.use(busboy());
app.engine("html", require('ejs').renderFile);

app.get('/', function(req, res) {
	res.render('index.html');
});
app.post('/img', function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		console.log('got a file');
		fstream = fs.createWriteStream('files/' + filename);
		file.pipe(fstream);
		fstream.on('close', function() {
			console.log('finished uploading file');
		});
	});
	req.busboy.on('finish', function() {
		console.log('finished request');
		res.status(304).send("Done");
	});
});
app.use(express.static(__dirname));
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
