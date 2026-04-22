import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '../../common/security/password.service';
import { JwtStrategy } from '../../common/auth/strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
