# Wallet — Ledger Rules

> These rules are **non-negotiable** and must be enforced at every layer (service, API, database constraint).

## Architecture overview

```
wallets            ← cached balance (derived, not authoritative)
  └─ transactions  ← append-only ledger (source of truth)
```

The `wallets` table holds `balance_demo`, `balance_real`, and `balance_bonus` as **cached** values. They are recomputed by a background job that aggregates the `transactions` table. Never trust the wallet cache without verifying the transaction ledger for high-stakes operations.

---

## Rules

### 1. Transactions are append-only

**NEVER** `UPDATE` or `DELETE` a row in the `transactions` table.

To correct an error: insert a **rollback** transaction (type `"rollback"`) that reverses the original amount and records the correct `balance_before` / `balance_after`.

```sql
-- ✅ Correct: insert a rollback entry
INSERT INTO transactions (wallet_id, type, wallet_type, amount, balance_before, balance_after, reference_id, metadata)
VALUES ($1, 'rollback', $2, -$original_amount, $balance_before, $balance_after, $new_reference_id, '{"rollback_of": "$original_id"}');

-- ❌ Wrong: never do this
UPDATE transactions SET amount = 0 WHERE id = $1;
```

### 2. Every transaction records balance snapshots

Each row stores `balance_before` and `balance_after` so the complete balance history can be reconstructed without aggregation.

```
balance_after = balance_before + amount   (for credits)
balance_after = balance_before - amount   (for debits, amount is stored positive)
```

Validation: `SELECT SUM(amount)` from the first transaction to any point in time must equal `balance_after` of the last transaction in that range.

### 3. Idempotency via reference_id

Every financial operation must supply a `reference_id` (UUID). The `transactions` table has a `UNIQUE` constraint on `reference_id`.

```typescript
// Service layer pattern
await db.insert(transactions)
  .values({ ..., referenceId: idempotencyKey })
  .onConflictDoNothing();  // Same key → silent no-op
```

If a caller retries a request with the same `reference_id`, the insert is silently ignored. The caller should then re-read the existing transaction to confirm the state.

### 4. Wallet cache is not the source of truth

The `wallets.balance_*` columns are a **performance cache**. Background jobs recalculate them periodically:

```sql
UPDATE wallets
SET
  balance_demo  = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE wallet_id = $1 AND wallet_type = 'demo'),
  balance_real  = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE wallet_id = $1 AND wallet_type = 'real'),
  balance_bonus = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE wallet_id = $1 AND wallet_type = 'bonus'),
  updated_at    = NOW()
WHERE id = $1;
```

For real-money operations that need the exact balance (withdrawal check, bet deduction), **always read from the transactions table**, not from the wallet cache.

### 5. wallet_type separation

Each transaction records which balance type was affected (`demo | real | bonus`). This allows the ledger to track three independent sub-balances within a single wallet row while keeping all transactions in one auditable table.

### 6. Locked balance

`wallets.locked_balance` reserves funds for pending withdrawals or in-progress bets. It is managed by the wallet service and must be:
- Incremented when a withdrawal is initiated or a bet is placed.
- Decremented when the withdrawal is confirmed/cancelled or the bet resolves.

Available balance = `balance_real - locked_balance` (for real money).

---

## Transaction types

| type | direction | description |
|---|---|---|
| `deposit` | credit | funds added via PSP |
| `withdrawal` | debit | funds sent via PSP |
| `bet` | debit | game round stake placed |
| `win` | credit | game round payout |
| `bonus_grant` | credit | promotional bonus added |
| `bonus_release` | credit | wagering completed, bonus converts to real |
| `adjustment` | credit or debit | manual admin correction |
| `rollback` | inverse of original | reverses a previous transaction |

---

## Audit trail

All wallet operations must also write to `audit_logs` with the actor who triggered the change, the IP address, and a JSON snapshot of relevant context. This satisfies most gaming regulator requirements for transaction traceability.
