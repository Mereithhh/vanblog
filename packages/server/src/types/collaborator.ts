import { Permission } from './access/access';

export interface Collaborator {
  name: string;
  nickname: string;
  password: string;
  permission: Permission[];
}
