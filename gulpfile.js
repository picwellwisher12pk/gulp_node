var dev = true;
var debug = false;
// HTML
var pug = require('gulp-pug');

//CSS
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-cssnano');
var sourcemaps   = require('gulp-sourcemaps');
// var cmq = require('gulp-combine-media-queies');

//JS
var jshint = require('gulp-jshint');
var coffee = require('gulp-coffee');

//General
var gulp = require('gulp');
var browserSync = require('browser-sync');
var header  = require('gulp-header');
var rename = require('gulp-rename');
var gzip = require('gulp-gzip');
var notify = require("gulp-notify");
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var plumber = require('gulp-plumber');
var debug = require('gulp-debug');
var rm = require('gulp-rimraf');
var package = require('./package.json');
    module.exports = gulp;
//////////////////////////////////////////////////////////////////


var config = {
  threshold: '1kb'
};

var coffeeStream = coffee({bare: true});
coffeeStream.on('error', gutil.log);


var  markupSrc;
if ( debug )
  {markupSrc = ["src/inc/*.pug","src/*.pug"];}
else
  {markupSrc = "src/*.pug";}

var markupDest = "app/";

console.log(markupSrc)



var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

gulp.task('pug', function() {
  return gulp.src(markupSrc)
    .pipe(plumber())
    .pipe(notify({title: package.name+' Message',message: "Pug compiled on "+markupSrc}))
    .pipe(pug({pretty: true}).on('error', gutil.log))
    .pipe(gulp.dest('app/'));

});
gulp.task('html', function () {
    return gulp.src('src/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('app/'))
    .pipe(notify({title: package.name+' Message',message: "HTML loaded"}))
    .pipe(browserSync.reload({stream:true}));
});
gulp.task('img', function () {
    return gulp.src('src/img/*.*')
    .pipe(plumber())
    // .pipe(gzip(config))
    .pipe(gulp.dest('app/img/'))
    .pipe(browserSync.reload({stream:true}));
});
gulp.task('css', function () {
    return gulp.src(['src/scss/*.scss','src/bootstrap/stylesheets/_bootstrap.scss'])
    .pipe(plumber())
    .pipe(debug({title: 'CSS:'}))
    .pipe(sourcemaps.init())
    .pipe(sass({
            errLogToConsole: true,
            //outputStyle: 'compressed',
            // outputStyle: 'compact',
            outputStyle: 'nested',
            // outputStyle: 'expanded',
            precision: 10
     }).on('error', sass.logError))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(autoprefixer('last 4 version', '> 1%', 'safari 4', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('app/css/')).on('error', gutil.log)
    .pipe(minifyCSS({
        postcssDiscardUnused: false,
        postcssZindex: false,
        postcssDiscardEmpty: true,
        postcssMergeRules: false
    })).on('error', gutil.log)
    .pipe(rename({suffix :".min" }))
    .pipe(gulp.dest('app/css/')).on('error', gutil.log)
    .pipe(notify({title: package.name+' message',message: "CSS loaded"})).on('error', gutil.log)
    .pipe(browserSync.reload({stream:true})); 
});

gulp.task('coffee',function(){
    return gulp.src('src/js/*.coffee')
    .pipe(plumber())
    .pipe(debug({title: 'Coffee:'}))
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/js'))
    .pipe(notify({title: package.name+' Message',message: "HTML loaded"}))
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});
gulp.task('js',['coffee'],function(){
    return gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(debug({title: 'JS:'}))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/js'))
    .pipe(notify({title: package.name+' Message',message: "HTML loaded"}))
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "app"
        },
        online:true
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['browser-sync','html','pug','css','coffee'], function () {
    gulp.watch("src/img/*.*", ['img']);
    gulp.watch("src/*.html", ['html']);
    gulp.watch(["src/*.pug","src/inc/*.pug"], ['pug']);
    gulp.watch("src/scss/*.scss", ['css']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch("src/js/*.*coffee", ['coffee']);
    gulp.watch(["app/*.html","app/css/*.css"], ['bs-reload']);
});