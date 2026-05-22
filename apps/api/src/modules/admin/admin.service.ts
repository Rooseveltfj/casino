import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDb, users, pspTransactions } from '@casino/database';

@Injectable()
export class AdminService {
  private get db() {
    return getDb();
  }

  async listUsers() {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users);
  }

  async listPendingDeposits() {
    return this.db
      .select()
      .from(pspTransactions)
      .where(eq(pspTransactions.status, 'pending'));
  }

  async confirmDeposit(pspTxId: string) {
    const [tx] = await this.db
      .select()
      .from(pspTransactions)
      .where(eq(pspTransactions.id, pspTxId))
      .limit(1);

    if (!tx) throw new NotFoundException(`PSP transaction ${pspTxId} not found`);
    // TODO: update psp_transactions.status = 'confirmed'
    //       + insert wallet credit transaction via WalletService
    return { confirmed: true, txId: pspTxId };
  }
}
