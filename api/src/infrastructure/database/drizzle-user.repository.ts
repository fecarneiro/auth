import 'dotenv/config';
import { eq } from 'drizzle-orm';
import type { UserRepositoryPort } from '../../application/ports/user.repository.port.js';
import { User } from '../../domain/user.entity.js';
import { db } from './db.js';
import { usersTable } from './user.schema.js';

export class DrizzleUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User | null> {
    const newUser = await db.insert(usersTable).values({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });

    if (!newUser) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!row) return null;

    return User.restore({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!row) return null;

    return User.restore({
      id: String(row.id),
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
    });
  }
}
