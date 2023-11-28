// 我自己用的清洗 more 标记的脚本
const { MongoClient } = require('mongodb');
const fs = require('fs');
const yaml = require('yaml');
// Replace the uri string with your connection string.
const data = yaml.parse(fs.readFileSync('config.yaml', { encoding: 'utf-8' }));

if (!data || !data.url) {
  console.log("cant's parse url");
  return;
}
const url = data.url;
const client = new MongoClient(url);

async function run() {
  try {
    const database = client.db('vanBlog');
    const collection = database.collection('articles');

    // Query for a movie that has the title 'Back to the Future'
    const query = {
      $or: [
        {
          deleted: false,
        },
        {
          deleted: { $exists: false },
        },
      ],
      // content: { $not: { $regex: `<!-- more -->` } },
    };
    const articles = await collection.find(query).toArray();
    const as = [];
    for (const a of articles) {
      if (!a.content.includes('<!-- more -->')) {
        as.push(a);
        // console.log(a.title);
      }
    }

    for (const a of as) {
      if (a.content.includes('# ')) {
        const str = a.content + '';
        // 区分一下
        if (str.includes('## ')) {
          console.log(a.title);
          const p = str.indexOf('## ');
          const newContent = `${str.substring(0, p - 1)}\n<!-- more -->\n${str.substring(p)}`;
          const r = await collection.updateOne({ _id: a._id }, { $set: { content: newContent } });
          console.log(r);
          // 二级标题nod
        } else if (str.includes('# ')) {
          const newContent = `${str}\n<!-- more -->\n`;
          const r = await collection.updateOne({ _id: a._id }, { $set: { content: newContent } });
          console.log(r);
          console.log('************************');
        } else {
          console.log(a.title);
        }

        //     // 自己加上吧。
        //     // const newContent = a.content + "\n<!-- more -->\n";
        //     // const r = await collection.updateOne(
        //     //   { _id: a._id },
        //     //   { $set: {content: newContent} }
        //     // );
        //     // console.log(a.title, des);
      } else {
        const newContent = `${a.content}\n<!-- more -->\n`;
        const r = await collection.updateOne({ _id: a._id }, { $set: { content: newContent } });
        console.log(r);
        console.log(a.title, a.content.length);
      }
    }
    // articles.forEach((t) => {
    //   console.log(`${t.id}\t${t.title}`);
    // });
    // console.log(articles.length);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
