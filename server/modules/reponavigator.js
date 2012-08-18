//dependencies 
var config = require('./config'),
	terminal = require('./terminal'),
	_ = require('underscore'),
	fs = require('fs');

//locals
var onRefresh = function(){},
	modules = [],
	folderPaths = [];

//public
this.getModules = function(){
	return modules;
};

var refreshModules = function(callback){

	folderPaths = [];
	modules = [];

	terminal.exec('ls -R ' + config.stagingPath, 
		function(stdout){
							
			var pathBreaks  = stdout.split(config.stagingPath),
				moduleDict = {};


			_(pathBreaks).each(function(section){

				//extract portions of section
				var colon = section.indexOf(':'),
					moduleNameAndPath = section.substring(0, colon),
					moduleName = moduleNameAndPath.split('/')[1],
					secondSlash = moduleNameAndPath.substring(1).indexOf('/'),
					pathBase = secondSlash == -1 
						? ''
						: moduleNameAndPath.substring(secondSlash + 1),
					filesFoundAtPathBase = false;
				
				// console.log(moduleNameAndPath);

				moduleDict[moduleName] = 
					moduleDict[moduleName] || { name: moduleName, files: []};

				//extract file names
				_(section.substring(colon + 1).split('\n'))
					.each(function(fileName){

						//add paths to appropriate module
						if (fileName != '' && fileName.indexOf('.js') > 0){
							moduleDict[moduleName].files.push({ 
								path: pathBase + '/' + fileName,
								pathBase : pathBase,
								moduleName: moduleName 
							});
							filesFoundAtPathBase = true;
						}
					});

				//store paths with js files, docco needs to be called
				//on each of these paths individually
				if (filesFoundAtPathBase){
					folderPaths.push(config.stagingPath + '/' + moduleName + pathBase);
				} 

			});

			//turn moduledict into module array
			modules = _.chain(moduleDict)
						.values()
						.filter(function(module){
							return module.files.length > 0;
						})
						.sortBy('name')
						.value();
			
			if (callback){
				callback();
			}

		}, true);
};

var copyModulesToStaging = function(callback){
	terminal.exec('cp -R ' + config.modulePath + ' ' 
		+ config.stagingPath, callback);
};

var clearStaging = function(callback){
	terminal.exec('rm -rf ' + config.stagingPath, callback);
};

var renameModulesForOutput = function(callback){

	var files = [];

	_(modules).each(function(module){
		_(module.files).each(function(file){
			files.push({file: file, moduleName: module.name});
		});
	});

	var fileCount = files.length;

	var renameFile = function(index){
		if (index == fileCount){
			if (callback){
				callback()
			}
			return;
		}

		var file = files[index],
			newFileName = (file.moduleName + file.file.path).replace(/\//g, '_');

		terminal.exec('mv ' + config.stagingPath + '/' + 
			file.moduleName + file.file.path + ' ' + config.stagingPath +
			 '/' + file.moduleName + file.file.pathBase + '/' + newFileName,
			function(){
				renameFile(++index);
			});
	};

	renameFile(0);
};

var clearOutput = function(callback){
	terminal.exec('rm -rf docs',function(){
		if (callback){
			callback();
		}
	});
};

var copyOutputToTemplates = function(callback){
	terminal.exec('rm -rf app/templates/doccoOutput', function(){
		terminal.exec('mkdir app/templates/doccoOutput', function(){
			terminal.exec('cp docs/* app/templates/doccoOutput', function(){
				if (callback){
					callback();
				}
			});
		});
	});
}

//TODO: figure out which promises implementation to use to simplify this
var doccoOutput = function(callback){
	var finishedPaths = _(folderPaths).map(function(d){ return 0;});
	function callbackIfPossible(){
		if (callback && !_(finishedPaths).any(function(done){return !done;})){
			callback();
		}
	}

	_(folderPaths).each(function(path, index){
		// console.log('docco ' + path);
		terminal.exec('docco ' + path + '/*.js', function(){
			finishedPaths[index] = 1;
			callbackIfPossible();
		});
	});

	if (folderPaths.length == 0){
		console.log('no folder paths');
	}

};

this.reset = function(callback){

	clearStaging(function(){
		console.log('after clear staging');
		clearOutput(function(){
			console.log('after clear output');
			copyModulesToStaging(function(){
				console.log('after copy to staging');
				refreshModules(function(){
					console.log('after refresh');
					renameModulesForOutput(function(){
						console.log('after rename output');
						doccoOutput(function(){
							console.log('after docco output');
							copyOutputToTemplates(function(){
								console.log('docco reset complete');
								if (callback){
									callback();
								}
							});
						});
					});
				});
			});		
		});
	});
};

