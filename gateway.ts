import { serve } from "bun";

const JOB_SERVICE_PORT = process.env.JOB_SERVICE_PORT || 4001;
const OPENAI_SERVICE_PORT = process.env.OPENAI_SERVICE_PORT || 4002;
const GATEWAY_PORT = process.env.PORT || 3000; // Railway sets PORT env var

console.log(`Starting API Gateway on port ${GATEWAY_PORT}`);
console.log(`Job Service: http://localhost:${JOB_SERVICE_PORT}`);
console.log(`OpenAI Service: http://localhost:${OPENAI_SERVICE_PORT}`);

serve({
  port: GATEWAY_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Log incoming request
    console.log(`[Gateway] ${req.method} ${path}`);
    
    // Determine which service to route to
    let targetPort: number;
    if (path.startsWith('/api/v1/jobs')) {
      targetPort = Number(JOB_SERVICE_PORT);
    } else if (path.startsWith('/api/v1/ai')) {
      targetPort = Number(OPENAI_SERVICE_PORT);
    } else if (path === '/' || path === '/health') {
      // Gateway health check
      return new Response(JSON.stringify({
        status: 'healthy',
        gateway: true,
        services: {
          jobs: `http://localhost:${JOB_SERVICE_PORT}`,
          ai: `http://localhost:${OPENAI_SERVICE_PORT}`
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // Unknown route
      return new Response(JSON.stringify({ 
        error: 'Route not found',
        path,
        availableRoutes: ['/api/v1/jobs/*', '/api/v1/ai/*']
      }), { 
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    try {
      // Forward the request to the target service
      const targetUrl = `http://localhost:${targetPort}${path}${url.search}`;
      console.log(`[Gateway] Forwarding to: ${targetUrl}`);
      
      // Clone the request with the new URL
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        // No timeout - wait for response
        signal: undefined
      });
      
      // Create new response with original status and add CORS headers
      const responseBody = await response.text();
      const newResponse = new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      // Ensure CORS headers are present
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      
      console.log(`[Gateway] Response: ${response.status} from port ${targetPort}`);
      return newResponse;
      
    } catch (error) {
      console.error(`[Gateway] Error forwarding request:`, error);
      
      // Check if service is unreachable
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect');
      
      return new Response(JSON.stringify({ 
        error: 'Service unavailable',
        service: targetPort === Number(JOB_SERVICE_PORT) ? 'job-service' : 'openai-service',
        port: targetPort,
        details: isConnectionError ? 'Service is not running or not accessible' : errorMessage
      }), { 
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
});

console.log(`API Gateway is running on port ${GATEWAY_PORT}`);
console.log('Routes:');
console.log('  /api/v1/jobs/* -> Job Service (port ' + JOB_SERVICE_PORT + ')');
console.log('  /api/v1/ai/*   -> OpenAI Service (port ' + OPENAI_SERVICE_PORT + ')');