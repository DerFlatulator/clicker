'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');

var globs = {
    client: 'client/templates/client',
    client_jsx: 'client/templates/client/*.jsx',
    client_html: 'client/templates/client/*.html',
    observer: 'observer/templates/observer',
    observer_jsx: 'observer/templates/observer/*.jsx',
    observer_html: 'observer/templates/observer/*.html',
    observer_css: 'observer/templates/observer/*.css'
};
var output = {
    client_js: 'static/js/',
    observer_js: 'static/js/',
    observer_css: 'static/css/'
};

gulp.task('client', function () {

    return gulp.src(globs.client_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('client.min.js'))
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Browserify (require())
        //.pipe(transform(
        //    function(filename) {
        //        return browserify(filename).bundle();
        //    }
        //))
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.client + '/',
            sourceMappingURLPrefix: '/' + output.client_js
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.client_js))
        // Connect livereload
        .pipe(livereload({ start: true }));
});

gulp.task('observer', function () {

    return gulp.src(globs.observer_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('observer.min.js'))
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.observer + '/',
            sourceMappingURLPrefix: '/' + output.observer_js
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.observer_js))
        // Connect livereload
        .pipe(livereload({ start: true }));
});

gulp.task('observer-css', function () {

    return gulp.src(globs.observer_css)
        .pipe(plumber())
        .pipe(concat('observer.css'))
        .pipe(gulp.dest(output.observer_css))
        .pipe(livereload({ start: true }));
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(globs.client_jsx, ['client']);
    gulp.watch(globs.client_html, []);
    gulp.watch(globs.observer_jsx, ['observer']);
    gulp.watch(globs.observer_css, ['observer-css']);
    gulp.watch(globs.observer_html, []);
});