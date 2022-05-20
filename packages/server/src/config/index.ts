import { loadConfig } from 'src/utils/loadConfig';

export interface Config {
  mongoUrl: string;
}

export const config: Config = {
  mongoUrl: loadConfig(
    'database.url',
    `mongodb://authing:authing@localhost:27017/vanBlog?authSource=admin`,
  ),
};
