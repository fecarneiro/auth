import { and, eq } from 'drizzle-orm'
import type {
  OAuthConnectionRecord,
  OAuthConnectionRepositoryPort,
} from '../../../application/ports/oauth/oauth-connection.repository.port.js'
import { db } from '../db.js'
import { accountOAuthConnectionsTable } from '../schemas/account-oauth-connections.schema.js'

export class DrizzleOAuthConnectionRepository
  implements OAuthConnectionRepositoryPort
{
  async save(connection: OAuthConnectionRecord): Promise<void> {
    await db.insert(accountOAuthConnectionsTable).values({
      id: connection.id,
      accountId: connection.accountId,
      provider: connection.provider,
      providerUserId: connection.providerUserId,
    })
  }

  async findByProviderIdentity(input: {
    provider: OAuthConnectionRecord['provider']
    providerUserId: string
  }): Promise<OAuthConnectionRecord | null> {
    const [row] = await db
      .select({
        id: accountOAuthConnectionsTable.id,
        accountId: accountOAuthConnectionsTable.accountId,
        provider: accountOAuthConnectionsTable.provider,
        providerUserId: accountOAuthConnectionsTable.providerUserId,
      })
      .from(accountOAuthConnectionsTable)
      .where(
        and(
          eq(accountOAuthConnectionsTable.provider, input.provider),
          eq(accountOAuthConnectionsTable.providerUserId, input.providerUserId),
        ),
      )
      .limit(1)

    if (!row) return null

    return {
      id: row.id,
      accountId: row.accountId,
      provider: row.provider,
      providerUserId: row.providerUserId,
    }
  }
}
