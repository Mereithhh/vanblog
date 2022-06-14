import { AuthGuard } from '@nestjs/passport';

export const AdminGuard = AuthGuard('jwt');
