var util = require('gulp-util');

var production = util.env.production || util.env.prod || false;
var destPath = 'client/build';

var config = {
    env       : 'development',
    production: production,

    src: {
        root         : 'client/src',
        templates    : 'client/src/templates',
        templatesData: 'client/src/templates/data',
        sass         : 'client/src/sass',
        // path for sass files that will be generated automatically
        sassGen      : 'client/src/sass/generated',
        js           : 'client/src/js',
        img          : 'client/src/img',
        svg          : 'client/src/img/svg',
        icons        : 'client/src/icons',
        // path to png sources for sprite:png task
        iconsPng     : 'client/src/icons',
        // path to svg sources for sprite:svg task
        iconsSvg     : 'client/src/icons',
        // path to svg sources for iconfont task
        iconsFont    : 'client/src/icons',
        fonts        : 'client/src/fonts',
        lib          : 'client/src/lib'
    },
    dest: {
        root : destPath,
        html : destPath,
        css  : destPath + '/css',
        js   : destPath + '/js',
        img  : destPath + '/img',
        fonts: destPath + '/fonts',
        lib  : destPath + '/lib'
    },

    indexPageName: '_index',

    setEnv: function(env) {
        if (typeof env !== 'string') return;
        this.env = env;
        this.production = env === 'production';
        process.env.NODE_ENV = env;
    },

    logEnv: function() {
        util.log(
            'Environment:',
            util.colors.white.bgRed(' ' + process.env.NODE_ENV + ' ')
        );
    },

    errorHandler: require('./util/handle-errors')
};

config.setEnv(production ? 'production' : 'development');

module.exports = config;
