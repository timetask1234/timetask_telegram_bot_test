// Imports the Google Cloud client library.
const Storage = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage();

// Makes an authenticated API request.
storage
  .getBuckets()
  .then((results) => {
    const buckets = results[0];

    console.log('Buckets:');
    buckets.forEach((bucket) => {
      console.log(bucket.name);
    });
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });

const TelegramBot = require('node-telegram-bot-api');
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


const projectId = 'timetask-telegram-bot';
const sessionId = uuidv1();
const query = 'hello';
const languageCode = 'en-US';

const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });



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


const bot = new TelegramBot(getToken(), {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});

bot.onText(/schedule (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = "서버키 : " + serverKey +"\n" + "클라이언트 토큰 : " + clientToken + "\n" + "원본 메시지 : " + match[0] + "uuid : " + uuidv1();

    bot.sendMessage(chatId, resp);
    
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

