import fs from "fs";
import path from "path";
import Bot from "../bot";
import Module from "./base/module";
import { CustomCommandBuilder } from "./loaderTypes";

export default class ModuleLoader {
  public loadedModules: Map<string, Module> = new Map();
  public modules: Map<string, Module> = new Map();

  constructor(private bot: Bot) {
    this.loadModules();
  }

  public addModule(module: Module) {
    this.loadedModules.set(module.name, module);
    this.modules.set(module.name, module);
  }

  public getModule(name: string): Module | undefined {
    return this.loadedModules.get(name);
  }

  public loadModules() {
    const modulesPath = path.join(__dirname, "../modules");
    const loadedModules = fs.readdirSync(modulesPath);
    for (const mod of loadedModules) {
      const modulePath = path.join(modulesPath, mod);
      const moduleFile = require(modulePath);
      const m = new moduleFile.default(this.bot);
      this.addModule(m);
    }

    console.log("Loaded Modules: " + this.loadedModules.size);

    //load commands on ready

    this.bot.client.once("ready", async () => {
      const promises: Promise<CustomCommandBuilder[]>[] = [];
      this.loadedModules.forEach(async (module) => {
        promises.push(
          new Promise(async (resolve) => {
            const moduleCommands = await module.loadCommands();
            resolve(moduleCommands);
          })
        );
      });

      const commands: CustomCommandBuilder[] = [];
      (await Promise.all(promises)).forEach((moduleCommands) => {
        commands.push(...moduleCommands);
      });

      this.bot.commandLoader.load(commands);
    });
  }

  public getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  public getLoadedModules(): Module[] {
    return Array.from(this.loadedModules.values());
  }

  public getUnloadedModules(): Module[] {
    const loadedModules = this.getLoadedModules();
    const allModules = this.getAllModules();

    const unloadedModules: Module[] = [];
    allModules.forEach((module) => {
      if (!loadedModules.includes(module)) unloadedModules.push(module);
    });

    return unloadedModules;
  }

  public getModuleCommands(moduleName: string): CustomCommandBuilder[] {
    return Array.from(this.bot.commandLoader.commands.filter((command) => command.getModule() === moduleName).values())
  }

  public isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  public async loadModule(moduleName: string): Promise<boolean> {
    if (this.isModuleLoaded(moduleName)) return false;

    const modulePath = path.join(__dirname, "../modules", moduleName);
    const moduleFile = require(modulePath);
    const m = new moduleFile.default(this.bot);
    this.addModule(m);

    const moduleCommands = await m.loadCommands();
    this.bot.commandLoader.load(moduleCommands);

    return true;
  }

  public async unloadModule(moduleName: string): Promise<boolean> {
    if (!this.isModuleLoaded(moduleName)) return false;

    const module = this.getModule(moduleName);
    if (!module) return false;

    const moduleCommands = this.getModuleCommands(moduleName);
    this.bot.commandLoader.unload(moduleCommands);
    
    fs.readdirSync(path.resolve(`./dist/bot/modules/${moduleName}/commands`)).forEach((commandFile) => {
      delete require.cache[require.resolve(path.resolve(`./dist/bot/modules/${moduleName}/commands/${commandFile}`))]
      console.log(`Deleted cache for ${commandFile}`)
    })

    await module.onUnload();
    delete require.cache[require.resolve(path.join(__dirname, "../modules", moduleName))];
    this.loadedModules.delete(moduleName);

    return true;
  }
}
