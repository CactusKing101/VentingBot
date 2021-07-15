const Discord = require('discord.js');
const fs = require('fs');
const data = require('./general/data.json');
const token = require('./general/token.json');
const config = require('./general/config.json');
const client = new Discord.Client();
var main = data.main;
var id = data.id;

function dm(targetId = String, description = String, color = String) {
  const ch = client.users.cache.get(targetId);
  var embed = new Discord.MessageEmbed().setDescription(description).setColor(color);
  ch.send(embed);
}

function reply(id, token, cont) {
  client.api.interactions(id, token).callback.post({data: {
    type: 4,
    data: {
      content: cont,
      flags: 1 << 6,
    }
  }});
}

async function vent(member, chId, chType, iId, iToken, vent) {
  const ventCh = client.channels.cache.get(chId);
  try {
    const webhooks = await ventCh.fetchWebhooks();
    const webhook = webhooks.first();

    if (webhook == null) return reply(iId, iToken, 'Error:\nNo webhooks found!');
    main.push([++id, `${member.user.username}#${member.user.discriminator}`, member.user.id]);
    var embeds = [];
    embeds.push(new Discord.MessageEmbed().setDescription(vent).setColor('#4995a3').setFooter(`Id: ${id}`));
    await webhook.send(`[Venting] Id: ${id}`, {
      username: 'Anonymous Venter',
      avatarURL: client.user.displayAvatarURL(),
      embeds: embeds,
    });
    reply(iId, iToken, `Your message has been sent to the ${chType}venting channel. Your life is important. We all care very deeply about you. Please know we are all here for you.\n*Keep in mind you can always request to delete a message you sent by dming CactusKing101#2624*`, '#4995a3');
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

async function deleteVent(tw, iId, iToken, id) {
  try {
    if (tw) {
      var yes = true;
      const messages = await client.channels.cache.get('834546271356321822').messages.fetch();
      for(let msg of messages) {
        if (msg.webhookID != null && msg.content.split(' ')[2] == id) {
          msg.suppressEmbeds(true);
          reply(iId, iToken, `Deleted vent id ${id}`);
          !yes;
        }
      }
      if (yes) reply(iId, iToken, `Could not locate vent\nIf you believe this is an actual error contact CactusKing101#2624`);
    } else {
      var yes = true;
      const messages = await client.channels.cache.get('833730808686575626').messages.fetch({ limit: 20 });
      messages.forEach((msg, id) => {
        console.log(id);
        var ventId = msg.content.split(' ');
        if (msg.author.username == 'Anonymous Venter' && msg.author.discriminator == '0000' && ventId[2] == id) {
          console.log(msg);
          msg.suppressEmbeds(true);
          reply(iId, iToken, `Deleted vent id ${id}`);
          !yes;
        } 
      });
      if (yes) reply(iId, iToken, `Could not locate vent\nIf you believe this is an actual error contact CactusKing101#2624`);
    }
  } catch (err) {
    console.warn(err);
  }
}

client.once('ready', () => {
  client.user.setActivity('dm to vent');
  console.log(`Logged in as ${client.user.tag}`);
  client.api.applications(client.user.id).guilds('830495072876494879').commands.post({data: {
    name: 'vent',
    description: 'Sends an anonymous vent the venting channel',
    options: [
      {
        name: 'tw',
        type: 5,
        description: 'Whether or not the vent contains triggers',
        required: true,
      },
      {
        name: 'vent',
        type: 3,
        description: 'The vent that will be sent into the channel',
        required: true,
      },
    ],
  }});
  client.api.applications(client.user.id).guilds('830495072876494879').commands.post({data: {
    name: 'delete',
    description: 'Delete a vent you have sent',
    options: [
      {
        name: 'id',
        type: 4,
        description: 'Id to the vent you have sent',
        required: true,
      },
      {
        name: 'tw',
        type: 5,
        description: 'Was this vent in the trigger warning channel?',
        required: true,
      },
    ],
  }});
});

client.ws.on('INTERACTION_CREATE', async interaction => {
  if (interaction.data.name == 'vent') {
    let banned = false;
    for (let i = 0; i < config.banned.length; ++i) {
      if (config.banned[i] == interaction.member.user.id) {
        banned = true;
        break;
      }
    }
  
    if (banned) return reply(interaction.id, interaction.token, 'Sorry you have been **banned** from using this bot. If you think this is a mistake or want to appeal, contact CactusKing101#2624. Depression and suicide is not a joke and if you feel you need help please call a suicide hotline.\nhttps://www.opencounseling.com/suicide-hotlines');
    if (interaction.data.options[0].value) {
      vent(interaction.member, '834546271356321822', 'trigger warning ', interaction.id, interaction.token, interaction.data.options[1].value);
    } else {
      vent(interaction.member, '833730808686575626', '', interaction.id, interaction.token, interaction.data.options[1].value);
    }
  } else if (interaction.data.name == 'delete') {
    if (data.main[interaction.data.options[0].value - 1][2] == interaction.member.user.id) {
      deleteVent(interaction.data.options[1].value, interaction.id, interaction.token, interaction.data.options[0].value);
    } else {
      reply(interaction.id, interaction.token, `This isn't your vent according to the database\nContact CactusKing101#2624 if you believe this an actual error`);
    }
  }
});

client.on('message', (msg) => {
  if (msg.author.bot || msg.webhookID) return;

  if (msg.channel.id == '833730808686575626' || msg.channel.id == '834546271356321822') {
    if (msg.reference != null) {
      client.channels.cache.get(msg.reference.channelID).messages.fetch(msg.reference.messageID)
        .then(message => {
          if (message.webhookID != null) {
            const id = Number(message.content.split(' ')[2]);
            dm(main[id - 1][2], `This is an automated message to alert you someone replied to your vent with the id ${id}\n\nAuthor: ${msg.author.tag}\n${msg.content}\n\n**This has no way to be tracked back to you unless you request your vent to be deleted or it is investigated.**`, '#9e9d9d')  
          }
        });
    }
  }
});

client.login(token.main);