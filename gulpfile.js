const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// Задача: Минификация JS, инлайнинг и минификация HTML
gulp.task('inline-and-minify', function () {
    // Минифицируем JS-файлы отдельно
    gulp.src('src/**/*.js') // Все JS-файлы
        .pipe(uglify()) // Минификация JS
        .pipe(gulp.dest('dist/js')); // Сохраняем минифицированные файлы

    // Далее обрабатываем HTML
    return gulp.src('src/index.html') // Исходный HTML
        .pipe(
            inline({
                base: 'src/', // Базовый путь для ресурсов (изображений, скриптов и т.д.)
                ignore: [] // Не игнорируем ничего
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
        .pipe(gulp.dest('dist/')); // Сохраняем итоговый HTML в папку dist
});

// Задача по умолчанию
gulp.task('default', gulp.series('inline-and-minify'));
