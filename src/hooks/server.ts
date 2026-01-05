import { createServer, IncomingMessage, ServerResponse } from "node:http";
import type { HookNotification } from "../types.js";

export type NotificationHandler = (notification: HookNotification) => void;

export interface HookServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createHookServer(
  port: number,
  onNotification: NotificationHandler
): HookServer {
  const server = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/notify") {
      handleNotify(req, res, onNotification);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });

  return {
    start(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.on("error", reject);
        server.listen(port, () => {
          console.log(`   Hook server listening on port ${port}`);
          resolve();
        });
      });
    },
    stop(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

function handleNotify(
  req: IncomingMessage,
  res: ServerResponse,
  onNotification: NotificationHandler
): void {
  let body = "";

  req.on("data", (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const notification = JSON.parse(body) as HookNotification;

      // Validate required fields
      if (!notification.session || !notification.tool || !notification.input) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      onNotification(notification);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });

  req.on("error", () => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Request error" }));
  });
}
