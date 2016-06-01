export default function (){

var pubnub = require("pubnub")({
    ssl           : false,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-70ce66c3-f2a0-44b0-a39f-0cc710b8c261",
    subscribe_key : "sub-c-badd5dfe-d8ff-11e5-9796-02ee2ddab7fe"
});



// get data
var channel = "c3-spline";
var data = require('./ECG.json');
var i = 0,
    length = data['ECG'].length,
    data1 = data['ECG'].concat(), //new ref
    datamatr = [];
function getTen(){
    var size = 10;
    for (var j=0; j<data1.length; j+=size) {
        var temp = data1.slice(j,j+size);
        datamatr.push(temp);
    }

};
getTen();
/* ---------------------------------------------------------------------------
 Publish Messages
 --------------------------------------------------------------------------- */
function func(i) {

    pubnub.publish({
        channel: channel,
        message: {
            eon: {
                'ECG': data1[i]
            },
            sd : {
                'ECG': data1[i]
            }
        }
    });
    console.log("data -- %s\n",data1[i]);
    setTimeout(func, 1000, ++i % length);
}
setTimeout(func, 1000, i);
}