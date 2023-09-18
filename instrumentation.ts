import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// enable for Otel debugging
//import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const exporterUrl = process.env.EXPORTER_URL;
console.log('exporterUrl = ' + exporterUrl)

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'rob-demo-service',
  }),
});


const exporter = new OTLPTraceExporter({
  url: exporterUrl,
});

// Send spans to the exporter endpoint
// AND the console
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// enable for Otel debugging
//provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register();


/*

// TRIED THIS ORGINALLY AND IT DID NOT WORK FOR A REMOTE COLLECTOR

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import opentelemetry from '@opentelemetry/api';

export const tracer = opentelemetry.trace.getTracer(
  'vercel-nodejs-serverless-function-express-instrumentation-scope-name',
  'vercel-nodejs-serverless-function-express-instrumentation-scope-version',
);

// Set the EXPORTER_URL within .env.local
const exporterUrl = process.env.EXPORTER_URL;
console.log('exporterUrl = ' + exporterUrl)
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: exporterUrl,
    headers: {}, 
  }),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'vercel-nodejs-serverless-function-express',
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
});
sdk.start();
console.log(new Date().toUTCString() + " instrumentation sdk.start()")

*/