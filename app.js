var express = require('express');
var busboy = require('connect-busboy');
var fs = require('fs');
var app = express();

var USERNAME = 'ofp3';

app.use(busboy());
app.engine("html", require('ejs').renderFile);

app.get('/', function(req, res) {
	res.render('index.html');
});
app.get('/directory_listing', function(req, res){
	var listing = fs.readdirSync('files/');
	res.send(listing);
});
app.get('/file_listing/:notebook', function(req, res){
	var listing = fs.readdirSync('files/' + req.params.notebook);
	res.send(listing);
});
app.post('/img', function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		console.log('got a file');
		fstream = fs.createWriteStream('images/' + filename);
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
	var extension;
	var name;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		console.log("saveToFile got a field");
		if(fieldname == "data"){
			data = val;
		}
		else if(fieldname == "type"){
			if(val == "raw")
				extension = ".txt";
			else
				extension = ".html";
		}
		else if(fieldname == "name"){
			name = val;
		}
	});
	req.busboy.on('finish', function(){
		fs.writeFile("files/" + name + extension, data, function(err){
				if(err)
					console.log(err);
				res.download("files/" + name + extension);
			});
		// res.status(304).send("DONE saving");
	});
});
app.post('/createNotebook', function(req, res){
	var value;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'name')
			value = val;
	});
	req.busboy.on('finish', function(){
		res.send(value);
	});
});
app.post('/createNote', function(req, res){
	var value;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'name')
			value = val;
	});
	req.busboy.on('finish', function(){
		res.send(value);
	});
});
app.post('/openNote', function(req, res){
	var value;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'name')
			value = val;
	});
	req.busboy.on('finish', function(){
		fs.readFile("files/" + value + ".txt", function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data);
		}
	);
	});
});
app.get('/printerFriendly', function(req, res){
	res.render('printerFriendly/' + USERNAME + '.html');
});
app.post('/printerFriendly', function(req, res){
	var data;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'data')
			data = val;
	});
	req.busboy.on('finish', function(){
		fs.writeFile('views/printerFriendly/' + USERNAME + '.html', data, function(err){
			if(err)
				console.log(err);
			res.status(304).send('OK');
		});
	});
});
app.use(express.static(__dirname));
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
