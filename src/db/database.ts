import {Low} from 'lowdb'
import {JSONFile} from 'lowdb/node'
import {UserToken} from '../types/userToken.js';
import crypto from 'crypto'

type Token = {
  userId: string;
  token: UserToken;
}
type Data = {
  tokens: Token[];
}

const defaultData: Data = { tokens: [] }
// 同じディレクトリにdb.jsonを作成する
const adapter = new JSONFile<Data>('db.json')
const db = new Low(adapter, defaultData)

// トークンを保存する関数
export async function saveToken(userId: string, token: UserToken): Promise<void> {
  await db.read()
  const encryptedToken = createEncryptedToken(token)
  db.data.tokens.push({userId, token: encryptedToken})
  await db.write()
}

// ユーザーのトークンを取得する関数、存在しない場合はnullを返す
export async function getToken(userId: string): Promise<UserToken | null> {
  await db.read()
  const userToken = db.data.tokens.find((t: { userId: string; }) => t.userId === userId)?.token
  return userToken ? decryptUserToken(userToken) : null
}

export async function updateToken(userId: string, token: UserToken): Promise<void> {
  const index = db.data.tokens.findIndex((t: { userId: string; }) => t.userId === userId)
  db.data.tokens[index].token = createEncryptedToken(token)
  await db.write()
}

const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// 暗号化された UserToken を作成する関数
function createEncryptedToken(userToken: UserToken): UserToken {
  return {
    ...userToken,
    accessToken: encrypt(userToken.accessToken),
    refreshToken: encrypt(userToken.refreshToken),
  };
}

// 複号化された UserToken を取得する関数
function decryptUserToken(encryptedToken: UserToken): UserToken {
  return {
    ...encryptedToken,
    accessToken: decrypt(encryptedToken.accessToken),
    refreshToken: decrypt(encryptedToken.refreshToken),
  };
}