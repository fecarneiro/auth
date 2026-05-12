import type { NextFunction, Request, Response } from 'express'
import type { SessionStorePort } from '../../../application/ports/session-store.port.js'

/*
 * Request/ Response/ Next
 * Recebe cookie
 *   -> Valida
 *     1) Se existe
 *     2) Expiracao
 *     3) Secret?
 *
 */

export class AuthMiddleware {
  constructor(private readonly sessionStore: SessionStorePort) {}

  validate = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies.sid
    if (!sessionId) {
      console.log('sid does not exist in the user req header')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const session = await this.sessionStore.get(sessionId)
    if (!session) {
      console.log('provided sid not found')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    console.log(req.cookies.sid)
    console.log(session)
    next()
  }
}
