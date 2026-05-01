import 'dotenv/config';
import { eq } from 'drizzle-orm';
import type {
  PasswordCredential,
  PasswordCredentialRepositoryPort,
} from '../../application/ports/password-credential.repository.port.js';
import { db } from './db.js';
import { passwordCredentialsTable } from './password-credential.schema.js';

export class DrizzlePasswordCredentialRepository
  implements PasswordCredentialRepositoryPort
{
  async save(credential: PasswordCredential): Promise<void> {
    await db.insert(passwordCredentialsTable).values({
      userId: credential.userId,
      passwordHash: credential.passwordHash,
    });
  }

  async findByUserId(
    userId: string,
  ): Promise<{ userId: string; passwordHash: string } | null> {
    const [row] = await db
      .select({
        userId: passwordCredentialsTable.userId,
        passwordHash: passwordCredentialsTable.passwordHash,
      })
      .from(passwordCredentialsTable)
      .where(eq(passwordCredentialsTable.userId, userId))
      .limit(1);

    if (!row) return null;

    if (!row?.passwordHash || !row?.userId) return null;

    return {
      userId: row.userId,
      passwordHash: row.passwordHash,
    };
  }
}
