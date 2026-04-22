import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { name: input.roleName },
      });

      if (!role) {
        throw new NotFoundException(`Role "${input.roleName}" was not found`);
      }

      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          roleId: role.id,
        },
        include: { role: true },
      });

      return user;
    } catch (error: unknown) {
      this.handlePrismaError(error, input.email);
    }
  }

  async findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<UserEntity> {
    try {
      let roleId: string | undefined;

      if (input.roleName) {
        const role = await this.prisma.role.findUnique({
          where: { name: input.roleName },
        });

        if (!role) {
          throw new NotFoundException(`Role "${input.roleName}" was not found`);
        }

        roleId = role.id;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.email !== undefined && { email: input.email }),
          ...(input.password !== undefined && { password: input.password }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(roleId !== undefined && { roleId }),
        },
        include: { role: true },
      });

      return user;
    } catch (error: unknown) {
      this.handlePrismaError(error, input.email);
    }
  }

  async ensureDefaultRoles(): Promise<void> {
    const roles = ['ADMIN', 'CAJERO', 'INVENTARIO'];

    await this.prisma.$transaction(
      roles.map((roleName) =>
        this.prisma.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName },
        }),
      ),
    );
  }

  async createSession(input: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.userSession.create({
      data: input,
    });
  }

  async findValidSession(input: {
    userId: string;
    refreshToken: string;
    compareHash: (plain: string, hash: string) => Promise<boolean>;
  }): Promise<{ sessionId: string } | null> {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: input.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, refreshTokenHash: true },
      orderBy: { createdAt: 'desc' },
    });

    for (const session of sessions) {
      const isMatch = await input.compareHash(
        input.refreshToken,
        session.refreshTokenHash,
      );
      if (isMatch) {
        return { sessionId: session.id };
      }
    }

    return null;
  }

  async revokeSessionById(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private handlePrismaError(error: unknown, email?: string): never {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with email "${email ?? 'provided value'}" already exists`,
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User was not found');
      }
    }

    throw new InternalServerErrorException('Unexpected database error');
  }
}
