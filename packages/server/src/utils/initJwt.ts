import { loadMongoUrl } from 'src/config';
import { MongoClient } from 'mongodb';
import { makeSalt } from './crypto';
export const initJwt = async () => {
  const mongoUrl = await loadMongoUrl();
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();
  const collection = db.collection('settings');
  const jwtSetting = await collection.findOne({ type: 'jwt' });
  if (jwtSetting) {
    return jwtSetting.value.secret;
  } else {
    const secret = makeSalt();
    await collection.insertOne({ type: 'jwt', value: { secret } });
    return secret;
  }
};
