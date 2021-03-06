'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');

    this.log(yosay('\'Allo \'allo! Out of the box I include Phoenix and some AngularJS recommended modules.'));
  },

  prompting: {
    askForPhoenix: function () {
      var done = this.async();

      // Prompt to install Phoenix.
      this.prompt([{
        type: 'confirm',
        name: 'phoenix',
        message: 'Would you like to use Phoenix?',
        default: true
        }], function (props) {
        this.phoenix = props.phoenix;

        done();
      }.bind(this));
    },

    askForModules: function() {
      var done = this.async();

      // Prompt to install angular modules.
      var angularPrompts = [{
        type: 'checkbox',
        name: 'modules',
        message: 'Which modules would you like to include?',
        choices: [
          {
            value: 'animateModule',
            name: 'angular-animate.js',
            checked: true
          }, {
            value: 'ariaModule',
            name: 'angular-aria.js',
            checked: false
          }, {
            value: 'cookiesModule',
            name: 'angular-cookies.js',
            checked: true
          }, {
            value: 'resourceModule',
            name: 'angular-resource.js',
            checked: true
          }, {
            value: 'messagesModule',
            name: 'angular-messages.js',
            checked: false
          }, {
            value: 'routeModule',
            name: 'angular-route.js',
            checked: true
          }, {
            value: 'sanitizeModule',
            name: 'angular-sanitize.js',
            checked: true
          }, {
            value: 'touchModule',
            name: 'angular-touch.js',
            checked: true
          }
        ]
      }];

      this.prompt(angularPrompts, function (props) {
        var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
        this.animateModule = hasMod('animateModule');
        this.ariaModule = hasMod('ariaModule');
        this.cookiesModule = hasMod('cookiesModule');
        this.messagesModule = hasMod('messagesModule');
        this.resourceModule = hasMod('resourceModule');
        this.routeModule = hasMod('routeModule');
        this.sanitizeModule = hasMod('sanitizeModule');
        this.touchModule = hasMod('touchModule');

        var angMods = [];

        if (this.animateModule) {
          angMods.push("'ngAnimate'");
        }

        if (this.ariaModule) {
          angMods.push("'ngAria'");
        }

        if (this.cookiesModule) {
          angMods.push("'ngCookies'");
        }

        if (this.messagesModule) {
          angMods.push("'ngMessages'");
        }

        if (this.resourceModule) {
          angMods.push("'ngResource'");
        }

        if (this.routeModule) {
          angMods.push("'ngRoute'");
          this.env.options.ngRoute = true;
        }

        if (this.sanitizeModule) {
          angMods.push("'ngSanitize'");
        }

        if (this.touchModule) {
          angMods.push("'ngTouch'");
        }

        if (angMods.length) {
          this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
        }

        done();
      }.bind(this));
    }
  },

  writing: {
    phoenix: function () {
      if (this.phoenix) {
        this.directory(this.templatePath('Phoenix/Assets'),
                            this.destinationPath('assets'));
      }
    },

    html: function () {
      var dest = (this.phoenix ? this.destinationPath('assets/src/templates/index.html') : this.destinationPath('index.html'));
      this.fs.copyTpl(
        this.templatePath('index.html'),
        dest,
        {
          appname: this.appname,
        }
      );
    },

    angular: function () {
      mkdirp('app');
    },

    package: function() {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        { appname: this.appname }
      );

      this.fs.copyTpl(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json'),
        {
          appname: this.appname,
          animateModule: this.animateModule,
          ariaModule: this.ariaModule,
          cookiesModule: this.cookiesModule,
          messagesModule: this.messagesModule,
          resourceModule: this.resourceModule,
          routeModule: this.routeModule,
          sanitizeModule: this.sanitizeModule,
          touchModule: this.touchModule
        }
      );
    },
    
    gulp: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        { includePhoenix: this.phoenix }
      );
    }
  },

  install: {
    // Install selected Angular modules.
    packaged: function() {
      this.installDependencies();
    }
  }
});