/*
 * grunt-ejs-precompile
 * https://github.com/kimhou/gruntplugins/ejs-precompile
 *
 * Copyright (c) 2015 
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  var chalk = require('chalk');

  var compiler = require('./lib/compiler.js').init(grunt);

  grunt.registerMultiTask('ejs-precompile', 'Convert ejs to seajs module', function () {
    var options = this.options({
      banner: '',
      footer: ''
    });

    this.files.forEach(function (f) {
      var src = f.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found.');
          return false;
        }
        return true;
      });
      if (src.length === 0) {
        grunt.log.warn('Destination ' + chalk.cyan(f.dest) + ' not written because src files were empty.');
        return;
      }
      if(!f.dest){
        grunt.log.warn('dest param is not fount!');
      }

      var fileObjs = [];
      src.map(function (filepath) {
        fileObjs.push({
          path: filepath,
          name: /([\w\d._-]+)\.ejs/.exec(filepath)[1]
        });
      });
      if(fileObjs.length > 0){
        var moduleName = (typeof f.id != 'undefined') ? f.id : /([\w\d._-]+).js$/.exec(f.dest)[1];
        var code = compiler.compile(fileObjs, moduleName, f.deps);
        if(options.banner){
          code = grunt.template.process(options.banner) + code;
        }
        if(options.footer){
          code += '\r' + grunt.template.process(options.footer);
        }
        grunt.file.write(f.dest, code, {encoding:'utf8'});
        grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');
      }
    });
  });
};
