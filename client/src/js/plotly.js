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
            type: 'scatter3d'
        }
    }

    static get defaults() {
        return {
            renderNumberPackage : 3, // How much RR - interval to see
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
        if(this.option.DEBUG) console.log(el.data);
        if ( el.data.length <= this.option.renderNumberPackage && this.data.length > 0) {
            Plotly.addTraces(this.domEl, this.data.shift(), 0);
            if(this.option.DEBUG) console.log("added");
        }
        if ( el.data.length > this.option.renderNumberPackage && this.data.length > 0) {
            let more = el.data.length - this.option.renderNumberPackage;

            if(this.option.DEBUG) console.log("more - %s", more);
            new Promise((resolve, rej) => {
                this._culculateMean(el.data.slice(0,-1),resolve);

            }).then(()=>{
                Plotly.deleteTraces(this.domEl, Array.apply(null, {length: more}).map(Number.call, Number).concat(-1));
                Plotly.addTraces(this.domEl, this.data.shift(), 0);
                Plotly.addTraces(this.domEl, this.mean, -1);
            });

            if(this.option.DEBUG) console.log("added & removed");
        }
        clearTimeout(this.setTO);
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
        let trace =  this._composeTrace(chunk);
        if(this.IsRenderWork) this.data.push(trace);
        if(this.option.DEBUG) console.log("!!!!HOW MUCH IN DATA BUFFER %s --- Trace %s\n",this.data.length, trace.x.length);

    }






    // #####################3
    //   Private API
    // #####################3
    _initPlotly() {
        if(this.option.DEBUG) console.log("start");
        Plotly.newPlot(this.el, [], this.layout, {showLink: false});

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
            sel = document.getElementById("num_period");

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

            }


        }).bind(this));
    }



}


