import { config } from "./app/config.ts";
import { createServer } from "./app/server.ts"


createServer(config.api.port)

console.log(`Server ouvindo na porta: ${config.api.port}`)