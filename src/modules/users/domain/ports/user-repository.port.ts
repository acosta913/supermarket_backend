import { UserEntity } from '../entities/user.entity';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roleName: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  roleName?: string;
  isActive?: boolean;
};

export interface UserRepositoryPort {
  create(input: CreateUserInput): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(id: string, input: UpdateUserInput): Promise<UserEntity>;
  ensureDefaultRoles(): Promise<void>;
  createSession(input: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<void>;
  findValidSession(input: {
    userId: string;
    refreshToken: string;
    compareHash: (plain: string, hash: string) => Promise<boolean>;
  }): Promise<{ sessionId: string } | null>;
  revokeSessionById(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
}
