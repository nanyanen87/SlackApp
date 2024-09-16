import { App } from '@slack/bolt';
import { load } from 'ts-dotenv';
import { google } from 'googleapis';
import express from 'express';
import helloCommand from './commands/hello';
import calendarCommand from './commands/calendar';
import {oauth2Callback} from "./routes/auth2callback";


// 環境変数を読み込む
const env = load({
  SLACK_BOT_TOKEN: String,
  SLACK_SIGNING_SECRET: String,
  SLACK_SOCKET_TOKEN: String,
  PORT: Number,
  GOOGLE_CLIENT_ID: String,
  GOOGLE_CLIENT_SECRET: String,
  GOOGLE_REDIRECT_URI: String,
});

// SlackBotの初期化
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: env.SLACK_SOCKET_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
});

// Google OAuth2クライアントの初期化,tokenがなければgoogle-authコマンドを実行
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);
export {oauth2Client};

app.command('/hello', helloCommand);
app.command('/calendar', calendarCommand);

(async () => {
 //⑤SlackBotを起動する
 await app.start(env.PORT || 3000);
 console.log('⚡️ Bolt app is running!');
})();


const server = express();
const router = express.Router();
router.get('/oauth2callback', oauth2Callback);

server.use(router);
server.listen(3001, () => {
  console.log('Example app listening on port 3001!');
});
