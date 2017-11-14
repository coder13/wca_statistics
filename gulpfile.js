var fs = require('fs');
var gulp = require('gulp');

gulp.task('init', function () {
	if (fs.existsSync('build')) {
		console.log('build/ directory already exists');
	} else {
		fs.mkdir('build', function (error) {
			if (!error) {
				console.log('created build/ directory')
			} else {
				console.error(error)
			}
		});
	}
});

