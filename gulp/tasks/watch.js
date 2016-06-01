var gulp   = require('gulp');
var config = require('../config');

gulp.task('watch', [
    'webpack:watch',
    'sass:watch'
]);
