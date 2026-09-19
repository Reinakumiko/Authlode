import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/** 预授权状态（login 发起 → callback 校验，一次性） */
export interface AuthPreAuthPayload {
  state: string;
  verifier: string;
}

/** 平台会话（callback 签发；rt 为 Logto refresh token，F3 每次轮换后重签） */
export interface AuthSessionPayload {
  /** IAM User ID */
  sub: string;
  /** Logto refresh token（httpOnly 会话内保管，用于刷新与组织 Token） */
  rt: string;
}

export const AUTH_PRE_COOKIE = 'auth_pre';
export const AUTH_SESSION_COOKIE = 'auth_session';

/**
 * 平台会话服务 — 自签 JWT（httpOnly cookie）
 *
 * 设计（实施方案 1.3）：
 * - 预授权：login 时签发 { state, verifier }（10 分钟），callback 校验后清除
 * - 会话：callback 签发 { sub, rt }（7 天）；RT 轮换时重签
 * - B1.6 的 SessionGuard 消费 verifySession
 */
@Injectable()
export class AuthSessionService {
  constructor(private readonly jwtService: JwtService) {}

  signPreAuth(payload: AuthPreAuthPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  verifyPreAuth(token: string): AuthPreAuthPayload | null {
    try {
      return this.jwtService.verify<AuthPreAuthPayload>(token);
    } catch {
      return null;
    }
  }

  signSession(payload: AuthSessionPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  verifySession(token: string): AuthSessionPayload | null {
    try {
      return this.jwtService.verify<AuthSessionPayload>(token);
    } catch {
      return null;
    }
  }
}
