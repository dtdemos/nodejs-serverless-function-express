import '../instrumentation'
import type { VercelRequest, VercelResponse } from '@vercel/node'
const opentelemetry = require('@opentelemetry/api');

// Name your tracer whatever you want
const tracer =  opentelemetry.trace.getTracer('mytracer');

function doThis(parentSpan, i) {

  // Get active context
  // Will be used when child span is created
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan);

  const childSpan = tracer.startSpan(`doThis${i}`, undefined, ctx);
  console.log(`Doing this... ${i}`);

  childSpan.addEvent(`childSpan${i} event`, {
    // Dynatrace will see 'exception.message' a valid span event
    'exception.message': `some childSpan${i} event message`,
  }); 

  childSpan.end();

}

export default function handler(req: VercelRequest, res: VercelResponse) {

  const { name = 'Dynatrace User' } = req.query  

  // Set the response but do not return yet
  res.json({
    message: `Hello ${name}!`,
  });

  // Start the outer "parent" span
  const parentSpan = tracer.startSpan('parent-span');

  // set some span attributes
  parentSpan.setAttribute("AttributeA", "ValueA");
  parentSpan.setAttribute("AttributeB", "ValueB");
  parentSpan.setAttribute("AttributeC", "ValueC");

  for (let counter = 1; counter <= 2; counter += 1) {
    // Call a function and pass the parentSpan
    // Because child spans will be made for each
    // Of these "inner" loops
    doThis(parentSpan, counter);
  }

  // End the parent span
  parentSpan.end()
}

/*

// TRIED THIS ORGINALLY AND IT DID NOT WORK FOR A REMOTE COLLECTOR

import { tracer } from '../instrumentation';
import { SpanStatusCode } from '@opentelemetry/api';
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

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

*/
