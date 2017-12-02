'use strict';

const ACCESS_TOKEN = '9135ffd0ad67013550853186554db110';

const program = require('commander');
const fs = require('fs');
const Handlebars = require('handlebars');
const API = require('groupme').Stateless

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

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const messageSource = fs.readFileSync("html/message.hbs").toString();
const messageTemplate = Handlebars.compile(messageSource);


async function main(){
	let group = await getGroup();
	let messages = await getMessagesForGroup(group.id);
	// let messages = [example];
	let formattedMessages = await formatMessages(group, messages);
	let html = await messagesToHTML(messages);
	fs.writeFileSync("out.html", html);
	return 0;
}

async function getGroup(){
	let groups = await API.Groups.index.Q(ACCESS_TOKEN);
	let group = groups.filter((currGroup)=>{return currGroup.name === program.group;})[0];
	return group;
}

async function getMessagesForGroup(id){
	let messageCount = null, beforeId = null, messages = []
	while(messages.length < messageCount || messageCount == null) {
		let nextMessages = await API.Messages.index.Q(ACCESS_TOKEN, id, {limit:100, before_id: beforeId});
		messageCount = nextMessages.count;
		messages = messages.concat(nextMessages.messages);
		beforeId = messages[messages.length -1].id;
		console.log(`Current Messages: ${messages.length} of ${messageCount}  - ${beforeId}`);		
	}
	return messages;
}

async function formatMessages(group, messages){
	return messages.map((message)=>{
		message.favorited_by = message.favorited_by.map((id)=>{
			return group.members.filter((member)=>{
				return member.user_id === id}
			)[0];
		});
		return message;
	});
}

async function messagesToHTML(messages){
	return messages
	.map(messageTemplate)
	.reverse()
	.join("");
}

const example = { 
	attachments:[ 
		{ 
			type: 'image',
			url: 'https://i.groupme.com/700x700.jpeg.d9bf28b55b704aeea40c91102c1312bf' 
		} 
	],
	avatar_url: 'https://i.groupme.com/900x907.jpeg.9150b0d992f74a70be6a9a1755238b84',
	created_at: 1512182357,
    favorited_by: [ 
		'14677983', 
		'29309042' 
	],
    group_id: '18598025',
    id: '151218235721101306',
    name: 'Joe™',
    sender_id: '20653569',
    sender_type: 'user',
    source_guid: '1BD582D9-C67E-4C20-A966-4E92B17640BE',
    system: false,
    text: 'This man is Maggie ',
	user_id: '20653569' 
}

main();