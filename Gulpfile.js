'use strict';

var gulp = require('gulp');
// var browserify = require('browserify');
// var transform = require('vinyl-transform');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var bower = require('gulp-bower');

var globs = {
    client: 'client/templates/client',
    client_jsx_bubblesort: 'client/templates/client/bubblesort.jsx',
    client_jsx_gameoflife: 'client/templates/client/gameoflife.jsx',
    client_html: 'client/templates/client/*.html',
    client_css: 'client/templates/client/*.css',
    observer: 'observer/templates/observer',
    observer_jsx_bubblesort: 'observer/templates/observer/bubblesort.jsx',
    observer_jsx_gameoflife: 'observer/templates/observer/gameoflife.jsx',
    observer_html: 'observer/templates/observer/*.html',
    observer_css: 'observer/templates/observer/*.css'
};
var output = {
    client_js: 'dist/js/',
    client_css: 'dist/css/',
    observer_js: 'dist/js/',
    observer_css: 'dist/css/'
};

gulp.task('client-bubblesort', function () {

    return gulp.src(globs.client_jsx_bubblesort)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('client-bubblesort.min.js'))
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.client + '/',
            sourceMappingURLPrefix: '/' + output.client_js
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.client_js));
        // Connect livereload
        //.pipe(livereload({ start: true }));
});

gulp.task('client-gameoflife', function () {

    return gulp.src(globs.client_jsx_gameoflife)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('client-gameoflife.min.js'))
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.client + '/',
            sourceMappingURLPrefix: '/' + output.client_js
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.client_js));
    // Connect livereload
    //.pipe(livereload({ start: true }));
});


gulp.task('observer-bubblesort', function () {

    return gulp.src(globs.observer_jsx_bubblesort)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('observer-bubblesort.min.js'))
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
        .pipe(gulp.dest(output.observer_js));
        // Connect livereload
        //.pipe(livereload({ start: true }));
});

gulp.task('observer-gameoflife', function () {

    return gulp.src(globs.observer_jsx_gameoflife)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat('observer-gameoflife.min.js'))
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
        .pipe(gulp.dest(output.observer_js));
    // Connect livereload
    //.pipe(livereload({ start: true }));
});


gulp.task('observer-css', function () {

    return gulp.src(globs.observer_css)
        .pipe(plumber())
        .pipe(concat('observer.css'))
        .pipe(gulp.dest(output.observer_css));
    //.pipe(livereload({ start: true }));
});

gulp.task('client-css', function () {

    return gulp.src(globs.client_css)
        .pipe(plumber())
        .pipe(concat('client.css'))
        .pipe(gulp.dest(output.client_css));
    //.pipe(livereload({ start: true }));
});


gulp.task('bower', function () {
    return bower();
});

gulp.task('deploy', [
    'bower',
    'observer-bubblesort',
    'observer-gameoflife',
    'observer-css',
    'client-bubblesort',
    'client-gameoflife',
    'client-css'
]);

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(globs.client_jsx_bubblesort, ['client-bubblesort']);
    gulp.watch(globs.client_jsx_gameoflife, ['client-gameoflife']);
    gulp.watch(globs.client_css, ['client-css']);
    gulp.watch(globs.client_html, []);
    gulp.watch(globs.observer_jsx_bubblesort, ['observer-bubblesort']);
    gulp.watch(globs.observer_jsx_gameoflife, ['observer-gameoflife']);
    gulp.watch(globs.observer_css, ['observer-css']);
    gulp.watch(globs.observer_html, []);
});