require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api'),
  bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true}),
  Promise = require('bluebird'),
  feed = Promise.promisify(require('feed-read'));

feedList = [{
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

var options = {
  reply_markup: {
    keyboard: sites
  }
}

console.log('I\'m alive!');

bot.onText(/\/start/, (msg) => {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, 'Please select the news source', options)
    .then(choice => {
      bot.onText(new RegExp(sites.join('|')), (msg, match) => {
        feed({uri: feedList.find(obj => obj.site === match[0]).rss, encoding: 'utf8'}).then(articles => {
          for (let article of articles)
            console.log(article.title);
        });
      });
    })
});
