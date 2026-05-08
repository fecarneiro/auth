import { InvalidEmailError, InvalidNameError } from './user.errors.js'

type CreateUserProps = {
  id: string
  email: string
  name: string
}

type RestoreUserProps = {
  id: string
  email: string
  name: string
  createdAt: Date
}

export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly createdAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    const email = props.email.trim().toLowerCase()
    const name = props.name.trim()

    if (!email.includes('@')) throw new InvalidEmailError()
    if (name.length < 2) throw new InvalidNameError()

    return new User(props.id, email, name, new Date())
  }

  static restore(props: RestoreUserProps): User {
    return new User(props.id, props.email, props.name, props.createdAt)
  }
}
