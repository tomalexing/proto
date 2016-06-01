import eon from './pubnub-c3';
var channel = "c3-spline";
var pubnub = PUBNUB.init({
    publish_key: 'pub-c-70ce66c3-f2a0-44b0-a39f-0cc710b8c261',
    subscribe_key: 'sub-c-badd5dfe-d8ff-11e5-9796-02ee2ddab7fe'
});
console.log(eon);
eon.chart({
    channel: channel,
    history: true,
    flow: true,
    pubnub: pubnub,
    generate: {
        bindto: '#chart',
        data: {
            type: 'spline',
            labels: false
        }
    }
});