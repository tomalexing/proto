
export default function (data,peaks) {

    var pubnub = require("pubnub")({
        ssl: false,  // <- enable TLS Tunneling over TCP
        publish_key: "pub-c-70ce66c3-f2a0-44b0-a39f-0cc710b8c261",
        subscribe_key: "sub-c-badd5dfe-d8ff-11e5-9796-02ee2ddab7fe"
    });


// get data
    var channel1 = "device_ECG_data_plotly";
    var channel2 = "device_ECG_data_eon";
    var data = data || [];
    var i = 0,
        length = data.length,
        data1 = data.concat(), //new ref
        datamatr = [];
    if (peaks) {
        function getPackage() {
            let lastPoint = 0,
                j = 0;
            while (j < peaks.length) {
                if (peaks[j][2] == -500) {
                    var temp = data1.slice(lastPoint, j);
                    datamatr.push(temp);
                    lastPoint = j;
                }
                j++;

            }

        };
    getPackage();
    }
    function getTen() {
        var size = 50;
        for (var j = 0; j < data1.length; j += size) {
            var temp = data1.slice(j, j + size);
            datamatr.push(temp);
        }
    }
    //getTen();
    /* ---------------------------------------------------------------------------
     Publish Messages
     --------------------------------------------------------------------------- */
    function funcForEON(i) {

        pubnub.publish({
            channel: channel2,
            message: {
                eon: {
                    'vx': data1[i][0],
                    'vy': data1[i][1],
                    'vz': data1[i][2],
                    'px': peaks ? peaks[i][0] : [],
                    'py': peaks ? peaks[i][1] : [],
                    'pz': peaks ? peaks[i][2] : []
                }
            }
        });
        //console.log("data -- %s\n", data1[i]);
        setTimeout(funcForEON, 100, ++i % length);
    }

    setTimeout(funcForEON, 100, i);

    function funcForPlotly(i) {

        pubnub.publish({
            channel: channel1,
            message: {
                plotly: {
                    'x': datamatr[i].map(function (item) {
                        return item[0]
                    }),
                    'y': datamatr[i].map(function (item) {
                        return item[1]
                    }),
                    'z': datamatr[i].map(function (item) {
                        return item[2]
                    }),
                }
            }
        });
        //console.log("data -- %s\n", data1[i]);
        setTimeout(funcForPlotly, 1000, ++i % datamatr.length);
    }

    setTimeout(funcForPlotly, 1000, i);
}