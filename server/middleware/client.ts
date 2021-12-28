import { NextFunction } from 'express'
import { id } from '../../src/utils'
import { Req, Res } from '../../src/types'

function parseCookies(cookies?: string) {
  return (cookies || "").split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

export function client(req: Req<any>, res: Res<any>, next: NextFunction) {
  // if the cookie is defined, use it
  let clientId = parseCookies(req.headers.cookie)['clientId'];
  if (!clientId) {
    // generate unique client id
    clientId = id()
    // set client id in cookie
    res.cookie('clientId', clientId, {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // set client id in request locals
  res.locals.clientId = clientId
  next()
}
