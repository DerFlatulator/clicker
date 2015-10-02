'use strict';

var source = require('vinyl-source-stream');
var gulp = require('gulp');
var glob = require('glob');
var eventstream = require('event-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var minifyify = require('minifyify');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var bower = require('gulp-bower');
var livereload = require('gulp-livereload');

var apps_glob =  '+(creator|observer|client|website)';

var globs = {
    all_html: apps_glob + '/templates/**/*.html',
    all_css: apps_glob + '/templates/**/*.css',
    all_jsx: apps_glob + '/templates/**/*.jsx'
};

var get_jsx_apps = function (glob_pattern, output_dir) {
    return glob.sync(glob_pattern).map(function (file) {
        return {
            input_dir: glob_pattern.substring(0, glob_pattern.lastIndexOf("/") + 1),
            entry: file.substring(glob_pattern.lastIndexOf("/") + 1),
            output_dir: output_dir,
            map_url: output_dir.replace("dist/", "/static/")
        };
    });
};

var get_css_app = function (glob_pattern, output) {
    return {
        input_glob: glob_pattern,
        output_name: output.substring(output.lastIndexOf("/") + 1),
        output_dir: output.substring(0, output.lastIndexOf("/") + 1)
    };
};

var path = {
    jsx: [].concat(
        get_jsx_apps('client/templates/client/*.jsx', 'dist/js/client/'),
        get_jsx_apps('observer/templates/observer/*.jsx', 'dist/js/observer/'),
        get_jsx_apps('creator/templates/creator/*.jsx', 'dist/js/creator/'),
        get_jsx_apps('website/templates/*.jsx', 'dist/js/')
    ),
    css: [].concat(
        get_css_app('client/templates/**/*.css', 'dist/css/client.css'),
        get_css_app('observer/templates/**/*.css', 'dist/css/observer.css'),
        get_css_app('creator/templates/**/*.css', 'dist/css/creator.css'),
        get_css_app('website/templates/**/*.css', 'dist/css/default.css')
    )
};

gulp.task('build-css', function () {
    var tasks = path.css.map(function (css_task) {
        return gulp.src(css_task.input_glob)
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(autoprefixer())
            .pipe(minifycss({ compatibility: 'ie8' }))
            .pipe(concat(css_task.output_name))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(css_task.output_dir))
            .pipe(livereload());
    });
    return eventstream.merge.apply(null, tasks);
});

gulp.task('bower', function () {
    return bower();
});

gulp.task('watch-jsx', ['bower'], function() {

    var tasks = path.jsx.map(function (app) {
        var b = browserify({
            entries: [app.input_dir + app.entry],
            debug: true,
            cache: {},
            packageCache: {},
            fullPaths: true
        })
            .transform({
                stage: 0
            }, babelify)
            .transform({
                global: true
            }, 'browserify-shim')
            .plugin('minifyify', {
                map: /*app.output_dir +*/ app.entry + '.map',
                output: app.output_dir + app.entry + '.map'
            });

        var watcher  = watchify(b);

        return watcher
            .on('update', function () {
                watcher.bundle()
                    .pipe(plumber())
                    .pipe(source(app.entry))
                    .pipe(rename({ extname: '.bundle.js' }))
                    .pipe(gulp.dest(app.output_dir))
                    .pipe(livereload());
            })
            .on('time', function (time) {
                gutil.log('Transformed',
                    "'" + gutil.colors.cyan(app.input_dir + app.entry) + "'",
                    'to',
                    "'" + gutil.colors.cyan(gutil.replaceExtension(app.output_dir + app.entry, '.bundle.js')) + "'",
                    'after',
                    gutil.colors.magenta(String(time/1000) + " s"));
            })
            .bundle()
            .pipe(plumber())
            .pipe(source(app.entry))
            .pipe(rename({ extname: '.bundle.js' }))
            .pipe(gulp.dest(app.output_dir))
            .pipe(livereload());
    });

    return eventstream.merge.apply(null, tasks);
});

gulp.task('build-jsx', ['bower'], function () {
    var tasks = path.jsx.map(function (app) {
        return browserify({
            entries: [app.input_dir + app.entry],
            debug: true,
            cache: {},
            packageCache: {},
            fullPaths: true
        })
            .transform({
                stage: 0
            }, babelify)
            .transform({
                global: true
            }, 'browserify-shim')
            .plugin('minifyify', {
                map: app.entry + '.map',
                output: app.output_dir + app.entry + '.map'
            })
            .bundle()
            .pipe(source(app.entry))
            .pipe(rename({ extname: '.bundle.js' }))
            .pipe(gulp.dest(app.output_dir));
    });

    return eventstream.merge.apply(null, tasks);
});

gulp.task('default', ['deploy']);

gulp.task('deploy', ['build-jsx', 'build-css']);

gulp.task('watch', ['watch-jsx', 'build-css'], function () {
    livereload.listen();
    gulp.watch(globs.all_css, ['build-css']);
});
