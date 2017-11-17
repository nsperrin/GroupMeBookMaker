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

const ACCESS_TOKEN = '9135ffd0ad67013550853186554db110';
var API = require('groupme').Stateless


function getGroup(group, callback){
	var group = [];
	API.Groups.index(ACCESS_TOKEN, (err, ret) => {
		if(!err){
			group = ret.filter((thisGroup)=>{
				return thisGroup.name.trim() === program.group.trim();
			});
			if(group.length === 1){
				callback(null, group[0]);
			}else{
				callback("Could not find group " + program.group, null);
			}
		}else {
			callback(null, "Error getting Groups" + err);
		}
	});
}

function getAllMessages(group, callback){
	getMessages(group, null, [], callback);
}

function getMessages(group, messageCount, messages, finalCallback){
	console.log(messages.length + " of " + messageCount);
	if(!messageCount || !messages){
		API.Messages.index(ACCESS_TOKEN, group.id, {}, (err, ret)=>{
			if(!err){
				getMessages(group, ret.count, ret.messages, finalCallback);
			} else {
				finalCallback("Could Not get Messages", null, null);
			}
		});
	} else if(messageCount <= messages.length ){
		finalCallback(null, group, {count: messageCount, messages: messages});
	} else {
		var beforeId = messages[messages.length -1].id;
		API.Messages.index(ACCESS_TOKEN, group.id, {before_id: beforeId}, (err, ret)=>{
			if(!err){
				getMessages(group, ret.count, messages.concat(ret.messages), finalCallback);
			} else {
				finalCallback("Could Not get Messages", null, null);
			}
		});
	}
}

getGroup(program.group, (err, group) => {
	if(!err) throw new Error(err);
	getAllMessages(group, (err, group, messages)=>{
		if(!err) throw new Error(err);
		console.log(messages.messages[messages.count-1]);
	});	
});