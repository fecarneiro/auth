import type { NextFunction, Request, Response } from 'express'
import type {
  AuthSession,
  SessionStorePort,
} from '../../../application/ports/session-store.port.js'

declare module 'express' {
  interface Request {
    user?: Pick<AuthSession, 'userId'>
  }
}

export class AuthMiddleware {
  constructor(private readonly sessionStore: SessionStorePort) {}

  validate = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies.sid
    if (!sessionId) {
      console.log('sid does not exist in the user req header')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const session = await this.sessionStore.findById(sessionId)
    if (!session) {
      console.log('provided sid not found')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    req.user = session

    console.log(req.cookies.sid)
    console.log(session)
    next()
  }
}
