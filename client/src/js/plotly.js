export default class _Plotly {

    static get defaultsLayout() { //lol
        return {
            title: 'vectorcardiograma',
            autosize: false,
            width: 500,
            height: 500,
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 65
            }
        }
    }

    static get defaultsMode() {
        return {
            mode: 'lines',
            marker: {
                color: '#bcbd22',
                size: 15,
                symbol: 'circle',
                line: {
                    color: 'rgb(0,0,0)',
                    width: 0
                }
            },
            line: {
                color: '#bcbd22',
                width: 5
            },
            type: 'scatter3d',

        }
    }

    static get defaults() {
        return {
            renderNumberPackage : 100 , // How much RR - interval to see
            fs: 1000,  // 1000 Samples per second
            renderKoef: 10,  // How much faster make render that data comes !!!Issue with koef = 1 !!!! render must! be called rather than add
            DEBUG: true

        }
    }
    constructor(el, option, layout, mode) {
        this.el = el;
        this.domEl = document.getElementById(this.el);
        this.option =  Object.assign({}, _Plotly.defaults, option);
        this.layout = Object.assign({}, _Plotly.defaultsLayout, layout);
        this.mode = Object.assign({}, _Plotly.defaultsMode, mode);
        this.data = []; // raw data buffer
        this.mean = [];
        this.traces = []; // ready chunk to draw
        this.IsRenderWork = true;
        this.setTO = null;
        this.activaBAR = false;
        this.bar = [];
        this.barPoint = 0;
        this.codedColor = false;
        this._initPlotly();
        this._bindEvent();


    }


    // ######################
    //   Public API
    // ######################

    getDomEl() {
        return this.domEl;
    }

    render() {

        let el = this.domEl;
        if(this.option.DEBUG) console.log(this.data);
        if ( el.data.length <= this.option.renderNumberPackage && this.data.length > 0) {
            Plotly.addTraces(this.domEl, this.data.shift() || [], 0);
            if(this.option.DEBUG) console.log("added");
        }
        if ( el.data.length > this.option.renderNumberPackage && this.data.length > 0) {
            let more = el.data.length - this.option.renderNumberPackage;

            if(this.option.DEBUG) console.log("more - %s", more);
            if(!this.codedColor) {
                new Promise((resolve, rej) => {
                    this._culculateMean(el.data.slice(0, -1), resolve);

                }).then(()=> {
                    Plotly.deleteTraces(this.domEl, Array.apply(null, {length: more}).map(Number.call, Number).concat(-1));
                    Plotly.addTraces(this.domEl, this.data.shift(), 0);
                    Plotly.addTraces(this.domEl, this.mean, -1);
                    if (this.activaBAR) {
                        Plotly.newPlot('bar', this.bar, 0);
                    }
                });
            }else{
                Plotly.addTraces(this.domEl, this.data.shift(), 0);
                Plotly.deleteTraces(this.domEl, -1);
            }

            if(this.option.DEBUG) console.log("added & removed");
        }
        //clearTimeout(this.setTO);
        if( this.IsRenderWork ) this.setTO = setTimeout(this.render.bind(this), this.option.fs/this.option.renderKoef);
    }

    stopRender() {
        this.IsRenderWork = false;
    }

    startRender() {
        this.IsRenderWork = true;
        this.render();
    }

    add(chunk){
        let trace;
        if(this.codedColor) {
            trace = this._oneSingle(chunk);

        }else{
            trace =  this._composeTrace(chunk);
            if(this.IsRenderWork && this.data.length < 100) this.data.push(trace);
        }
        //if(this.option.DEBUG) console.log("!!!!HOW MUCH IN DATA BUFFER %s --- Trace %s\n",this.data.length, trace.x.length);


    }






    // #####################3
    //   Private API
    // #####################3
    _initPlotly() {
        if(this.option.DEBUG) console.log("start");
        Plotly.newPlot(this.el, [], this.layout, {showLink: false});

    }
    _diff(data) {
        let  derivation = [], h = .25;

        for(let i=0; i < data.length; i++){
            derivation[i] = (data[Math.min((i+1),data.length-1)] - data[Math.max((i-1),0)])/2/h;
        }
        return derivation
    }
    _diff2(data) {
        let  derivation = [], h = .25;

        for(let i=0; i < data.length; i++){
            derivation[i] = (data[Math.min((i+1),data.length-1)] + data[Math.max((i-1),0)] - 2*data[i])/2/h;

        }
        return derivation

    }

    _composeTrace(data, mode) {
        return Object.assign({name: "RR interval"}, mode || this.mode, {
                x: data.x || [],
                y: data.y || [],
                z: data.z || []
            });
    }

    _culculateMean(values, resolve) {

        let minX = values[0].x.length,
            minY = values[0].y.length,
            minZ = values[0].z.length,
            min, mean;
        for (let item in values) {
            if (minX > values[item].x.length) minX =  values[item].x.length;
            if (minY > values[item].y.length) minY =  values[item].y.length;
            if (minZ > values[item].z.length) minZ =  values[item].z.length;
        }
        min = Math.min.apply(null,[minX,minY,minZ]);
        if(this.option.DEBUG) console.log("Min Lenght - %s -- minX - %s minY - %s minZ - %s", min,minX,minY,minZ);

        mean = values.reduce((a, b) => {
            return {
                x: a.x.map((item, iter)=> {
                    return (+item) + (+b.x[iter])
                }),
                y: a.y.map((item, iter)=> {
                    return (+item) + (+b.y[iter])
                }),
                z: a.z.map((item, iter)=> {
                    return (+item) + (+b.z[iter])
                })
            }
        });
        if(this.activaBAR) {
            let barXYZ = values.map((item) => {
                return {
                    x: (item.x[this.barPoint] - mean.x[this.barPoint]) * (item.x[this.barPoint] - mean.x[this.barPoint]),
                    y: (item.y[this.barPoint] - mean.y[this.barPoint]) * (item.y[this.barPoint] - mean.y[this.barPoint]),
                    z: (item.z[this.barPoint] - mean.z[this.barPoint]) * (item.y[this.barPoint] - mean.y[this.barPoint])
                }
            });

            this.bar = [{
                x: barXYZ.map((i,iter) => "Interval" + iter),
                y: barXYZ.map(item => Math.sqrt(item.x + item.y + item.z)) ,
                name: 'Deviation',
                type: 'bar'
            }];
        }
        for (let key in mean){
            mean[key] = mean[key].map((item)=> item / values.length);
        }
        if(this.option.DEBUG) console.log( mean);
        let trace = this._composeTrace(mean,{
            mode: 'lines',
            marker: {
                color: '#823',
                size: 20,
                symbol: 'circle',
                line: {
                    color: 'rgb(0,0,0)',
                    width: 0
                }
            },
            line: {
                color: '#823',
                width: 20
            },
            type: 'scatter3d',
            name: 'MEAN'
        });
        if(this.option.DEBUG) console.log("mean.length - %s\n", this.mean);
        this.mean = trace;
        return resolve(trace)
    }

    _bindEvent() {
        let btn = document.getElementById("stop"),
            sel = document.getElementById("num_period"),
            sw = document.getElementById("switch")

        sw.addEventListener("change",(function(ev){
            sw.checked ? this.codedColor = true : this.codedColor = false
        }).bind(this));
        btn.addEventListener("click", (function(event){

            if( this.IsRenderWork ) {
                if(this.option.DEBUG) console.log("Press Stop");
                this.stopRender();
                btn.innerText = "Start";
                btn.classList = "btn btn__active";
            }
            else{
                if(this.option.DEBUG) console.log("Press Start");
                this.startRender();
                btn.innerText = "Stop";
                btn.classList = "btn";
            }
        }).bind(this),false);

        sel.addEventListener("change", (function() {

            var opt = sel.querySelectorAll("option")[sel.selectedIndex].value;
            this.option.renderNumberPackage = parseInt(opt, 10);
            if(this.option.DEBUG) console.log("Option selected - %s\n", opt);
        }).bind(this),false);
        let annotations,annotate_text,annotation;

        this.domEl.on('plotly_click', (function(data){
            if(this.option.DEBUG) console.log("plotly_click");
            if(this.option.DEBUG) console.log(data);

            if(data.points[0].curveNumber == this.option.renderNumberPackage){
                let numPoint = data.points[0].pointNumber;
                this.activaBAR = true;
                this.barPoint = numPoint;
                console.log(data.points);
                Plotly.newPlot('bar', [], {
                    title: 'Bar',
                    autosize: false,
                    width: 250,
                    height: 250,
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 65
                    }
                });

            }


        }).bind(this));
    }

    _color(value) {
        var RGB = {R:0,G:0,B:0};

        // y = mx + b
        // m = 4
        // x = value
        // y = RGB._
        if (0 <= value && value <= 1/8) {
            RGB.R = 0;
            RGB.G = 0;
            RGB.B = 4*value + .5; // .5 - 1 // b = 1/2
        } else if (1/8 < value && value <= 3/8) {
            RGB.R = 0;
            RGB.G = 4*value - .5; // 0 - 1 // b = - 1/2
            RGB.B = 1; // small fix
        } else if (3/8 < value && value <= 5/8) {
            RGB.R = 4*value - 1.5; // 0 - 1 // b = - 3/2
            RGB.G = 1;
            RGB.B = -4*value + 2.5; // 1 - 0 // b = 5/2
        } else if (5/8 < value && value <= 7/8) {
            RGB.R = 1;
            RGB.G = -4*value + 3.5; // 1 - 0 // b = 7/2
            RGB.B = 0;
        } else if (7/8 < value && value <= 1) {
            RGB.R = -4*value + 4.5; // 1 - .5 // b = 9/2
            RGB.G = 0;
            RGB.B = 0;
        } else {    // should never happen - value > 1
            RGB.R = .5;
            RGB.G = 0;
            RGB.B = 0;
        }

        // scale for hex conversion
        RGB.R *= 15;
        RGB.G *= 15;
        RGB.B *= 15;


        return Math.round(RGB.R).toString(16)+''+Math.round(RGB.G).toString(16)+''+Math.round(RGB.B).toString(16);
    }
    _getChunk( full, size) {
        let input  = Object.assign(full);
        size = size || 10;
        let chunk = [];
        for (var j = 0; j < input.length; j += size) {
            var temp = input.slice(j, j + size);
            chunk.push(temp);
        }
        return chunk
    }

    _fixCurve(value){

        let values = Object.assign([], value),
            values1 = Object.assign([], value);
            values.sort((a,b) => a - b);

        let supH = Math.floor(values.length*0.8),
            supL = Math.floor(values.length*0.2);

        let kmax = Math.max(... values.slice(supL, supH));
        for(let i = 0; i < supL; i++ ){
            values1[values1.indexOf(values[i])] = 0;
        }

        for(let i = supH; i < values.length; i++ ){
            values1[values1.indexOf(values[i])] = 1;
        }

        for(let i = supL; i < supH -1 ; i++ ){
            values1[values1.indexOf(values[i])] = values1[values1.indexOf(values[i])] / kmax;
        }
        return values1
    }

    _oneSingle(chunk){
        let chunkLocal = Object.assign({},chunk);
        let dx= [], dy= [], dz= [], d2x= [], d2y= [], d2z= [], devided = [] , k, kNormalize = [], colorList = [],  kmax, kmin, x=[], y=[],z=[];
        dx = this._diff( chunkLocal.x );
        dy = this._diff( chunkLocal.y );
        dz = this._diff( chunkLocal.z );
        d2x = this._diff2( chunkLocal.x );
        d2y = this._diff2( chunkLocal.y );
        d2z = this._diff2( chunkLocal.z );
        k = dx.map((item, index)=>{
            return Math.abs(dx[index] * d2x[index] + dy[index] * d2y[index] + dz[index] * d2z[index] ) / Math.abs(dx[index] * dx[index] * dx[index] + dy[index] * dy[index] * dy[index] + dz[index] * dz[index] * dz[index] );
        });

        kNormalize  = this._fixCurve(k);


        kNormalize.map((item, index)=>{
            return colorList.push(this._color(item));
        });
        colorList  = this._getChunk(colorList,1 );

        x = this._getChunk(chunkLocal.x,1);
        y = this._getChunk(chunkLocal.y,1);
        z = this._getChunk(chunkLocal.z,1);
        x.map((item, iter)=>{
            devided.push({
                x: x[iter].concat(x[Math.min(iter+1, x.length-1)]),
                y: y[iter].concat(y[Math.min(iter+1, y.length-1)]),
                z: z[iter].concat(z[Math.min(iter+1, z.length-1)])
            });
        });
        devided.map((item, index)=> {
            if(this.IsRenderWork ) this.data.push(this._composeTrace(item, {
                mode: 'lines',
                marker: {
                    color: '#823',
                    size: 20,
                    symbol: 'circle',
                    line: {
                        color: 'rgb(0,0,0)',
                        width: 0
                    }
                },
                line: {
                    color: '#' + colorList[index],
                    width: 10
                },
                type: 'scatter3d',
                name: 'MEAN',
                showlegend: false
            }));


        });
    }



}


