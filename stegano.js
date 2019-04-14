const Discord = require('discord.js');
const fs = require('fs');
const auth = require('./auth.json');
const stegano = require('./encode.js');
const request = require('request');
const path = require('path');
// Initialize Discord Bot
const bot = new Discord.Client();

/* Bot stuff, creating ready event*/
bot.on('ready', (evt) => {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.user.username + ' - (' + bot.user.id + ')');
});
bot.on('disconnect', (evt) => {
    bot.login(auth.token);
});
bot.on('error', console.error);

const url2Buffer = (theUrl) => {
    return new Promise( (resolve, reject) => {
        request.get({url:theUrl, encoding: null}, function (err, res, body) {
            if(err)
                reject(err);
            resolve(body);//only buffer, because of encoding:null !!!!
        });
    });
};

bot.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `prefix`
    let prefix = "µ";
    if(message.author.id == bot.user.id)
        return;
    if (message.content.substring(0, 1) == prefix) {   
        let args = message.content.substring(prefix.length).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            case 'hide':
                const user_text = args.join(' ');
                if(message.attachments.size > 0){
                    message.attachments.map( (att) => {
                        url2Buffer(att.url).then(bImg => {
                            let crypted = stegano.crypt(bImg, user_text);
                            const attachment = new Discord.Attachment(crypted, 'stegano.png');
                            message.channel.send(attachment);
                        }).catch(e=>console.log(e));
                    });
                }else{
                    message.channel.send(`Je n'ai pas d'image, j'en choisi une par défaut`);
                    let crypted = stegano.crypt(fs.readFileSync(path.join(__dirname, 'default.png')), user_text);
                    const attachment = new Discord.Attachment(crypted, 'stegano.png');
                    message.channel.send(attachment);
                }
            break;
            case 'reveal':
                if(message.attachments.size > 0){
                    message.attachments.map(att => {
                        url2Buffer(att.url).then(bImg => {
                            const msg = stegano.decrypt(bImg);
                            if(msg.length>0)
                                message.channel.send(msg);
                            else
                                message.channel.send(`Aucun message n'est caché dans cette image`);
                        }).catch(e=>console.log(e));
                    });
                }else{
                    message.channel.send(`Il me faut une image à déchiffrer !`);
                }
            break;
        }
    }
});

bot.login(auth.token);