import { loadConfig } from 'src/utils/loadConfig';

export interface Config {
  mongoUrl: string;
  staticPath: string;
  codeRunnerPath: string;
  pluginRunnerPath: string;
  walineDB: string;
  demo: boolean | string;
  log: string;
}

export const loadMongoUrl = () => {
  return loadConfig('database.url', () => {
    const db = {
      host: loadConfig('database.host', 'mongo'),
      port: loadConfig('database.port', '27017'),
      user: loadConfig('database.user', ''),
      passwd: loadConfig('database.passwd', ''),
      name: loadConfig('database.name', 'vanBlog'),
    };

    let authInfo = '';
    if (db.user !== '' && db.passwd === '') authInfo = `${db.user}@`;
    if (db.user !== '' && db.passwd !== '') authInfo = `${db.user}:${db.passwd}@`;

    return `mongodb://${authInfo}${db.host}:${db.port}/${db.name}?authSource=admin`;
  });
};

export const config: Config = {
  mongoUrl: loadMongoUrl(),
  staticPath: loadConfig('static.path', '/app/static'),
  demo: loadConfig('demo', false),
  walineDB: loadConfig('waline.db', 'waline'),
  log: loadConfig('log', '/var/log'),
  codeRunnerPath: loadConfig('codeRunner.path', '/app/codeRunner'),
  pluginRunnerPath: loadConfig('pluginRunner.path', '/app/pluginRunner'),
};
