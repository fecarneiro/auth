import 'dotenv/config';
import { eq } from 'drizzle-orm';
import type { PasswordCredentialRepositoryPort } from '../../application/ports/password-credential.repository.port.js';
import { db } from './db.js';
import { usersTable } from './schema.js';

export class DrizzlePasswordCredentialRepository
  implements PasswordCredentialRepositoryPort
{
  async findByUserId(
    userId: string,
  ): Promise<{ userId: string; passwordHash: string } | null> {
    const [row] = await db
      .select({
        id: usersTable.id,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!row) return null;

    if (!row?.passwordHash) return null;

    return {
      userId: row.id,
      passwordHash: row.passwordHash,
    };
  }
}
