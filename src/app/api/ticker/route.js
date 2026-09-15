export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data immediately
      sendEvent(controller);
      
      // Emit mock price updates every 3 seconds
      const interval = setInterval(() => {
        sendEvent(controller);
      }, 3000);

      // Clean up when client disconnects
      controller.signal?.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function sendEvent(controller) {
  const data = JSON.stringify({
    SP500: (4500 + Math.random() * 50 - 25).toFixed(2),
    BTC: (62000 + Math.random() * 1000 - 500).toFixed(2),
    AAPL: (170 + Math.random() * 4 - 2).toFixed(2),
  });
  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
}
