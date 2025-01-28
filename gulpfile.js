const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const base64 = require('gulp-base64');
const path = require('path');

// Задача: Минификация JS, инлайнинг и минификация HTML
gulp.task('inline-and-minify', function () {
    // Минифицируем JS-файлы отдельно
    gulp.src('src/js/**/*.js') // Все JS-файлы
        .pipe(uglify()) // Минификация JS
        .pipe(gulp.dest('docs/js')); // Сохраняем минифицированные файлы

    // Далее обрабатываем HTML и инлайним все файлы
    return gulp.src('src/index.html') // Исходный HTML
        .pipe(base64({
            maxImageSize: 3000 * 1024, // Лимит на 10 KB (можно менять)
            baseDir: path.join(__dirname, 'src'), // Папка с исходниками
            debug: true // Включить вывод информации о процессе
        })) // Инлайн изображений в Base64
        .pipe(
            inline({
                base: 'src/', // Базовый путь для ресурсов (изображений, скриптов и т.д.)
                ignore: [], // Не игнорируем ничего
                css: true
            })
        )
        .pipe(
            htmlmin({
                collapseWhitespace: true, // Удаление пробелов и переносов строк
                removeComments: true, // Удаление комментариев
                minifyJS: true, // Минификация встроенного JS
                minifyCSS: true // Минификация встроенного CSS
            })
        )
        .pipe(gulp.dest('docs/')); // Сохраняем итоговый HTML в папку docs
});

// Задача по умолчанию
gulp.task('default', gulp.series('inline-and-minify'));
