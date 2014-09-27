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
app.post('/saveToFile', function(req, res) {
	var data; 
	var filename;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		console.log("saveToFile got a field");
		if(fieldname == "data")
			data = val;
		else if(fieldname == "type")
			if(val == "raw")
				filename = "files/save" + new Date().toISOString() + ".txt";
			else
				filename = "files/save" + new Date().toISOString() + ".html";
	});
	req.busboy.on('finish', function(){
		fs.writeFile(filename, data, function(err){
				if(err)
					console.log(err);
			});
		res.status(304).send("DONE saving");
	});
});
app.use(express.static(__dirname));
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
