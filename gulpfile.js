'use strict';

const gulp = require('gulp'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  csso = require('gulp-csso'),
  imagemin = require('gulp-imagemin'),
  newer = require('gulp-newer'),
  size = require('gulp-size'),
  sourcemaps = require('gulp-sourcemaps'),
  browsersync = require("browser-sync").create(),
  pug = require('gulp-pug');

const path = {
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

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "public/"
    },
    port: 9000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function styles() {
  return gulp
    .src(path.src.style)
    .pipe(sass({
      errLogToConsole: true
    }))
    .on('error', console.log)
    .pipe(prefixer('last 3 versions'))
    .pipe(csso())
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(gulp.dest(path.build.css))
    .pipe(browsersync.stream());
}

function images() {
  return gulp
    .src(path.src.img)
    .pipe(newer(path.build.img))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ]
    ))
    .on('error', console.log)
    .pipe(gulp.dest(path.build.img));
}

function js() {
  return gulp
    .src(path.src.js)
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.stream());
}

// pug error
function swallowError(error) {
  console.log(error.toString());
  this.emit('end')
}

function html() {
  return gulp
    .src(path.src.pug)
    .pipe(pug({
      pretty: true
    }))
    .on('error', swallowError)
    .pipe(gulp.dest(path.build.html));
}

function watchFiles(){
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.style], styles);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.src.pug], gulp.series(html, browserSyncReload));
}

// Tasks
gulp.task("images", images);
gulp.task("css", styles);
gulp.task("js", js);
gulp.task("html", html);

gulp.task('build', gulp.parallel(styles, images, js, html));

// watch
gulp.task("watch", gulp.parallel(watchFiles, browserSync));