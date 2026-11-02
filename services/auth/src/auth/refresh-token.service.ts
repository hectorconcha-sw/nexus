import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generates a new opaque token, hashes it, stores it, and returns the raw token.
   * If `familyId` is provided, it appends to an existing rotation chain.
   */
  async issueToken(
    userId: string,
    familyId?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const ttlDays = this.config.get<number>('REFRESH_TOKEN_TTL_DAYS', 7);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId: familyId ?? randomUUID(),
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return rawToken;
  }

  /**
   * Verifies a token, marks it as used, and issues a new one in the same family.
   * If a token is reused, the entire family is revoked (theft detection).
   */
  async rotateToken(
    rawToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ userId: string; newRawToken: string }> {
    const tokenHash = this.hashToken(rawToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // 🚨 Reuse Detection 🚨
    // If the token has already been used, someone is replaying an old token.
    // This means it was likely stolen. Revoke the entire family.
    if (existingToken.usedAt) {
      await this.revokeFamily(existingToken.familyId);
      throw new UnauthorizedException('Token reuse detected. All sessions revoked.');
    }

    // Mark current token as used
    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { usedAt: new Date() },
    });

    // Issue a new token in the same family
    const newRawToken = await this.issueToken(
      existingToken.userId,
      existingToken.familyId,
      userAgent,
      ipAddress,
    );

    return { userId: existingToken.userId, newRawToken };
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(rawToken: string): string {
    const secret = this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET');
    // HMAC is used instead of plain SHA-256 to prevent rainbow table attacks
    return createHmac('sha256', secret).update(rawToken).digest('hex');
  }

  async revokeByRawToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { familyId: true },
    });

    if (existing) {
      await this.revokeFamily(existing.familyId);
    }
  }
}
