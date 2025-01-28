const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const base64 = require('gulp-base64');
const path = require('path');

gulp.task('inline-and-minify', function () {
    gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('docs/js'));

    return gulp.src('src/index.html')
        .pipe(base64({
            maxImageSize: 3000 * 1024,
            baseDir: path.join(__dirname, 'src'),
            debug: true
        }))
        .pipe(
            inline({
                base: 'src/',
                ignore: [],
                css: true
            })
        )
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            })
        )
        .pipe(gulp.dest('docs/'));
});

gulp.task('default', gulp.series('inline-and-minify'));
