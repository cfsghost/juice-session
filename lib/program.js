
var child_process = require('child_process');

var Program = module.exports = function() {
	var self = this;

	self.name = '';
	self.command = '';
	self.restartable = true;
	self.state = 'ready';
	self.child = null;
};

Program.prototype.run = function() {
	var self = this;

	self.child = child_process.exec(self.command, function(err, stdout, stderr) {
	});

	self.child.on('exit', function (code) {
		// Restart program if it is restartable
		if (self.restartable && self.state == 'running') {
			self.run();
		}
	});
};

Program.prototype.start = function() {
	var self = this;

	self.state = 'running';
	self.run();
};

Program.prototype.stop = function() {

	var self = this;

	self.state = 'ready';
	self.child.kill('SIGHUP');
};
