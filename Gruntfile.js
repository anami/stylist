/* Gruntfile */

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'	
			},
			build: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js'
			}
		},
		copy: {
			main: {
				src: 'index.src.html',
				dest: 'index.html'
			}, 
			readme: {
				src: 'readme.src.md',
				dest: 'README.md'
			}
		},
		'string-replace' : {
			'index.html' : 'index.html',
			'README.md' : 'README.md',
			options: {
				replacements: [{
					pattern: /\{SCRIPT\}/,
					replacement: '<%= grunt.file.read("stylist.min.js") %>'
				}]
			}
			
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.registerTask('default', ['uglify', 'copy', 'string-replace']);

}