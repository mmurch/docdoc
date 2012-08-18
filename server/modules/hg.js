var	terminal = require('./terminal');

this.Hg = function(localRepoPath, hgUrl){

	var atRepo = ' -R ' + localRepoPath;

	if (!localRepoPath || !hgUrl){
		return;
	}

	var updateClean = function(callback){
		console.log('hg update -C' + atRepo);
		terminal.exec('hg update -C' + atRepo, callback);
	};

	var purge = function(callback){
		console.log('hg st -un0 | xargs -0 rm' + atRepo);
		terminal.exec('hg st -un0 | xargs -0 rm' + atRepo, callback);
	}

	var pull = function(callback){
		console.log('hg pull' + atRepo);
		terminal.exec('hg pull' + atRepo, callback);
	};

	this.reset = function(callback){
		purge(function(){
			pull(function(){
				updateClean(function(){
					console.log('hg reset complete');
					if (callback){
						callback();
					}
				});
			});
		});
	};
};
