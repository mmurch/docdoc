var exec = require('child_process').exec;
	
this.exec = function(command, callback, useConsole){

	if (useConsole){
		console.log('before: ' + command);
	}

	exec(command, function(error, stdout, stderr){
		if (useConsole){
			
			if (stdout){
				console.log('stdout  (' + command + '):' + stdout);
			}

			if (error){
				console.log('ERROR (' + command + '): ' + error);
			}

			if (stderr){
				console.log('STDERR (' + command + '): ' + stderr);
			}		
			console.log('after: ' + command);	
		}
		

		if (callback){
			callback(stdout);
		}
	});
};