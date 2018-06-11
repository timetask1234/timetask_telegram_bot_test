

const TelegramBot = require('node-telegram-bot-api');
const dialogflow = require('dialogflow');


var FCM = require('fcm-node');
const uuidv1 = require('uuid/v1');

var serverKey = process.env.SERVER_KEY;
var clientToken = process.env.CLIENT_TOKEN;

const getToken = (function(){
    const token = process.env.TELEGRAM_TOKEN;
    return function() {
        return token;
    };
})();
const bot = new TelegramBot(getToken(), {polling: true});

const projectId = 'timetask-telegram-bot';
const sessionId = uuidv1();

const sessionClient = new dialogflow.SessionsClient({keyFilename:'./timetask-telegram-bot-49ebe8b01110.json'})
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

var fcm = new FCM(serverKey);

var push_data = {
 // 수신대상
 to: clientToken,
 // 메시지 중요도
 priority: "high",
 // App 패키지 이름
 restricted_package_name: "fcm.lge.com.fcm",
 // App에게 전달할 데이터
 data: {
     title: 'Registered schedule by telegram',
     body: 'request.body.queryResult.fulfillmentText'
     }
};

bot.onText((.+)/, (msg, match) => {
    
   var result;

   const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: match[0],
      languageCode: 'en-US',
    },
  },
 };
    
   sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    result = responses[0].queryResult;
    console.log("queryText : " +result.queryText);
    console.log("Response : "  + result.fulfillmentText);
    console.log("Action : " + result.action);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
       
    var chatId = msg.chat.id;
    var resp = result.fulfillmentText;

    bot.sendMessage(chatId, resp);
  })
  .catch(err => {
    console.error('ERROR about sessionClient :', err);
  });

    fcm.send(push_data, function(err, response) {
    if (err) {
        console.error('Push메시지 발송에 실패했습니다.');
        console.error(err);
        return;
    }

    console.log('Push메시지가 발송되었습니다.');
    console.log(response);
});
});



