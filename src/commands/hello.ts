import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';

// /helloコマンドに対応する処理
const helloCommand: Middleware<SlackCommandMiddlewareArgs> = async ({ command, ack, respond }) => {
  // コマンドを確認済みとしてACKを送信
  await ack();

  // ユーザーへのレスポンス
  await respond({
    text: `Hello, <@${command.user_id}>! こんにちは!!!!!！`,
    response_type: 'in_channel' // メッセージをチャンネル全体に表示
  });
};

export default helloCommand;
