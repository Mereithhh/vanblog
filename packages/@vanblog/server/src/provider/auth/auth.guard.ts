import { AuthGuard } from '@nestjs/passport';
import { AccessGuard } from '../access/access.guard';
import { TokenGuard } from './token.guard';

export const AdminGuard = [AuthGuard('jwt'), TokenGuard, AccessGuard];
