import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDb, pspTransactions } from '@casino/database';

@Injectable()
export class PspService {
  private get db() {
    return getDb();
  }

  async createDeposit(userId: string, _payload: unknown) {
    // TODO: generate Pix QR code (demo: stub payload)
    // TODO: insert psp_transactions row with status 'pending'
    void userId;
    return {
      id: `psp-${Date.now()}`,
      qrCodePayload: '00020126580014BR.GOV.BCB.PIX0136demo-key-placeholder',
      qrCodeUrl: '/demo/qr-placeholder.png',
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
  }

  async requestWithdrawal(userId: string, _payload: unknown) {
    // TODO: validate available balance, create psp_transactions row
    void userId;
    return { status: 'pending', message: 'Withdrawal queued' };
  }

  async getTransaction(id: string) {
    const [tx] = await this.db
      .select()
      .from(pspTransactions)
      .where(eq(pspTransactions.id, id))
      .limit(1);

    if (!tx) throw new NotFoundException(`PSP transaction ${id} not found`);
    return tx;
  }
}
