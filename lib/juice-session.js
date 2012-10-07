
var Session = require('./session');

var JuiceSession = module.exports = function() {
	var self = this;

	self.defConfigFile = '/usr/share/juice-session/default.cfg';
	self.loop = null;
};

JuiceSession.prototype.init = function(configFile) {
	var self = this;

	if (configFile)
		self.defConfigFile = configFile;

	var session = new Session;
	session.loadConfigFile(self.defConfigFile, function() {
		session.start();

		self.loop = setInterval(function() {
		}, 0);
	});
}

