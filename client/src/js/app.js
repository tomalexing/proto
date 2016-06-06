import eon from './pubnub-c3';
import _Plotly from './plotly';


var channel1 = "device_ECG_data_plotly";
var channel2 = "device_ECG_data_eon";

//==============================================
//############INIT PUBNUB#######################
//==============================================
var eonPubNub = PUBNUB.init({
    publish_key: 'pub-c-70ce66c3-f2a0-44b0-a39f-0cc710b8c261',
    subscribe_key: 'sub-c-badd5dfe-d8ff-11e5-9796-02ee2ddab7fe'
});
var plotlyPubNub = PUBNUB.init({
    publish_key: 'pub-c-70ce66c3-f2a0-44b0-a39f-0cc710b8c261',
    subscribe_key: 'sub-c-badd5dfe-d8ff-11e5-9796-02ee2ddab7fe'
});
//==============================================
//############INIT PUBNUB END###################
//==============================================

console.log(eon);

eon.chart({
    channel: channel2,
    history: true,
    flow: true,
    pubnub: eonPubNub,
    limit: 500,
    generate: {
        bindto: '#chart',
        data: {
            type: 'spline',
            labels: false
        },

    },
    debug: false
});
const option = {
    renderNumberPackage : 3
}

const godograph  = new _Plotly('Godograph', option);
godograph.render();

plotlyPubNub.subscribe({
    channel: channel1,
    history: true,
    message: function(m){
        godograph.add(m.plotly);
    }

});
