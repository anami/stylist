/* Gruntfile */

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
		    normal: {
			    options: {
				    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'	
			    },
			    build: {
				    src: '<%= pkg.name %>.js',
				    dest: '<%= pkg.name %>.min.js'
			    }
			},
			ie : {
			    src: '<%= pkg.name %>.ie.js',
			    dest: '<%= pkg.name %>.ie.min.js'
			}
		},
		copy: {
			main: {
				src: 'index.src.html',
				dest: 'index.html'
			}
		},
		'string-replace' : {
			'index.html' : 'index.html',
			options: {
				replacements: [{
					pattern: /\{SCRIPT\}/,
					replacement: '<%= grunt.file.read("stylist.min.js") %>'
				},{
				    pattern: /\{SCRIPT_IE\}/,
				    replacement: '<%= grunt.file.read("stylist.ie.min.js") %>'
				}]
			}
			
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.registerTask('default', ['uglify', 'copy', 'string-replace']);

}
