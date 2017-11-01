'use strict';

const program = require('commander');

program
	.version('0.0.1')
	.option('-u, --user [value]', 'Specify User Name')
	.option('-p, --password [value]', 'Password for Specified User')
	.option('-g, --group [value]', 'Group To Get Generate Book For')
	.option('-s, --start [value]', 'First ID in Book')
	.option('-m, --max [value]', 'Maximum Number of Messages Per Page')
	.parse(process.argv);
	
if (!program.user) throw new Error('--user required')
if (!program.password) throw new Error('--password required')
if (!program.group) throw new Error('--group required')
	
console.log("Starting GroupMe Book Maker with the following arguments:");
console.log("\tuser:    \t%s", program.user);
console.log("\tpassword:\t%s", program.password);
console.log("\tgroup:   \t%s", program.group);
if(program.start) console.log("\tstart:   \t%s", program.start);
if(program.max)   console.log("\tmax:     \t%s", program.max);