import { tracer } from '../instrumentation';
import { SpanStatusCode } from '@opentelemetry/api';
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {

  // start Otel outer span
  return tracer.startActiveSpan('outer-span', (parentspan) => {
  
    console.log(new Date().toUTCString() + " Starting outer-span")
    // set some span attributes
    parentspan.setAttribute("AttributeA",   "ValueA");
    parentspan.setAttribute("AttributeB", "ValueB");
    parentspan.setAttribute("AttributeC", "ValueC");

    const { name = 'World' } = req.query    
    try {
      return res.json({
        message: `Hello ${name}!`,
      })
    } finally {

      // If we get here and nothing has thrown, the request completed successfully
      parentspan.setStatus({ code: SpanStatusCode.OK });

      // start some Otel inner spans
      console.log(new Date().toUTCString() + " Starting inner spans")
      
      tracer.startActiveSpan('inner span 1', (innerspan1) => {  
        tracer.startActiveSpan('inner span 2', (innerspan2) => { 
          // Add some Otel events      
          innerspan2.addEvent('some innerspan2 event', {
            'exception.message': 'some innerspan2 event message',
          }); 
          innerspan2.end();
          console.log(new Date().toUTCString() + " Ending inner span 2")
        })
        innerspan1.end();
        console.log(new Date().toUTCString() + " Ending inner span 1")
        }
      )
      parentspan.end();
      console.log(new Date().toUTCString() + " Ending outer-span")
    }
  }
  )  
}