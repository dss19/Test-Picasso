const gulp = require("gulp");
const sass = require("gulp-sass"); 
const pug = require("gulp-pug");
const cleanCSS = require("gulp-clean-css"); // Минификатор CSS
const imagemin = require("gulp-imagemin"); // Минификатор изображений
const uglify = require("gulp-uglify"); // Минификатор JS
const babel = require("gulp-babel"); // Конвертер JS стандарта ES6+ в ES5
const changed = require('gulp-changed'); // Обратаываем только те файлы, которые правим
const browsersync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const del = require("del");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");

// Пути к файлам
const paths = {
	pug: {
		src: "src/*.pug",
		dest: "build"
	},
	load: {
		src: "src/load/**/*.pug",
		dest:"build/load"
	},
	scripts: {
		src: "src/js/*.js",
		dest: "build/js"
	},
	sass: {
		src: "src/sass/**/*.+(sass|scss)",
		dest: "build/css"
	},
	libs: {
		src: "src/libs/**/*",
		dest: "build/libs"
	},
	images: {
		src: "src/images/**/*",
		dest: "build/images"
	},
	files: {
		src: "src/files/**/*",
		dest: "build/files"
	},
	fonts: {
		src: "src/fonts/*",
		dest: "build/fonts"
	},
	browserSync: {
		baseDir: "build"
	}
};

// Версии браузеров для автопрефиксов
const autoprefixerList = [
	'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];

// Browser-sync
const browserSync = (done) => {
	browsersync.init({
		server: {
			baseDir: paths.browserSync.baseDir
		},
		port: 3000,
		cors: true,
		notify: false,
		ui: false,
		browser: "chrome"
	});
	done();
};

// Styles
const createCss = () => {
	return gulp
		.src(paths.sass.src)
		.pipe(
			plumber(function (err) {
				console.log("Styles Task Error");
				console.log(err);
				this.emit("end");
			})
		)
		.pipe(sourcemap.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(
			autoprefixer({
				overrideBrowserslist: autoprefixerList,
				cascade: false,
				grid: true
			})
		)
		.pipe(cleanCSS({
			compatibility: 'ie8' // минификатор CSS, включать по необходимости
		}))
		.pipe(sourcemap.write("."))
		.pipe(gulp.dest(paths.sass.dest))
		.pipe(
			browsersync.reload({
				stream: true
			})
		);
};

// Функции сборки бутстрапа
const createBootstrapCss = () => {
	return gulp.src('src/js/bootstrap/scss/**/*.scss')
		.pipe(changed('build/js/bootstrap/css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ // добавим префиксы
			overrideBrowserslist: autoprefixerList
		}))
		.pipe(gulp.dest('build/js/bootstrap/css'));
};
const createBootstrapJs = () => gulp.src('src/js/bootstrap/dist/js/*').pipe(gulp.dest('build/js/bootstrap/js'));

// Подключенные библиотеки
const libs = () => gulp.src(paths.libs.src).pipe(changed(paths.libs.src).pipe(gulp.dest(paths.libs.dest)));

// Scripts
const scripts = () => {
	return gulp
		.src(paths.scripts.src)
		.pipe(changed(paths.scripts.dest))
		.pipe(babel()) // Коневртация из ES6+ в ES5
		.pipe(uglify()) // Минификация JS
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(
			browsersync.reload({
				stream: true
			})
		);
};

// Pug
const buildTemplate = () => {
	return gulp
		.src(paths.pug.src)
		.pipe(changed(paths.pug.dest, {extension: ".html"}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(paths.pug.dest))
		.pipe(
				browsersync.reload({
					stream: true
				})
		)		
};	

const buildLoad = () => {
	return gulp
		.src(paths.load.src)
		.pipe(changed(paths.load.dest, {extension: ".html"}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(paths.load.dest))
		.pipe(
				browsersync.reload({
					stream: true
				})
		)		
};

// Images
const images = () => {
	return gulp
		.src(paths.images.src)
		.pipe(
			imagemin({
				interlaced: true // Минификатор изображений
			})
		)
		.pipe(changed(paths.images.dest))
		.pipe(gulp.dest(paths.images.dest))
		.pipe(
			browsersync.reload({
				stream: true
			})
		);
};
const files = () => {
	return gulp
		.src(paths.files.src)
		.pipe(changed(paths.files.dest))
		// .pipe(
			// imagemin({
			// 	interlaced: true // Минификатор изображений
			// })
		// )
		.pipe(gulp.dest(paths.files.dest))
		.pipe(
			browsersync.reload({
				stream: true
			})
		);
};

// Fonts
const fonts = () =>  gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));

// =================================================================================================
// Основные команды Gulp (watch, build, createBootstrap, clean, default = watch)
// =================================================================================================

// Clean (очистка папки build)
const clean = () => del("build");

// Сборщик бутстрапа Основной
const createBootstrap = gulp.parallel(createBootstrapCss, createBootstrapJs);

// Отслеживание изменений
const watchFiles = () => {
	gulp.watch(paths.pug.src, buildTemplate);
	gulp.watch(paths.load.src, buildLoad);
	gulp.watch(paths.sass.src, createCss);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.fonts.src, fonts);
	gulp.watch(paths.images.src, images);
	gulp.watch(paths.files.src, files);
	gulp.watch(paths.libs.src, libs);
}

// Build
const build = gulp.series(
	clean,
	// createBootstrap,
	gulp.parallel(createCss, libs, buildTemplate, buildLoad, scripts, images, files, fonts)
);

// Watch
const watch = gulp.series(
	build,
	gulp.parallel(watchFiles, browserSync)
);

// Export tasks
exports.createCss = createCss;
exports.buildTemplate = buildTemplate;
exports.buildLoad = buildLoad;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.libs = libs;
exports.createBootstrapCss = createBootstrapCss;
exports.createBootstrapJs = createBootstrapJs;
exports.createBootstrap = createBootstrap;
exports.build = build;
exports.watch = watch;
exports.default = watch;