import { NextRequest } from 'next/server';
import { watch } from 'chokidar';
import path from 'path';

export const dynamic = 'force-dynamic';

const CSV_PATH = path.join(process.cwd(), 'accounting.csv');

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
      
      // Set up file watcher
      const watcher = watch(CSV_PATH, {
        persistent: true,
        ignoreInitial: true,
      });
      
      watcher.on('change', () => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'update', timestamp: Date.now() })}\n\n`));
      });
      
      watcher.on('error', (error: Error) => {
        console.error('Watcher error:', error);
      });
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        watcher.close();
        clearInterval(heartbeat);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
