import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/auth/guards/roles.guard';
import { PasswordService } from '../../common/security/password.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './users.tokens';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    RolesGuard,
  ],
  exports: [UsersService, USER_REPOSITORY, PasswordService],
})
export class UsersModule {}
