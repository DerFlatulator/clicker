'use strict';

var gulp = require('gulp');
// var browserify = require('browserify');
// var transform = require('vinyl-transform');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
// var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var bower = require('gulp-bower');

var globs = {
    client: 'client/templates/client',
    client_jsx: 'client/templates/client/*.jsx',
    client_html: 'client/templates/client/*.html',
    client_css: 'client/templates/client/*.css',

    observer: 'observer/templates/observer',
    observer_jsx: 'observer/templates/observer/*.jsx',
    observer_html: 'observer/templates/observer/*.html',
    observer_css: 'observer/templates/observer/*.css',

    creator: 'creator/templates/creator',
    creator_html: 'creator/templates/creator/*.html',
    creator_jsx: 'creator/templates/creator/*.jsx',
    creator_css: 'creator/templates/creator/*.css',

    default_css: 'website/templates/default.css'
};
var output = {
    client_js: 'dist/js/client/',
    client_css: 'dist/css/',
    observer_js: 'dist/js/observer/',
    observer_css: 'dist/css/',
    creator_js: 'dist/js/creator/',
    creator_css: 'dist/css/',
    default_css: 'dist/css/'
};

gulp.task('client-jsx', function () {

    return gulp.src(globs.client_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.client + '/',
            sourceMappingURLPrefix: '/static/js/'
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.client_js));
});

gulp.task('observer-jsx', function () {

    return gulp.src(globs.observer_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.observer + '/',
            sourceMappingURLPrefix: '/static/js/'
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.observer_js));
});

gulp.task('creator-jsx', function () {

    return gulp.src(globs.creator_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../../' + globs.creator + '/',
            sourceMappingURLPrefix: '/static/js/'
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.creator_js));
});

gulp.task('observer-css', function () {

    return gulp.src(globs.observer_css)
        .pipe(plumber())
        .pipe(concat('observer.css'))
        .pipe(gulp.dest(output.observer_css));
});

gulp.task('client-css', function () {

    return gulp.src(globs.client_css)
        .pipe(plumber())
        .pipe(concat('client.css'))
        .pipe(gulp.dest(output.client_css));
});

gulp.task('creator-css', function () {

    return gulp.src(globs.creator_css)
        .pipe(plumber())
        .pipe(concat('creator.css'))
        .pipe(gulp.dest(output.creator_css));
});

gulp.task('default-css', function () {

    return gulp.src(globs.default_css)
        .pipe(gulp.dest(output.default_css));
});

gulp.task('bower', function () {
    return bower();
});

gulp.task('deploy', [
    'bower',
    'default-css',
    'observer-jsx', 'observer-css',
    'client-jsx', 'client-css',
    'creator-jsx', 'creator-css'
]);

gulp.task('watch', function () {
    // livereload.listen();
    gulp.watch(globs.default_css, ['default-css']);

    gulp.watch(globs.client_jsx, ['client-jsx']);
    gulp.watch(globs.client_css, ['client-css']);
    gulp.watch(globs.client_html, []);

    gulp.watch(globs.observer_jsx, ['observer-jsx']);
    gulp.watch(globs.observer_css, ['observer-css']);
    gulp.watch(globs.observer_html, []);

    gulp.watch(globs.creator_jsx, ['creator-jsx']);
    gulp.watch(globs.creator_css, ['creator-css']);
    gulp.watch(globs.creator_html, []);
});