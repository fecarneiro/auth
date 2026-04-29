import { InvalidEmailError, InvalidNameError } from './user.errors.js';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: { id: string; email: string; name: string }): User {
    if (!props.email.includes('@')) throw new InvalidEmailError();
    if (!props.name || props.name.trim().length < 2)
      throw new InvalidNameError();

    return new User(
      props.id,
      props.email.toLowerCase().trim(),
      props.name.trim(),
      new Date(),
    );
  }

  static restore(props: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }): User {
    return new User(props.id, props.email, props.name, props.createdAt);
  }
}
