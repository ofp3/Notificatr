var express = require('express');
var busboy = require('connect-busboy');
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  var fileSchema = new mongoose.Schema({
    filename: 'string', 
    creationTime: 'number'
  });
  var notebookSchema = new mongoose.Schema({
    title: 'string',
    children: [fileSchema]
  });
  var userSchema = new mongoose.Schema({
    username: 'string',
    email: 'string',
    children: [notebookSchema]
  });

  var File = mongoose.model('File', fileSchema);
  var Notebook = mongoose.model('Notebook', notebookSchema);
  var User = mongoose.model('User', userSchema);
});
mongoose.connect('mongodb://localhost/annote');
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
app.post('/File', function(req, res) {
	var data; 
	var filename;
	var extension;
	var name;
	var notebookName;
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
		else if(fieldname == "notebookName") {
			notebookName = val;		
		}
	});
	req.busboy.on('finish', function(){
		fs.writeFile("files/" + notebookName + name + extension, data, function(err){
				if(err)
					console.log(err);
				res.download("files/" + name + extension);
			});
			Notebook.findOne({title: notebookName}, function(err, nb){
				nb.children.push({
					fileName: 'files/' + notebookName + name + extension,
					creationTime: (new Date().getTime())
				});
				nb.save();
			});
	});
});

app.post('/Notebook', function(req, res){
	var value;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'notebookName')
			value = val;
	});
	req.busboy.on('finish', function(){
		var nb = new Notebook({
			title: value,
			children: []
		});
		nb.save(function(err) {
			if (err) return console.error(err);
		});
		res.send(value);
	});
});
app.get('/File', function(req, res){
	fs.readFile("files/" + req.params.fileName, function(err, data){
		if(err){
			console.log(err);
		}
		res.send(data);
	});
});
app.get('/Notebook', function(req, res) {
	Notebook.find({}, function(err, nbs) {
		res.send(nbs);
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
