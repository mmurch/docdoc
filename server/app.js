var express = require('express'),
	dvcs = require('./modules/hg'),
	sys = require('sys'),
	exec = require('child_process').exec,
	config = require('./modules/config'), 
	fs = require('fs'),
	repoNavigator = require('./modules/reponavigator');

module.exports = function(){
	//create server
	var api = express.createServer(),
		hg = new dvcs.Hg(config.localRepoPath, config.hgUrl);

	//routes
	api.get('/api/modules', function(req, res){
		res.json(repoNavigator.getModules());
	});

	api.get('/api/reset', function(req, res){
		hg.reset(function(){
			repoNavigator.reset(function(){
				res.json({ success: true });
			});
		});
	});

	// hg.reset(repoNavigator.reset);
	repoNavigator.reset();
	return api;
};

