import { Request, Response, NextFunction } from 'express';
import { oauth2Client } from '../app';
import fs from "fs";

// コールバックルートの定義
export const oauth2Callback = async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ message: 'No code provided' });
  }

  try {
    // 認証コードをトークンに交換
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // トークンをファイルに上書き保存（必要ならデータベースに保存）
    fs.writeFileSync('token.json', JSON.stringify(tokens));

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error during OAuth token exchange:', error);
    res.status(500).send('Error during authentication');
  }
};
