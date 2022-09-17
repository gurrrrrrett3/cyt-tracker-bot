import { bot } from "../../..";
import Module from "../../loaders/base/module";

export default class CoreModule extends Module {
  name = "core";
  description = "Core module";

  getCoreModule(): CoreModule {
    return bot.moduleLoader.getModule("core") as CoreModule;
  }
}
