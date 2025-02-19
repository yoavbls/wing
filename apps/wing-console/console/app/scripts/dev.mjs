import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { createConsoleServer } from "@wingconsole/server";
import open from "open";
import { createServer as createViteServer } from "vite";

import { viteConfig } from "./config.mjs";

const options = parseArgs({
  options: {
    wingfile: {
      type: "string",
    },
  },
});

const consoleServer = await createConsoleServer({
  wingfile:
    options.values.wingfile ??
    fileURLToPath(new URL("../demo/index.w", import.meta.url)),
  requestedPort: 1214,
  log: {
    info: console.log,
    error: console.error,
    verbose: console.log,
  },
  config: {
    addEventListener(event, listener) {},
    removeEventListener(event, listener) {},
    get(key) {
      return;
    },
    set(key, value) {},
  },
  hostUtils: {
    async openExternal(url) {
      await open(url);
    },
  },
  requireAcceptTerms: true,
});

const vite = await createViteServer({
  ...viteConfig,
  server: {
    proxy: {
      "/trpc": {
        target: `http://localhost:${consoleServer.port}`,
        changeOrigin: true,
        ws: true,
      },
    },
    open: true,
  },
});

await vite.listen();
