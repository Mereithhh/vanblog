import { loadConfig } from 'src/utils/loadConfig';

export interface Config {
  mongoUrl: string;
  jwtSecret: string;
}


export const config: Config = {
  mongoUrl: loadConfig(
    'database.url',
    `mongodb://localhost:27017/vanBlog?authSource=admin`,
  ),
  jwtSecret: loadConfig('jwt.secret', 'boynextdoor'),
};
