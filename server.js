require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api'),
  bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true}),
  Promise = require('bluebird'),
  request = require('request-promise'),
  feed = Promise.promisify(require('feed-read'));

var feedList = [{
  site: 'Jovem Nerd',
  rss: 'http://jovemnerd.com.br/rss'
}, {
  site: 'Tecmundo',
  rss: 'http://rss.tecmundo.com.br/feed'
}, {
  site: 'Exame',
  rss: 'http://feeds.feedburner.com/EXAME-Noticias'
}];

var sites = feedList.map(item => [item.site]);
var answerCallbacks = [];

var options = {
  reply_markup: {
    keyboard: sites,
    'one_time_keyboard': true
  }
};

bot.on('message', (msg) => {
  let callback = answerCallbacks[msg.chat.id];
  if (callback) {
    delete answerCallbacks[msg.chat.id];
    callback(msg);
  }
});

console.log('I\'m alive!');

bot.onText(/\/start/, (msg) => {
  var chatId = msg.from.id;
  bot.sendMessage(chatId, 'Please select the news source', options)
    .then(() => {
      answerCallbacks[chatId] = function(msg) {
        console.log('entrou', msg);
        return feed({uri: feedList.find(obj => obj.site === msg.text).rss,
          encoding: 'utf8'})
          .then(articles => {
            console.log(articles);
            let voice = [];
            for (var i = 0; i < 3; i++) {
              // Via text
              // bot.sendMessage(chatId, articles[i].link);
              voice.push(articles[i].title);
            }

            let voiceOptions = {
              url: 'https://text-to-speech-demo.mybluemix.net/' +
              'api/synthesize?voice=pt-BR_IsabelaVoice&text=' + encodeURI(voice.join('.\n').replace('|')),
              encoding: null,
              method: 'GET'
            };

            console.log('text:', voice.join('.\n').replace('|'));
            console.log(voiceOptions.url);

            return request(voiceOptions);
          })
          .then(file => {
            bot.sendVoice(chatId, file);
          });
      };
    });
});
