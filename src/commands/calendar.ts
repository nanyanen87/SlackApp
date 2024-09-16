import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { oauth2Client } from '../app';
import path from "path";
import fs from "fs";
import {google} from "googleapis";
// /helloコマンドに対応する処理
const CalendarCommand: Middleware<SlackCommandMiddlewareArgs> = async ({ command, ack, respond }) => {
  // コマンドを確認済みとしてACKを送信
  await ack();
  // google認証が通っていればlistGoogleCalendarEventsを実行, 通っていなければgoogle-authコマンドを実行
  const isAuth = oauth2Client.credentials.access_token;
  const tokenPath = path.join(__dirname + "/..", 'token.json');
  console.log(tokenPath);
  if(!isAuth) {
    console.log('token not found');
    // google認証URLを送信
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar']
    });
    await respond(`Please authenticate with Google Calendar: ${authUrl}`);
    return;
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
