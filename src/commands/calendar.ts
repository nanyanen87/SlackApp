import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { google } from "googleapis";
import { oauth2Client } from '../app.js';
import { getToken } from "../db/database.js";
// /helloコマンドに対応する処理
const CalendarCommand: Middleware<SlackCommandMiddlewareArgs> = async ({ command, ack, respond }) => {
  // コマンドを確認済みとしてACKを送信
  await ack();
  // dbからtokenを取得、なければgoogle-authコマンドを実行
  const token = await getToken(command.user_id)
  if(!token) {
    console.log('token not found');
    // google認証URLを送信
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: command.user_id,
    });
    // sessionにslackのuserIdを保存
    await respond(`Please authenticate with Google Calendar: ${authUrl}`);
    return;
  } else {
    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      scope: token.scope,
      token_type: token.tokenType,
      expiry_date: token.expiryDate,
    });
  }


  // ユーザーへのレスポンス
  try {
    // Google Calendar APIからイベントを取得
    const events = await listGoogleCalendarEvents();
    await respond(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    await respond('Failed to fetch calendar events.');
  }

};

async function listGoogleCalendarEvents() {
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
}

export default CalendarCommand;
