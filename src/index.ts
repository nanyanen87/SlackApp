import { App } from '@slack/bolt';
import { load } from 'ts-dotenv';
import { google } from 'googleapis';
import fs from 'fs';
import express from 'express';
import path from 'path';
const server = express();


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

// slack bot
// SlackBotの初期化
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: env.SLACK_SOCKET_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
});


// Google OAuth2クライアントの初期化
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

// 認証URLを表示
// console.log(oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   approval_prompt: 'force',
//   scope: ['https://www.googleapis.com/auth/calendar']
// }));

// scopeを設定
const SCOPES = ['https://www.googleapis.com/auth/calendar']


// test
server.get('/test', (req, res) => {
  res.send('Hello World!');
});
// http://localhost:3001/oauth2callback　にリダイレクトされた時の処理
server.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    // 認証コードをトークンに交換
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    // トークンをファイルに保存（必要ならデータベースに保存）
    fs.writeFileSync('token.json', JSON.stringify(tokens));

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error during OAuth token exchange:', error);
    res.status(500).send('Error during authentication');
  }
});

server.listen(3001, () => {
  console.log('Example app listening on port 3001!');
});

// Slackのコマンドリスナー (Google認証開始)
app.command('/google-auth', async ({ command, ack, respond }) => {
  await ack();

  // Google OAuth 認証URLを生成
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // refresh_tokenを取得するために必要
    scope: SCOPES,
  });

  // Slackに認証URLを返信
  await respond(`Please authenticate with Google Calendar: ${authUrl}`);
});

// Google Calendar API呼び出し関数
async function listGoogleCalendarEvents() {
  // トークンが保存されているか確認
  const tokenPath = path.join(__dirname + "/..", 'token.json');
  console.log(tokenPath);
  if (fs.existsSync(tokenPath)) {
    const token = fs.readFileSync(tokenPath);
    console.log(token);
    oauth2Client.setCredentials(JSON.parse(token.toString()));

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;
    if (events?.length) {
      return events.map((event) => {
        const start = event.start?.dateTime || event.start?.date;
        return `${start} - ${event.summary}`;
      }).join('\n');
    } else {
      return 'No upcoming events found.';
    }
  } else {
    return 'No Google OAuth token found. Please authenticate using /google-auth';
  }
}

// Slackのコマンドリスナー (カレンダーのイベント取得)
app.command('/calendar', async ({ command, ack, respond }) => {
  await ack();
  console.log('calendar command received');
  try {
    // Google Calendar APIからイベントを取得
    const events = await listGoogleCalendarEvents();
    await respond(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    await respond('Failed to fetch calendar events.');
  }
});


// ④SlackBotにメッセージを送信する
app.message('', async ({ message, say }) => {
  if (!message.subtype) {
    await say(`Hello, <@${message.user}>. You said: ${message.text}`);
  }
});

(async () => {
  //⑤SlackBotを起動する
  await app.start(env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();