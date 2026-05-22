import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDb, bonuses } from '@casino/database';

@Injectable()
export class BonusesService {
  private get db() {
    return getDb();
  }

  async listForUser(userId: string) {
    return this.db
      .select()
      .from(bonuses)
      .where(eq(bonuses.userId, userId));
  }
}
