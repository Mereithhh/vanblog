import { AuthGuard } from '@nestjs/passport';
import { AccessGuard } from '../access/access.guard';

export const AdminGuard = [AuthGuard('jwt'), AccessGuard];
