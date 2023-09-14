import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import opentelemetry from '@opentelemetry/api';

export const tracer = opentelemetry.trace.getTracer(
  'vercel nodejs-serverless-function-express instrumentation-scope-name',
  'vercel nodejs-serverless-function-express instrumentation-scope-version',
);

// Set the EXPORTER_URL within .env.local
const exporterUrl = process.env.EXPORTER_URL;
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: exporterUrl,
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'vercel nodejs-serverless-function-express',
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
});
sdk.start();
console.log(new Date().toUTCString() + " instrumentation sdk.start()")