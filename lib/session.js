
var path = require('path');
var fs = require('fs');

var WindowManager = require('./window_manager');
var Program = require('./program');
var AutoStart = require('./autostart');

var Session = module.exports = function() {
	var self = this;

	self.autostart = new AutoStart;
	self.windowManager = null;
	self.programs = [];
};

Session.prototype.loadConfigFile = function(configFile, callback) {
	var self = this;

	function _windowManagerInit(config) {
		if (config.hasOwnProperty('window_manager')) {
			self.windowManager = new WindowManager(config.window_manager.command);
		}
	}

	function _programInit(config) {
		config.programs.forEach(function(prog, index, progs) {

			var program = new Program;
			program.name = prog.name;
			program.command = prog.command;
			program.restartable = prog.restartable;

			self.programs.push(program);
		});
	}

	fs.exists(configFile, function(exists) {
		if (!exists)
			return;

		fs.readFile(configFile, 'utf8', function(err, data) {
			var config = null;

			if (!err)
				config = JSON.parse(data);

			process.nextTick(function() {

				// Loading window manager
				_windowManagerInit(config);

				// Loading startup programs
				_programInit(config);

				callback(err, config);
			});

		});
	});
};

Session.prototype.start = function() {
	var self = this;

	self.autostart.init(function() {

		self.autostart.start();

		// Start Window Manager
		if (self.windowManager) {
			self.windowManager.start();
		}

		// Start all programs
		self.programs.forEach(function(program, index, programs) {
			program.start();
		});
	});
};
