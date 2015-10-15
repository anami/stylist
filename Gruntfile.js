/* Gruntfile */

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				mangle: true,
				compress: {
					negate_iife: false
				}
			},
		    normal: {
		    	files : {
		    		'<%= pkg.name %>.min.js' : ['<%= pkg.name %>.js']
		    		// '<%= pkg.name %>_ie9.min.js' : ['<%= pkg.name %>_ie9.js'],
		    	}
//			    src: '<%= pkg.name %>.js',
//	    		dest: '<%= pkg.name %>.min.js'
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
				},
				// {
				// 	pattern: /\{SCRIPT_IE9\}/,
				// 	replacement: '<%= grunt.file.read("stylist_ie9.min.js") %>'
				// }
				]
			}
			
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.registerTask('default', ['uglify', 'copy', 'string-replace']);

}
