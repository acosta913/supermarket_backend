import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PasswordService } from '../../common/security/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './domain/entities/user.entity';
import { UserRepositoryPort } from './domain/ports/user-repository.port';
import { USER_REPOSITORY } from './users.tokens';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepositoryPort,
    private readonly passwordService: PasswordService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultRoles();
  }

  async ensureDefaultRoles(): Promise<void> {
    await this.repository.ensureDefaultRoles();
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const created = await this.repository.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      password: await this.passwordService.hash(dto.password),
      roleName: dto.role,
    });

    return this.toResponse(created);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAll();
    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found`);
    }
    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const updated = await this.repository.update(id, {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.email !== undefined && { email: dto.email.trim().toLowerCase() }),
      ...(dto.password !== undefined && {
        password: await this.passwordService.hash(dto.password),
      }),
      ...(dto.role !== undefined && { roleName: dto.role }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return this.toResponse(updated);
  }

  async findByEmailForAuth(email: string): Promise<UserEntity | null> {
    return this.repository.findByEmail(email.trim().toLowerCase());
  }

  async createSession(input: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.repository.createSession(input);
  }

  async findValidSession(input: {
    userId: string;
    refreshToken: string;
  }): Promise<{ sessionId: string } | null> {
    return this.repository.findValidSession({
      ...input,
      compareHash: this.passwordService.compare.bind(this.passwordService),
    });
  }

  async revokeSessionById(sessionId: string): Promise<void> {
    await this.repository.revokeSessionById(sessionId);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.repository.revokeAllUserSessions(userId);
  }

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
