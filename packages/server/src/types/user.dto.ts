export class UpdateUserDto {
  id?: number;
  name: string;
  password: string;
  nickname?: string;
}
export class LoginDto {
  username: string;
  password: string;
}
