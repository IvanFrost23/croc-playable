const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const base64 = require('gulp-base64');
const path = require('path');
const cleanCSS = require('gulp-clean-css'); // Для минификации CSS
const gulpif = require('gulp-if'); // Для условного применения

// Функция для проверки, является ли файл CSS
function isCSS(file) {
    return file.extname === '.css';
}

gulp.task('inline-and-minify', function () {
    // Минификация и копирование JS файлов
    gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('docs/js'));

    // Копирование картинок (если не нужно их преобразовывать в base64)
    gulp.src('src/images/**/*')
        .pipe(gulp.dest('docs/images'));

    // Минификация и копирование CSS файлов с преобразованием картинок в base64
    gulp.src('src/css/**/*.css')
        .pipe(gulpif(isCSS, base64({
            maxImageSize: 3000 * 1024,  // Максимальный размер изображения для base64
            baseDir: path.join(__dirname, 'src'),
            debug: true
        })))
        .pipe(cleanCSS())  // Минификация CSS
        .pipe(gulp.dest('docs/css'));

    // Обработка HTML: добавление стилей и скриптов inline, без минификации CSS в процессе
    return gulp.src('src/index.html')
        .pipe(inline({
            base: 'src/',  // Указываем исходную папку для стилей и скриптов
            ignore: []
        }))
        .pipe(base64({
            maxImageSize: 3000 * 1024,  // Максимальный размер изображения для base64
            baseDir: path.join(__dirname, 'src'),
            debug: true
        })) // Преобразуем изображения в base64 в HTML
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true, // Минификация CSS
                minifyJS: true
            })
        )
        .pipe(gulp.dest('docs/'));
});

gulp.task('default', gulp.series('inline-and-minify'));
