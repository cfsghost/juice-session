
var Program = require('./program');

var WindowManager = module.exports = function(command) {

	this.program = new Program;
	this.program.command = command;
	this.program.restartable = true;
};

WindowManager.prototype.start = function() {
	var self = this;

	if (self.program.command) {
		self.program.start();
	}
};
