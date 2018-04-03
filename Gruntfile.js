// requires

// grunt
module.exports = function (grunt) {
  const pkg = grunt.file.readJSON('package.json') || {}
  const sourceFiles = [
    'backend/**/*.js',
    'frontend/app/source/class/**/*.js'
  ]

  const config = {

    // license header adding
    usebanner: {
      dist: {
        options: {
          position: 'top',
          replace: true,
          linebreak: true,
          process: function (filepath) {
            var filename = filepath.match(/\/([^/]*)$/)[1]
            // if (filename === '__init__.js') { return '' }

            return grunt.template.process('/* DeerNation community project\n' +
              ' *\n' +
              ' * copyright (c) 2017-<%= grunt.template.today("yyyy") %>, Tobias Braeutigam.\n' +
              ' *\n' +
              ' * This program is free software; you can redistribute it and/or modify it\n' +
              ' * under the terms of the GNU General Public License as published by the Free\n' +
              ' * Software Foundation; either version 3 of the License, or (at your option)\n' +
              ' * any later version.\n' +
              ' *\n' +
              ' * This program is distributed in the hope that it will be useful, but WITHOUT\n' +
              ' * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or\n' +
              ' * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for\n' +
              ' * more details.\n' +
              ' *\n' +
              ' * You should have received a copy of the GNU General Public License along\n' +
              ' * with this program; if not, write to the Free Software Foundation, Inc.,\n' +
              ' * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA\n' +
              ' */', {
              data: {
                filename: filename,
                version: pkg.version
              }}
            )
          }
        },
        files: {
          src: sourceFiles
        }
      }
    }
  }
  grunt.initConfig(config)

  // Load the plugin tasks
  grunt.loadNpmTasks('grunt-banner')
}
