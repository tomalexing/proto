/**
 * Created by Galex on 04.06.2016.
 */
export default function (x, L, approach, resolve) {

//inputs:
//x: vector or matrix of noisy data (channels x samples)
//L: averaging window length (in samples)
//approach
//  'md': median filtering
//  'mn': moving average
//output:
//
//values
const   values = Object.assign([], x),
        N =   values.length,
        halfWindow = Math.floor(L/2),
        median = (value) =>{
             let values = Object.assign([], value)
             values.sort((a,b) => a - b );
             let half = Math.floor(values.length/2);
             if(value.length % 2)
                 return values[half];
             else
                 return (values[half-1] + values[half]) / 2.0;
         },

        mean = (values) => {
            let sum = values.reduce(function (a, b) {
                return +(a) + (+b);
            });
            return  sum / values.length
        },

        getInterval = (matr, start, end) =>
            matr.filter( (item, index) => index >= start && index <= end),

        func = function (j, method, res){
            var  baseLine = [];
            index[0] = Math.max(j - halfWindow, 1);
            index[1] = Math.min(j + halfWindow, N);
            windowWithXYZ = getInterval(values, index[0], index[1]);
            baseLine[0] = Math.floor(method(windowWithXYZ.map( (item, index) => item[0])));
            baseLine[1] = Math.floor(method(windowWithXYZ.map( (item, index) => item[1])));
            baseLine[2] = Math.floor(method(windowWithXYZ.map( (item, index) => item[2])));
            res(baseLine);
        };

var     baseLineVector = [],
        windowWithXYZ = [],
        index = [];


    if (approach == 'md') {
        let j = 0;
        const clb = median;
        const next = () => {
            func(++j,clb);

            if(j < N) {
                 next();
            }
        };
        next();

    }
    if (approach == 'mn') {
        const clb = mean;
        let k = 0;
        const next = () => {
            new Promise((res) => func(k, clb, res))
                .then((result) => { baseLineVector.push(result.concat())})
                .then(()=>{ if(k < N) {setTimeout(next, 0, k++) } else {resolve(baseLineVector)}});

        };
        next();
    }


}