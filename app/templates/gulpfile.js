'use strict';

var gulp = require('gulp'),
    which = require('which').sync,
    spawn = require('child_process').spawn;

gulp.task('default', function() {
  <% if (includePhoenix) {%>
    spawn(which('gulp'), ['--cwd', 'assets/src', 'default'], { stdio: 'inherit' });
  <% } %>
});