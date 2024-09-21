import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { UserToken } from '../types/userToken.js';

type Token = {
  userId: string;
  token: UserToken;
}
type Data = {
  tokens: Token[];
}

const defaultData: Data = { tokens: [] }

const adapter = new JSONFile<Data>('db.json')
const db = new Low(adapter, defaultData)

// トークンを保存する関数
export async function saveToken(userId: string, token: UserToken): Promise<void> {
  await db.read()
  db.data.tokens.push({userId, token})
  await db.write()
}

// ユーザーのトークンを取得する関数、存在しない場合はnullを返す
export async function getToken(userId: string): Promise<UserToken | null> {
  await db.read()
  const userToken = db.data.tokens.find((t: { userId: string; }) => t.userId === userId)
  return userToken ? userToken.token : null
}

export async function updateToken(userId: string, token: UserToken): Promise<void> {
  const index = db.data.tokens.findIndex((t: { userId: string; }) => t.userId === userId)
  db.data.tokens[index].token = token
  await db.write()
}

