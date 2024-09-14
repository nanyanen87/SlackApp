import { App } from '@slack/bolt';
import { load } from 'ts-dotenv';
import { google } from 'googleapis';
// file system
import fs from 'fs';
import express from 'express';
const app = express();

//②SlackBotのトークンとシークレットを環境変数から読み込む
const env = load({
  SLACK_BOT_TOKEN: String,
  SLACK_SIGNING_SECRET: String,
  PORT: Number,
  GOOGLE_CLIENT_ID: String,
  GOOGLE_CLIENT_SECRET: String,
  GOOGLE_REDIRECT_URI: String,
});

// Google OAuth2クライアントの初期化
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

// 認証トークンを設定
// oauth2Client.setCredentials({
//   refresh_token: env.GOOGLE_REFRESH_TOKEN
// });

// 認証URLを表示
console.log(oauth2Client.generateAuthUrl({
  access_type: 'offline',
  approval_prompt: 'force',
  scope: ['https://www.googleapis.com/auth/calendar']
}));


// 認証コードからトークンを取得
app.get('/test', (req, res) => {
  res.send('Hello World!');
});
// http://localhost:3000/auth/google/callback　にリダイレクトされた時の処理
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (code) {
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);
  }
  res.send('OK');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});




// Google Calendar APIクライアントの初期化
// const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// ③SlackBotの初期化
// const app = new App({
//   token: env.SLACK_BOT_TOKEN,
//   signingSecret: env.SLACK_SIGNING_SECRET,
// });

//④SlackBotにメッセージを送信する
// app.message('', async ({ message, say }) => {
//   if (!message.subtype) {
//     await say(`Hello, <@${message.user}>. You said: ${message.text}`);
//   }
// });

// (async () => {
//   //⑤SlackBotを起動する
//   await app.start(process.env.PORT || 3000);
//
//   console.log('⚡️ Bolt app is running!');
// })();