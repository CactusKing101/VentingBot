const Discord = require('discord.js');
const fs = require('fs');
const data = require('./general/data.json');
const token = require('./general/token.json');
const config = require('./general/config.json');
const client = new Discord.Client();
var main = data.main;
var id = data.id;

function reply(chId = String, description = String, color = String) {
  const ch = client.channels.cache.get(chId);
  var embed = new Discord.MessageEmbed().setDescription(description).setColor(color);
  ch.send(embed);
}

async function vent(msg = Discord.Message, chId = String, chType = String) {
  const ventCh = client.channels.cache.get(chId);
  try {
    const webhooks = await ventCh.fetchWebhooks();
    const webhook = webhooks.first();

    if (webhook == null) return msg.channel.send('Error:\nNo webhooks found!');
    main.push([++id, msg.author.tag, msg.author.id]);
    var embeds = [];
    embeds.push(new Discord.MessageEmbed().setDescription(msg.content).setColor('#9e9d9d').setFooter(`Id: ${id}`));
    for (let i of msg.attachments) {
      embeds.push(new Discord.MessageEmbed().setImage(i[1].url).setColor('#9e9d9d').setFooter(`Id: ${id}`));
    }
    await webhook.send(`[Venting] Id: ${id}`, {
      username: 'Anonymous Venter',
      avatarURL: client.user.displayAvatarURL(),
      embeds: embeds,
    });
    reply(msg.channel.id, `Your message has been sent to the ${chType}venting channel. Your life is important. We all care very deeply about you. Please know we are all here for you.\n*Keep in mind you can always request to delete a message you sent by dming CactusKing101#2624*`, '#9e9d9d');
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

client.once('ready', () => {
  client.user.setActivity('dm to vent');
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async msg => {

  if (msg.author.bot || msg.channel.type != 'dm') return;
  let banned = false;
  for (let i = 0; i < config.banned.length; ++i) {

    if (config.banned[i] == msg.author.id) {
      banned = true;
      break;
    }
  }

  if (banned) return msg.channel.send('Sorry you have been **banned** from using this bot. If you think this is a mistake or want to appeal, contact CactusKing101#2624. Depression and suicide is not a joke and if you feel you need help please call a suicide hotline.\nhttps://www.opencounseling.com/suicide-hotlines');
  msg.react('👍').then(() => msg.react('👎'));
  const filter = (reaction, user) => {
    return ['👍', '👎'].includes(reaction.emoji.name) && user.id == msg.author.id;
  };
  msg.channel.send(new Discord.MessageEmbed().setDescription('Hey just a quick question! Does your vent contain **any** triggers listed?\nYes it does: 👍\nNo it doesn\'t: 👎\nList of triggers: http://bit.ly/trigger-warnings-list').setColor('#9e9d9d'));
  msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
    .then(collected => {
      const reaction = collected.first();
      
      if (reaction.emoji.name === '👍') {
        vent(msg, '834546271356321822', 'trigger warning ');
      } else {
        vent(msg, '833730808686575626', '');
      }
    })
    .catch(collected => {
      reply(msg.channel.id, 'You reacted with neither a thumbs up, nor a thumbs down. Your vent will not be sent.', '#9e9d9d');
    });
});

client.login(token.main);