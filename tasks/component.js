/*jshint node:true */
/*
 * grunt-component
 * https://github.com/anthonyshort/grunt-component-build
 *
 * Copyright (c) 2012 Anthony Short
 * Licensed under the MIT license.
 */

'use strict';

var Builder = require('component-builder');
var fs = require('fs');
var path = require('path');
var template = fs.readFileSync(__dirname + '/../lib/require.tmpl').toString();
var debug = require('debug')("grunt:component");

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('component', 'component-build for grunt.', function() {
    var self = this;
    var done = self.async();
    var q;
        
    q = grunt.util.async.queue(function(task, cb) {
      buildComponent(grunt, task.opts, task.src, task.srcDir, task.destDir, cb);
    }, 1);
    
    q.drain = function() {done();};
    
    var opts = this.options({
      CSSURLPrefix: null,
      includeDevelopmentDependencies: false,
      addSourceUrls: false,
      processStyles: true,
      processScripts: true,
      standalone: false,
      configure: null
    });
    
    var destDir;
    var srcDir;
    this.files.forEach(function(filePair) {

      filePair.src.forEach(function(src) {
        destDir = filePair.dest;

        if (grunt.file.isDir(src)) {
          srcDir = src;
          src = path.join(srcDir, "component.json");
        } else {
          srcDir = path.dirname(src);
        }
        
        if (typeof destDir === 'undefined') {
          destDir = path.join(srcDir, "build");
        }
        
        debug("srcDir %s", srcDir);
        debug("destDir %s", destDir);
        
        q.push({
          opts: grunt.util._.clone(opts),
          src: src,
          srcDir: srcDir,
          destDir: destDir
        }, function(err) {
          if (err) {
            grunt.log.error(err.message);
            grunt.fatal(err.message);
          }
        });

      });
    });
  });
  
  
  
  function buildComponent(grunt, opts, src, srcDir, destDir, cb) {
  
    // The component builder
    var builder = new Builder(srcDir);

    // Where to output the final file
    builder.copyAssetsTo(destDir);

    // By default Builder takes the paths of the dependencies
    // from the current directory (here the Gruntfile path).
    // So in case the dependencies are not stored in the /components
    // but in the srcDir/components, we have to add it to the lookup.
    builder.addLookup(path.join(srcDir, 'components'));
  
    // The component config
    var config = require(src);

    if (config.paths) {
      config.paths = config.paths.map(function(p) {
        return path.resolve(srcDir, p);
      });

      builder.addLookup(config.paths);
    }

    // CSS URL prefix
    if (opts.CSSURLPrefix) {
      builder.prefixUrls(opts.CSSURLPrefix);
    }

    // Development mode
    if (opts.includeDevelopmentDependencies) {
      builder.development();
    }

    if (opts.addSourceUrls === true) {
      debug("adding source urls!");
      builder.addSourceURLs();
    } else {
      debug("not adding source urls!");
    }

    // Ignore component parts
    // if (opts.ignore) {
    //   Object.keys(opts.ignore).forEach(function(n) {
    //     var type = opts.ignore[n];
    //     builder.ignore(n, type);
    //   });
    // }

    // Set the config on the builder. We've modified
    // the original config from the file and this will
    // override settings during the build
    builder.conf = config;

    var name;
    if (typeof config.name === 'string') {
      name = config.name;
    } else {
      return cb(new Error("No name given in component.json"));
    }
    debug("processing component",name);

    if (opts.plugins) {
      opts.plugins.forEach(function(name) {
        
        var plugin;
        if (typeof name === 'string') {
            plugin = require('../plugins/' + name);
        } else {
          plugin = name;
        }
        if (plugin) {
          builder.use(plugin);
        } else {
          grunt.fatal("failed to load component plugin "+ name);
        }
      });
    }

    // Configure hook
    // if (opts.configure) {
    //   opts.configure.call(null, builder);
    // }

    debug("running builder ..");

    // Build the component
    builder.build(function(err, obj) {
      if (err) {
        debug("builder failed");
        return cb(err);
      } else {
        debug("builder ok");
      }

      // Write CSS file
      if (opts.processStyles !== false) {
        var cssFile = path.join(destDir, name + '.css');
        debug("writing %s", cssFile);
        grunt.file.write(cssFile, obj.css.trim());
      }

      // Write JS file
      if (opts.processScripts !== false) {
        var jsFile = path.join(destDir, name + '.js');
        debug("writing %s", jsFile);
        if (opts.standalone) {
          // Defines the name of the global variable (window[opts.name]).
          // By default we use the name defined in the component.json,
          // else we use the `standalone` option defined in the Gruntfile.
          obj.name = name;
          obj.config = config;

          var string = grunt.template.process(template, { data: obj });
          grunt.file.write(jsFile, string);
        } else {
          grunt.file.write(jsFile, obj.require + obj.js);
        }
      }

      cb(null);
    });
  }
  
  
};