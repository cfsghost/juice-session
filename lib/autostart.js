
var Array = require('node-array');
var path = require('path');
var fs = require('fs');
var ini = require('node-ini');

var Program = require('./program');

var AutoStart = module.exports = function() {
	var self = this;

	self.path = null;
	self.systemPath = '/etc/xdg/autostart';
	self.userPath = path.join(process.env.HOME, '.config', 'autostart');
	self.files = [];
};

AutoStart.prototype.findFile = function(filename, callback) {
	var self = this;

	self.files.forEachAsync(function(file, index, list) {
		if (file.filename == filename)
			callback(null, index);

		return false;
	}, function() {

		callback(null, -1);
	});
};

AutoStart.prototype.init = function(callback) {
	var self = this;

	function _scanPath(dirPath, complete) {
		fs.readdir(dirPath, function(err, files) {

			files.forEachAsync(function(filename, index, list, next) {

				self.findFile(filename, function(err, target) {
					if (target == -1) {
						self.files.push({
							filename: filename,
							basedir: dirPath
						});

						next();

						return;
					}

					self.files[target].basedir = dirPath;

					next();
				});

				return true;
			}, function() {
				complete();
			});
		});
	} 

	function _programInit(complete) {
		self.files.forEachAsync(function(file, index, files) {

			ini.parse(path.join(file.basedir, file.filename), function(err, data) {
				if (err)
					return;

				try {
					if (data['Desktop Entry']['Exec']) {
						file.program = new Program;
						file.program.name = data['Desktop Entry']['Name'];
						file.program.command = data['Desktop Entry']['Exec'];
						file.program.restartable = false;
					}
				} catch(e) {
					file.program = null;
				}
			});
		}, function() {
			complete();
		});
	}

	_scanPath(self.systemPath, function() {
		_scanPath(self.userPath, function() {
			_programInit(function() {
				if (callback)
					callback.apply(self, []);
			});
		});
	});
};

AutoStart.prototype.start = function(callback) {
	var self = this;

	self.files.forEachAsync(function(file, index, files) {
		if (file.program)
			file.program.start();
	});
};
