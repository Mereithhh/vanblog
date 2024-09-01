#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const uri = 'mongodb://mongo:27017/vanBlog?authSource=admin';

const readString = (prompt) => {
  process.stdout.write(prompt);
  return new Promise((resolve, reject) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
};

const parseDBfromURI = (uri) => {
  const obj = new URL(uri);
  return obj.pathname.slice(1);
};

const main = async () => {
  const uriFromUser = await readString(
    '输入 MongoDB 连接 URL（如果看不懂或者使用的默认配置，请直接按回车）:    \n  ',
  );
  const uriToUse = uriFromUser || uri;
  const db = parseDBfromURI(uriToUse);
  console.log('使用的 MongoDB 连接 URL: ', uriToUse, '数据库：', db);

  const client = new MongoClient(uriToUse);
  console.log('尝试连接数据库...');
  try {
    await tryConnectDB(client);
    console.log('连接数据库成功');
  } catch (err) {
    console.log('连接数据库失败：', err);
    process.exit(1);
  }
  await resetHttps(client, db);
  await client.close();
  process.exit(0);
};

const tryConnectDB = (client) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('连接数据库超时'));
    }, 5000);
    client
      .connect()
      .then(resolve)
      .catch((err) => reject(err));
  });
};

const resetHttps = async (client, dbName) => {
  try {
    await client.connect();

    const db = client.db(dbName);
    const col = db.collection('settings');
    const result = await col.deleteOne({ type: 'https' });
    console.log('删除 HTTPS 设置成功，删除的条目数：', result.deletedCount);
    console.log('重启 vanblog 后生效');
  } catch (err) {
    console.log('重制 HTTPS 出错：', err);
  }
};

main();
