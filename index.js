const Discord = require('discord.js');
const fs = require('fs');
const data = require('./general/data.json');
const token = require('./general/token.json');
const config = require('./general/config.json');
const client = new Discord.Client();
var main = data.main;
var id = data.id;

client.once('ready', () => {
  client.user.setActivity('dm to vent');
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async msg => {
  if (msg.author.bot) return;
  const ventCh = client.channels.cache.get('833730808686575626');
  const guild = client.guilds.cache.get('830495072876494879');
  if (msg.channel.type == 'dm') {
    let banned = false;
    for(let i = 0; i < config.banned.length; ++i) {
      if (config.banned[i] == msg.author.id) {
        banned = true;
        break;
      }
    }
    if (banned) return msg.channel.send('Sorry you have been banned from using this bot. If you think this is a mistake or want to appeal contact CactusKing101#2624. Depression and suicide is not a joke and if you feel you need help please call a suicide hotline.\nhttps://www.opencounseling.com/suicide-hotlines');
    try {
      const webhooks = await ventCh.fetchWebhooks();
      const webhook = webhooks.first();
      
      if (webhook == null) return msg.channel.send('Error:\nNo webhooks found!');
      main.push([++id, msg.author.tag, msg.author.id]);
      var embed = new Discord.MessageEmbed().setDescription(msg.content).setColor('#9e9d9d').setFooter(`Id: ${id}`);
      await webhook.send('[Venting]', {
        username: 'Anonymous Venter',
        avatarURL: guild.iconURL(),
        embeds: [embed],
      });
      msg.author.send('Your message has been sent to the venting channel. Your life is important. We all care very deeply about you. Please know we are all here for you.\n*Keep in mind you can always request to delete a message you sent by dming CactusKing101#2624*');
      var tempData = {
        main: main,
        id: id
      };
      let json = JSON.stringify(tempData);
      fs.writeFileSync('general/data.json', json);
      console.log(id);
    } catch (error) {
      console.warn(error);
    }
  }
});

client.login(token.main);