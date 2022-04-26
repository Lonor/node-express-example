import express from "express";
import logger from "morgan";
import swaggerUiExpress from "swagger-ui-express";
import sse from "./api/sse.js";
import hello, { goodbye, slow } from "./api/hello.js";
import { sendToIfttt } from "./api/send.js";
import { corsMiddleware } from "./middleware/cors.js";
import timeoutResponse from "./middleware/timeout.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import config from "./swagger/apiconfig.js";
import fs from "node:fs/promises";
const __dirname = dirname(fileURLToPath(import.meta.url));
const { BASEPATH, swaggerUIPath, swaggerJSONPath } = config;
// or use node.js 17+: import doc from './swagger-output.json' assert { type: 'json' };
const swaggerSpec = JSON.parse(await fs.readFile(swaggerJSONPath));

const app = express();
app.use(logger("dev"));
const router = express.Router();
router.use(express.json());
router.use(timeoutResponse);
router.use(corsMiddleware);
router.post("/hello", hello);
router.get("/bye/:name", goodbye);
router.get("/slow", slow);
router.get("/send", sendToIfttt);
router.get("/sse", sse);
router.use(swaggerUIPath, swaggerUiExpress.serve);
router.get(swaggerUIPath, swaggerUiExpress.setup(swaggerSpec));
app.use(BASEPATH, router);
app.use("/", express.static(__dirname + "/public"));

export default app;
