import { bot } from "../../../..";
import chalk from "chalk";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("module")
  .setDescription("Manage loaded modules")
  .addSubcommandGroup((group) =>
    group
      .setName("list")
      .setDescription("List modules")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("all")
          .setDescription("List all loaded modules")
          .setFunction(async (interaction) => {
            const modules = bot.moduleLoader.getAllModules();
            const text =
              "```ansi\n" +
              modules
                .map(
                  (module) =>
                    `${
                      bot.moduleLoader.isModuleLoaded(module.name)
                        ? chalk.green(module.name)
                        : chalk.red(module.name)
                    }\n${bot.moduleLoader
                      .getModuleCommands(module.name)
                      .map((c) => `  - ${chalk.blue(c.getName())}`)
                      .join("\n")}`
                )
                .join("\n") +
              "```";

            await interaction.reply({
              content: text,
            }).catch((e) => {
              console.error(e);
            })
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("loaded")
          .setDescription("List all loaded modules")
          .setFunction(async (interaction) => {
            const modules = bot.moduleLoader.getLoadedModules();
            const text =
              "```ansi\n" +
              modules
                .map(
                  (module) =>
                    `${chalk.green(module.name)}\n${bot.moduleLoader
                      .getModuleCommands(module.name)
                      .map((c) => `  - ${chalk.blue(c.getName())}`)
                      .join("\n")}`
                )
                .join("\n") +
              "```";

            await interaction.reply({
              content: text,
            }).catch((e) => {
              console.error(e);
            })
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("unloaded")
          .setDescription("List all unloaded modules")
          .setFunction(async (interaction) => {
            const modules = bot.moduleLoader.getUnloadedModules();
            const text =
              "```ansi\n" +
              modules
                .map(
                  (module) =>
                    `${chalk.red(module.name)}\n${bot.moduleLoader
                      .getModuleCommands(module.name)
                      .map((c) => `  - ${chalk.blue(c.getName())}`)
                      .join("\n")}`
                )
                .join("\n") +
              "```";

            await interaction.reply({
              content: text,
            }).catch((e) => {
              console.error(e);
            })
          })
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("manage")
      .setDescription("Manage modules")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("load")
          .setDescription("Load a module")
          .addStringOption((option) =>
            option
              .setName("module")
              .setDescription("The module to load")
              .setRequired(true)
              .setChoices(...bot.moduleLoader.getAllModules().map((m) => ({ name: m.name, value: m.name })))
          )
          .setFunction(async (interaction) => {
            const module = interaction.options.getString("module");
            if (!module) return;

            const loaded = await bot.moduleLoader.loadModule(module);
            await interaction.reply({
              content: loaded ? `Loaded module ${module}` : `Failed to load module ${module} (is it already loaded?)`,
            }).catch((e) => {
              console.error(e);
            })
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("unload")
          .setDescription("Unload a module")
          .addStringOption((option) =>
            option
              .setName("module")
              .setDescription("The module to unload")
              .setRequired(true)
              .setChoices(...bot.moduleLoader.getAllModules().map((m) => ({ name: m.name, value: m.name })))
          )
          .setFunction(async (interaction) => {
            const module = interaction.options.getString("module");
            if (!module) return;

            if (module == "core") {
                await interaction.reply({
                    content: "You can't unload `core`, silly!",
                });
                return;
            }

            const unloaded = await bot.moduleLoader.unloadModule(module);
            await interaction.reply({
              content: unloaded ? `Unloaded module ${module}` : `Failed to unload module ${module} (is it loaded?)`,
            }).catch((e) => {
              console.error(e);
            })
          })
      )
  );

export default Command;
