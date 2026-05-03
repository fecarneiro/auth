import { describe, expect, it } from 'vitest';
import { User } from './user.entity.js';
import { InvalidEmailError, InvalidNameError } from './user.errors.js';

describe('User Domain', () => {
  it('should create a valid user', () => {
    const user = User.create({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
    });

    expect(user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: expect.any(Date),
    });
  });

  it('should normalize email when creating user', () => {
    const user = User.create({
      id: 'user-1',
      email: 'USER@example.coM',
      name: 'User Example',
    });

    expect(user.email).toBe('user@example.com');
  });

  it('should trim name when creating user', () => {
    const user = User.create({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example  ',
    });

    expect(user.name).toBe('User Example');
  });

  it('should fail when email is invalid', () => {
    const user = {
      id: 'user-1',
      email: 'invalidemail.com',
      name: 'User Example',
    };

    expect(() => User.create(user)).toThrow(InvalidEmailError);
  });

  it('should fail when name is invalid', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'F',
    };

    expect(() => User.create(user)).toThrow(InvalidNameError);
  });

  it('should restore an existing user', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    };

    expect(User.restore(user)).toEqual(user);
  });
});
