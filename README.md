# grunt-component-build

Build and watch Components. 

## Getting Started
If you haven't used `grunt` before, be sure to check out the Getting Started guide, as it explains how to create a `Gruntfile` as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

Load the tasks in your Gruntfile with

```javascript
grunt.loadNpmTasks('grunt-component-build');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/gruntjs/grunt/wiki/Getting-started

## The Basics

Add a component section to your Grunt file:

```js
component: {
  app: {
    files: [{
      expand: true,
      src: ['feature_a', 'feature_b'],
      cwd: "./features/",
      dest: './public'
    }],
      
    options: {
      standalone: true,
      processStyles: false
    }
  }
}
```

You can add as many sub-tasks to the component task and they will be compiled separately.

## Extending Component with Plugins

Builder.js allows us to extending it so we can add support for other languages, like Coffeescript or Jade. You can do this easily in the `configure` option in your grunt file.

```js
  options: {
    configure: function(builder) {
      builder.use(myPlugin);
    }
  }
```

These plugins are extremely simple. You can grab them from npm or write your own. 

* [Stylus](https://npmjs.org/package/component-stylus)
* [Coffeescript](https://npmjs.org/package/builder-coffee)
* [Prebuilder](https://npmjs.org/package/component-prebuilder)

## Built-in Plugins

There are two plugins built into this grunt task. They compile Coffeescript and plain HTML. 

```js
  options: {
    plugins: ['coffee', 'templates']
  }

```

These are located in the `/plugins` folder and function the same way as any other builder.js plugin. These are opt-in so you'll need to add the line to your config.

### Templates

Templates will convert any html files you have added to the `templates` section of your `component.json` file so you can require them without needing to do anything. 

```js
var template = require('./template.html');
```

### Coffeescript

This works the same way as the template plugin except that it uses the scripts section of the `component.json` file. It will automatically compile and files ending in `.coffee` and allow you to require them as if they were JS files. 

```js
var calendar = require('calendar');
```

You don't need to add the `.js` extension when requiring the coffee files. Each coffee file is converted on the fly and replaces the original in the built file.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
0.2.x - regular: Forked and added support for grunt's expand: true and options object. 
0.2.0beta - Added support for grunt 0.4.0  
0.1.4 - Added builder.js plugin support  
0.1.0 - First release  

## License
Copyright (c) 2012 Anthony Short  
Licensed under the MIT license.
