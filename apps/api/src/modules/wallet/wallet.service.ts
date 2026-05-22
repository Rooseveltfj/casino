import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDb, wallets } from '@casino/database';

@Injectable()
export class WalletService {
  private get db() {
    return getDb();
  }

  async getBalance(userId: string) {
    const [wallet] = await this.db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) throw new NotFoundException(`Wallet for user ${userId} not found`);

    return {
      currency: wallet.currency,
      balanceDemo: wallet.balanceDemo,
      balanceReal: wallet.balanceReal,
      balanceBonus: wallet.balanceBonus,
      lockedBalance: wallet.lockedBalance,
    };
  }
}
