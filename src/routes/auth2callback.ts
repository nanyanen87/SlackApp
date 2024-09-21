import { Request, Response, NextFunction } from 'express';
import { oauth2Client } from '../app.js';
import { saveToken } from "../db/database.js";
import { UserToken } from "../types/userToken.js";
// コールバックルートの定義
const oauth2Callback = async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string;
  const slackUserId = req.query.state as string;

  if (!code) {
    return res.status(400).json({ message: 'No code provided' });
  }

  try {
    // 認証コードをトークンに交換
    const { tokens } = await oauth2Client.getToken(code);
    // fs.writeFileSync('token.json', JSON.stringify(tokens));
    const token: UserToken = {
      accessToken: tokens.access_token ?? '',
      refreshToken: tokens.refresh_token ?? '',
      scope: tokens.scope ?? '',
      tokenType: tokens.token_type ?? '',
      expiryDate: tokens.expiry_date ?? 0,
    }

    await saveToken(slackUserId, token);

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error during OAuth token exchange:', error);
    res.status(500).send('Error during authentication');
  }
};

export default oauth2Callback;