import fs from "fs";
import path from "path";
import chalk from "chalk";
import Utils from "./utils";

const GLOAL_LOG_SETTINGS = {
  // 0 : info, 1 : warn, 2 : error
  channelLogLevel: 2,
  consoleLogLevel: 0,
  fileLogLevel: 0,
};

export default class Logger {
  public static readonly LOG_FILE = path.resolve("./logs/latest.log");  
  
  public static init() {
    
    // check for latest log file
    if (!fs.existsSync(Logger.LOG_FILE)) {
      fs.mkdirSync(path.dirname(Logger.LOG_FILE), { recursive: true });
      fs.writeFileSync(Logger.LOG_FILE, "");
    }

    const d = new Date();

    // copy latest log to a new file
    fs.copyFileSync(
      Logger.LOG_FILE,
      path.resolve(
        `./logs/log_${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}-${d.getHours()}${d.getMinutes()}${d.getSeconds()}.log`
      )
    );

    // wipe current log file and write logger header
    fs.writeFileSync(Logger.LOG_FILE, `[CYT Tracker Bot] - Bot started at ${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n\n`);
  }

  public static log(method: string, ...message: any[]) {

    const col = Utils.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel === 0) console.log(chalk.hex(col).bold(`[${method}] `) + chalk.green(`${message.join("\n")}`));
    if (GLOAL_LOG_SETTINGS.fileLogLevel === 0)
      fs.appendFileSync(Logger.LOG_FILE, `[INFO  | ${method}] ${message.join("\n")}\n`);
  }

  public static warn(method: string, ...message: any[]) {
    const col = Utils.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel <= 1) console.warn(chalk.hex(col).bold(`[${method}] `) + chalk.yellow(`${message.join("\n")}`));
    if (GLOAL_LOG_SETTINGS.fileLogLevel <= 1)
      fs.appendFileSync(Logger.LOG_FILE, `[WARN  | ${method}] ${message.join("\n")}\n`);
  }

  public static error(method: string, ...message: any[]) {
    const col = Utils.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel <= 2) console.error(chalk.hex(col).bold(`[${method}] `) + chalk.red(`${message.join("\n")}`));
    if (GLOAL_LOG_SETTINGS.fileLogLevel <= 2)
      fs.appendFileSync(Logger.LOG_FILE, `[ERROR | ${method}] ${message.join("\n")}\n`);
  }

  public static info = (method: string, ...message: any[]) => Logger.log(method, ...message);
}
