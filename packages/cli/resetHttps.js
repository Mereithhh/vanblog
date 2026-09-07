#!/usr/bin/env node

const http = require('http');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://mongo:27017/vanBlog?authSource=admin';

const readString = (prompt) => {
  if (!process.stdin.isTTY) {
    return Promise.resolve('');
  }
  process.stdout.write(prompt);
  return new Promise((resolve) => {
    const onData = (data) => {
      cleanup();
      resolve(data.toString().trim());
    };
    const onEnd = () => {
      cleanup();
      resolve('');
    };
    const cleanup = () => {
      process.stdin.off('data', onData);
      process.stdin.off('end', onEnd);
    };
    process.stdin.once('data', onData);
    process.stdin.once('end', onEnd);
  });
};

const parseDBfromURI = (uriToParse) => {
  const obj = new URL(uriToParse);
  return obj.pathname.slice(1);
};

const disableCaddyRedirect = () => {
  return new Promise((resolve) => {
    const req = http.request(
      {
        method: 'DELETE',
        host: '127.0.0.1',
        port: 2019,
        path: '/config/apps/http/servers/srv1/listener_wrappers',
      },
      (res) => {
        res.resume();
        resolve(res.statusCode < 400 || res.statusCode === 404);
      },
    );
    req.on('error', () => resolve(false));
    req.end();
  });
};

const tryConnectDB = (client) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('连接数据库超时'));
    }, 5000);
    client
      .connect()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const resetHttps = async (client, dbName) => {
  const db = client.db(dbName);
  const col = db.collection('settings');
  const result = await col.deleteMany({ type: 'https' });
  console.log('删除 HTTPS 设置成功，删除的条目数：', result.deletedCount);
  const caddyOk = await disableCaddyRedirect();
  if (caddyOk) {
    console.log('已关闭 Caddy https 自动重定向，HTTP / IP 访问应已恢复');
  } else {
    console.log('未能通过 Caddy API 关闭重定向，请重启 vanblog 后生效');
  }
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
  try {
    await resetHttps(client, db);
  } catch (err) {
    console.log('重置 HTTPS 出错：', err);
    await client.close().catch(() => {});
    process.exit(1);
  }
  await client.close();
  process.exit(0);
};

main();
