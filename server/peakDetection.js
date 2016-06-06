/**
 * Created by Galex on 04.06.2016.
 */
export default function (x, ff, resolve) {


//% inputs:
//% x: vector of input data
//% ff: approximate ECG beat-rate in Hertz, normalized by the sampling frequency
//%
//% output:
//% peaks: vector of R-peak impulse train

    const   values = x.concat(),
            N = values.length,
            th = 0.5,
            rng = Math.floor(th / ff),
            getInterval = (matr, start, end) =>
                matr.filter( (item, index) => index >= start && index <= end),

            func = function(j, method, res){
                let  maxValueOnInterval = [],
                    index = [],
                    indexPeak = [];
                index[0] = Math.max(j - rng, 1);
                index[1] = Math.min(j + rng, N);
                windowWithXYZ = getInterval(values, index[0], index[1]);
                maxValueOnInterval[0] = method(... windowWithXYZ.map((item, index) => +item[0]));
                maxValueOnInterval[1] = method(... windowWithXYZ.map((item, index) => +item[1]));
                maxValueOnInterval[2] = method(... windowWithXYZ.map((item, index) => +item[2]));

                indexPeak[0] = (values[j][0] - maxValueOnInterval[0] < .01) ? -500 : 0;
                indexPeak[1] = (values[j][1] - maxValueOnInterval[1] < .01) ? -500 : 0;
                indexPeak[2] = (values[j][2] - maxValueOnInterval[2] < .01) ? -500 : 0;
                res(indexPeak);
            };

    let     peaks = [],
            windowWithXYZ = [];


        const clb = Math.min;
        let k = 0;
        const next = () => {
            new Promise((res) => func(k, clb, res))
                .then((result) => { peaks.push(result.concat())})
                .then(()=>{ if(k < N-1) {setTimeout(next, 0, k++) } else {resolve(peaks);}});
        

        };
        next();


}