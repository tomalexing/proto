
// Server Side in Nodejs
var express = require("express"),
    bodyParser = require("body-parser"),
    pubnub = require("pubnub"),
    fs = require("fs"),
    csv = require("fast-csv"),
    stream = fs.createReadStream("server/samples.csv"),
    output = [],
    Frank  = [],
    newdata = [],
    heartBeat = 60,
    fs = 1000,
    intermidiateFs = 1000,
    koef = Math.floor(fs / intermidiateFs),
    buffer = [];

var csvStream = csv()
    .on("data", function(data){
        data.filter(function(item){ return  isNaN(item) }).map(function (item, ind) {
            if(item == "'vx'") Frank[0] =  ind;
            if(item == "'vy'") Frank[1] =  ind;
            if(item == "'vz'") Frank[2] =  ind;
        });
        newdata = data.filter(function(item, ind){ return  !isNaN(item) && Frank.indexOf(ind) != -1 });
        if( newdata[0] != undefined ) output.push(newdata);

        //if( buffer.length > koef ) {
        //    let sum = [0,0,0];
        //    buffer.map( (item, ind) => {
        //        sum[0] = sum[0] + (+item[0]);
        //        sum[1] = sum[1] + (+item[1]);
        //        sum[2] = sum[2] + (+item[2]);
        //    });
        //    output.push(Frank.map( (item, ind) => { return ~~(sum[ind] / buffer.length) }));
        //    buffer = [];
        //}
    })
    .on("end", function(){

        new Promise((resolve) => require("./baseLine").default(output, 4, 'mn', resolve)).
            then((res1) => {
                new Promise((resolve1) => require("./peakDetection").default(res1, 1/intermidiateFs, resolve1)).
                    then((res2) =>  require("./subnub").default(res1, res2));
                });

       // const peaks = require("./peakDetection").default(baseLine, 1/intermidiateFs);

        //console.log(baseLine);
        //console.log(baseLine.slice(0,10));
        //let fake1 = baseLine.slice(0, 10);
        //const peaks = require("./peakDetection").default(baseLine, heartBeat/fs);

        //require("./subnub").default(output);
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