import { ApiHeader } from '@nestjs/swagger';

export const ApiToken = ApiHeader({
  name: 'token',
  description: '鉴权密钥，请在后台 Token 管理中获取',
  required: true,
});
