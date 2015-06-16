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
    html: function () {
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('index.html'),
        {
          appname: this.appname,
        }
      );
    },

    misc: function () {
      mkdirp('app');
    }
  },

  install: {
    
    // Install Phoenix if selected.
    installPhoenix: function() {
      if (this.phoenix) {
        this.log(chalk.cyan('Downloading Phoenix.'));
        request
          .get('https://github.com/connectivedx/Phoenix/archive/1.2.1.tar.gz')
          .pipe(zlib.Unzip())
          .pipe(tar.Extract({path: this.destinationRoot(), strip: 1 })
                    .on('end', function() {
                      // Install NodeJS dependencies for the Phoenix build.
                      this.log(chalk.cyan('Installing Phoenix NPM dependencies.'));
                      var phoenixDep = this.spawnCommand('npm', ['install'], {cwd: this.destinationRoot() + '/Assets/src', stdio: 'ignore'});
                      phoenixDep.on('close', function(code) {
                        this.log(chalk.green('Phoenix dependencies installed.'));
                      }.bind(this));
                    }.bind(this)));
      }
    }

    // Install selected Angular modules.
  }
});