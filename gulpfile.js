'use strict';

const   gulp = require('gulp'),
        watch = require('gulp-watch'),
        prefixer = require('gulp-autoprefixer'),
        uglify = require('gulp-uglify'),
        sass = require('gulp-sass'),
        csso = require('gulp-csso'),
        imagemin = require('gulp-imagemin'),
        newer = require('gulp-newer'),
        browserSync = require("browser-sync"),
        pug = require('gulp-pug'),
        reload = browserSync.reload;

var path = {
    build: {
        css: 'public/css/',
        img: 'public/img/',
        js: 'public/js/',
        base: '',
        html: 'public/'
    },
    src: {
        style: '_dev/scss/all.scss',
        scss: '_dev/scss/',
        img: '_dev/img/*.*',
        js: '_dev/js/*.js',
        html: '_dev/*.html',
        pug: '_dev/tmpl/*.pug'
    },
    watch: {
        style: '_dev/scss/**/*.scss',
        img: '_dev/img/*.*',
        js: '_dev/js/*',
        html: '_dev/*.html',
        pug: '_dev/tmpl/**/*.pug'
    },
    clean: 'public/'
};

var config = {
    server: {
        baseDir: "public/"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sass({
            errLogToConsole: true
        }))
        .on('error', console.log)
        .pipe(prefixer('last 4 versions'))
        .pipe(csso())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(newer(path.build.img))
        .pipe(imagemin())
        .on('error', console.log)
        .pipe(gulp.dest(path.build.img));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

// обработка ошибки pug
function swallowError (error) {
    console.log(error.toString());
    this.emit('end')
}

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html));
    gulp.src(path.src.pug)
        .pipe(pug())
        .on('error', swallowError)
        .pipe(gulp.dest(path.build.html));
});

gulp.task('build', [
    'html:build',
    'style:build',
    'image:build',
    'js:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html, path.watch.pug], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);