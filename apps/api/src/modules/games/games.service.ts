import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDb, games } from '@casino/database';

interface ListOptions {
  category?: string;
  featured?: boolean;
}

@Injectable()
export class GamesService {
  private get db() {
    return getDb();
  }

  async list(opts: ListOptions = {}) {
    const conditions = [eq(games.isActive, true)];

    if (opts.category) {
      conditions.push(
        eq(
          games.category,
          opts.category as typeof games.category._.data,
        ),
      );
    }
    if (opts.featured) {
      conditions.push(eq(games.isFeatured, true));
    }

    return this.db
      .select()
      .from(games)
      .where(and(...conditions));
  }

  async findBySlug(slug: string) {
    const [game] = await this.db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!game) throw new NotFoundException(`Game '${slug}' not found`);
    return game;
  }
}
