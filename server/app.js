
// Server Side in Nodejs
var express = require("express"),
    bodyParser = require("body-parser"),
    pubnub = require("pubnub");
var csv = require('csv');
var port = process.env.PORT || 3000,
    app =express(),
    server;

app.use(function(req, res,next){
    console.log("%s %s", req.method, req.url);
    next();
});

app.use(express.static( __dirname+'/'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/events', function(req,res) {

    res.send(events);
    //console.log(orders);
});

app.get('/gallery', function(req,res) {

    res.send(gallery);
    //console.log(orders);
});
app.get('/news', function(req,res) {

    res.send(news);
    //console.log(orders);
});


server = app.listen(port, function() {
    console.log("Listening on port 3000");
});

require("./subnub").default();

// Expose app
exports = module.exports = app;