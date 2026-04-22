import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser } from '../../common/auth/decorators/current-user.decorator';
import { PasswordService } from '../../common/security/password.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthService {
  private static readonly ACCESS_EXPIRES_IN_SECONDS = 15 * 60;
  private static readonly REFRESH_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    await this.usersService.ensureDefaultRoles();
    const user = await this.usersService.findByEmailForAuth(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await this.passwordService.compare(
      dto.password,
      user.password,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    return this.issueTokens(payload, userAgent, ipAddress);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        dto.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.usersService.findValidSession({
      userId: payload.sub,
      refreshToken: dto.refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('Refresh session not found or expired');
    }

    const user = await this.usersService.findByEmailForAuth(payload.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    await this.usersService.revokeSessionById(session.sessionId);

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });
  }

  async logout(
    user: AuthenticatedUser,
    refreshToken?: string,
  ): Promise<{ success: true }> {
    if (!refreshToken) {
      await this.usersService.revokeAllUserSessions(user.sub);
      return { success: true };
    }

    const session = await this.usersService.findValidSession({
      userId: user.sub,
      refreshToken,
    });

    if (session) {
      await this.usersService.revokeSessionById(session.sessionId);
    }

    return { success: true };
  }

  private async issueTokens(
    payload: TokenPayload,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
      expiresIn: AuthService.ACCESS_EXPIRES_IN_SECONDS,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
      expiresIn: AuthService.REFRESH_EXPIRES_IN_SECONDS,
    });

    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    await this.usersService.createSession({
      userId: payload.sub,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt: new Date(
        Date.now() + AuthService.REFRESH_EXPIRES_IN_SECONDS * 1000,
      ),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: AuthService.ACCESS_EXPIRES_IN_SECONDS,
    };
  }
}
