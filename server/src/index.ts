import path from "path";
import { createApp } from "./app";
import { config } from "./config";
import { createLogger } from "./services/logger.service";

const logPath = path.resolve(__dirname, "../../", config.paths.log_file);
const logger = createLogger(logPath);
const app = createApp(config, logger);

const PORT = config.server.port || 3001;

app.listen(PORT, () => {
  logger.info(`Сервер запущено: http://${config.server.host}:${PORT}`);
  logger.info(`Версія: ${config.app.version}`);
});

export default app;
