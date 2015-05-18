var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var plumber = require("gulp-plumber");
var uglify = require("gulp-uglify");

var globs = {
    client_jsx: "client/templates/*.jsx"
};
var output = {
    js: "static/js/"
};

gulp.task("default", function () {
    return gulp.src(globs.client_jsx)
        // Prevent errors from killing watch task
        .pipe(plumber())
        // Initialise source mappings
        .pipe(sourcemaps.init())
        // Concatenate all source files
        .pipe(concat("client.min.js"))
        // Transpile JSX and ES6 to ES5
        .pipe(babel())
        // Minify
        .pipe(uglify())
        // Save Source mappings
        .pipe(sourcemaps.write(".", {
            sourceRoot: "../../client/templates/",
            sourceMappingURLPrefix: "/static/js/"
        }))
        // Output to `dist/js`
        .pipe(gulp.dest(output.js));
});

gulp.task("watch", function () {
    gulp.watch(globs.client_jsx, ['default']);
});