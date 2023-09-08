import { tracer, context } from '../instrumentation.ts';
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const span = tracer.startSpan('request-handler', undefined, context.active());
  const { name = 'World' } = req.query
  return res.json({
    message: `Hello ${name}!`,
  })
  span.end()
}
