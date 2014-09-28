var express = require('express');
var session = require('express-session');
var busboy = require('connect-busboy');
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();
app.use(session({
	secret: 'annote',
	resave: false,
	saveUninitialized: true
}));
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  var fileSchema = new mongoose.Schema({
    file_name: 'string', 
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

  File = mongoose.model('File', fileSchema);
  Notebook = mongoose.model('Notebook', notebookSchema);
  User = mongoose.model('User', userSchema);
});
mongoose.connect('mongodb://localhost/annote');
app.use(busboy());
app.engine("html", require('ejs').renderFile);
app.get('/login/:username', function(req, res) {
	req.session.username = req.params.username;
	User.find({email: req.params.username}, function(err, usr) {
		if (usr.length === 0) {
			var newUser = new User({
				username: req.params.username,
				email: req.params.username,
				children: []
			});
			newUser.save();
		}	
	res.redirect('/');
	});
});

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
	var extension;
	var name;
	var notebookName;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		console.log("saveToFile got a field");
		if(fieldname == "data"){
			data = val;
		}
		else if(fieldname == "fileName"){
			name = val;
		}
		else if(fieldname == "notebookName") {
			notebookName = val;		
		}
	});
	req.busboy.on('finish', function(){
		fs.writeFile("files/" + notebookName + "/" + name, data, function(err){
				if(err)
					console.log("this error!\n\n" + err);
				// res.download("files/" + notebookName + "/" +  name);
			});
		var note = new File({
			file_name: name,
			creationTime: new Date().getTime()
		});
		User.findOne({email: req.session.username}, function(err, curUser){
			var i = 0;
			//find notebook in user;s children (should already exist)
			while(i < curUser.children.length && curUser.children[i].title != notebookName)
				i++;
			var j = 0;
			while(j < curUser.children[i].children.length && curUser.children[i].children[j].file_name != name)
				j++;
			if(j == curUser.children[i].children.length){//not found
				curUser.children[i].children.push(note);
				curUser.children[i].save();
				curUser.save();
			}
		});
		res.send(name);
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
		User.findOne({email: req.session.username}, function(err, curUser){
			curUser.children.push(nb);	
			curUser.save();
			nb.save();
		});
		console.log("making directory "+value);
		fs.mkdirSync('files/' + value);
		res.send(value);
	});
});
app.get('/File', function(req, res){
	fs.readFile("files/" + req.query.notebookName + "/" + req.query.fileName, function(err, data){
		if(err){
			console.log(err);
		}
		res.send(data);
	});
});
app.get('/Notebook', function(req, res) {
	User.findOne({email: req.session.username}, function(err, curUser) {
		res.send(curUser.children);
	});	
});
app.get('/printerFriendly', function(req, res){
	res.render('printerFriendly.html');
});
app.post('/printerFriendly', function(req, res){
	var data;
	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val){
		if(fieldname == 'data')
			data = val;
	});
	req.busboy.on('finish', function(){
		fs.writeFile('views/printerFriendly.html', data, function(err){
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
