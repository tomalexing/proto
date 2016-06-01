
// Server Side in Nodejs
var express = require("express"),
    bodyParser = require("body-parser"),
    pubnub = require("pubnub"),
    fs = require("fs"),
    csv = require("fast-csv"),
    stream = fs.createReadStream("server/samples.csv"),
    output = [],
    Frank  = [],
    newdata = [];

var csvStream = csv()
    .on("data", function(data){
         data.filter(function(item){ return  isNaN(item) }).map(function (item, ind) {
                if(item == "'vx'") Frank[0] =  ind;
                if(item == "'vy'") Frank[1] =  ind;
                if(item == "'vz'") Frank[2] =  ind;
            });
        newdata = data.filter(function(item, ind){ return  !isNaN(item) && Frank.indexOf(ind) != -1 });
        if(newdata[0] != undefined) output.push(newdata);
    })
    .on("end", function(){
        require("./subnub").default(output);
    });

stream.pipe(csvStream);

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

//require("./subnub").default(output);

// Expose app
exports = module.exports = app;