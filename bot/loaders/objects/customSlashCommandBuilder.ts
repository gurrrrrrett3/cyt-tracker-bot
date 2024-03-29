import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandMentionableOption,
  SlashCommandRoleOption,
  SlashCommandUserOption,
} from "discord.js";
import Logger from "../../utils/logger";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption";
import CustomSlashCommandSubcommandBuilder from "./customSlashCommandSubcommandBuilder";
import CustomSubommandBuilder from "./customSlashCommandSubcommandBuilder";
import CustomSlashCommandSubcommandGroupBuilder from "./customSlashCommandSubcommandGroupBuilder";

export default class CommandBuilder {
  protected enabled: boolean = true;
  private _builder = new SlashCommandBuilder();
  private _module = "";
  private _customOptions: (
    | CustomSlashCommandStringOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandNumberOption
    | CustomSubommandBuilder
    | CustomSlashCommandSubcommandGroupBuilder
  )[] = [];
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> = async () => Promise.resolve();

  constructor() {}

  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  setFunction(callback: (interaction: ChatInputCommandInteraction) => Promise<void>): this {
    this.execute = callback;
    return this;
  }

  setName(name: string) {
    this._builder.setName(name);
    return this;
  }

  setNameLocalization(locale: LocaleString, localizedName: string | null) {
    this._builder.setNameLocalization(locale, localizedName);
    return this;
  }

  setNameLocalizations(localizedNames: LocalizationMap | null) {
    this._builder.setNameLocalizations(localizedNames);
    return this;
  }

  setDescription(description: string) {
    this._builder.setDescription(description);
    return this;
  }

  setDMPermission(allowed: boolean): this {
    this._builder.setDMPermission(allowed);
    return this;
  }

  setDefaultMemberPermissions(permissions: string | number | bigint | null | undefined) {
    this._builder.setDefaultMemberPermissions(permissions);
    return this;
  }

  setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null) {
    this._builder.setDescriptionLocalization(locale, localizedDescription);
    return this;
  }

  setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null) {
    this._builder.setDescriptionLocalizations(localizedDescriptions);
    return this;
  }

  addStringOption(
    callback: (option: CustomSlashCommandStringOption) => CustomSlashCommandStringOption | undefined
  ): this {
    const opt = new CustomSlashCommandStringOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addStringOption(res.builder);
    return this;
  }

  addIntegerOption(
    callback: (option: CustomSlashCommandIntegerOption) => CustomSlashCommandIntegerOption | undefined
  ): this {
    const opt = new CustomSlashCommandIntegerOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addIntegerOption(res.builder);
    return this;
  }

  addNumberOption(
    callback: (option: CustomSlashCommandNumberOption) => CustomSlashCommandNumberOption | undefined
  ): this {
    const opt = new CustomSlashCommandNumberOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addNumberOption(res.builder);
    return this;
  }

  addSubcommand(
    callback: (option: CustomSlashCommandSubcommandBuilder) => CustomSlashCommandSubcommandBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandBuilder();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommand(res.builder);
    return this;
  }

  addSubcommandGroup(
    callback: (
      option: CustomSlashCommandSubcommandGroupBuilder
    ) => CustomSlashCommandSubcommandGroupBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandGroupBuilder();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommandGroup(res.builder);
    return this;
  }

  addAttachmentOption(
    callback: (option: SlashCommandAttachmentOption) => SlashCommandAttachmentOption | undefined
  ): this {
    const opt = new SlashCommandAttachmentOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addAttachmentOption(res);
    return this;
  }

  addBooleanOption(
    callback: (option: SlashCommandBooleanOption) => SlashCommandBooleanOption | undefined
  ): this {
    const opt = new SlashCommandBooleanOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addBooleanOption(res);
    return this;
  }

  addChannelOption(
    callback: (option: SlashCommandChannelOption) => SlashCommandChannelOption | undefined
  ): this {
    const opt = new SlashCommandChannelOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addChannelOption(res);
    return this;
  }

  addMentionableOption(
    callback: (option: SlashCommandMentionableOption) => SlashCommandMentionableOption | undefined
  ): this {
    const opt = new SlashCommandMentionableOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addMentionableOption(res);
    return this;
  }

  addRoleOption(callback: (option: SlashCommandRoleOption) => SlashCommandRoleOption | undefined): this {
    const opt = new SlashCommandRoleOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addRoleOption(res);
    return this;
  }

  addUserOption(callback: (option: SlashCommandUserOption) => SlashCommandUserOption | undefined): this {
    const opt = new SlashCommandUserOption();
    let res = callback(opt);
    res = res || opt;
    this._builder.addUserOption(res);
    return this;
  }

  toSlashCommandBuilder(): SlashCommandBuilder {
    return this._builder;
  }

  getName(): string {
    return this._builder.name;
  }

  getType(): "COMMAND" {
    return "COMMAND";
  }

  setModule(module: string) {
    this._module = module;
  }

  getModule(): string {
    return this._module;
  }

  isChatInputCommandHandler(): this is CommandBuilder {
    return true;
  }

  run(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.Subcommand
    )
      ? interaction.options.getSubcommand()
      : null;
    const subcommandGroup = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
    )
      ? interaction.options.getSubcommandGroup()
      : null;

    if (subcommandGroup) {
      const subcommandGroupObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
      ) as CustomSlashCommandSubcommandGroupBuilder;
      subcommandGroupObject.run(interaction);
    } else if (subcommand) {
      const subcommandObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
      ) as CustomSlashCommandSubcommandBuilder;
      return subcommandObject.run(interaction);
    } else {
      return this.execute(interaction);
    }

    return Promise.resolve();
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.Subcommand
      )
        ? interaction.options.getSubcommand()
        : null;
      const subcommandGroup = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
      )
        ? interaction.options.getSubcommandGroup()
        : null;

      if (subcommandGroup) {
        const subcommandGroupObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
        ) as CustomSlashCommandSubcommandGroupBuilder;
        return subcommandGroupObject.handleAutocomplete(interaction);
      } else if (subcommand) {
        const subcommandObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
        ) as CustomSlashCommandSubcommandBuilder;
        return subcommandObject.handleAutocomplete(interaction);
      } else {
        const selectedObject = this._customOptions.find(
          (o) => o.name === interaction.options.getFocused(true).name
        );
        if (!selectedObject || !selectedObject.isCustomOption()) return;
        if (selectedObject && selectedObject.autocompleteCallback) {
          if (selectedObject.takesStringTypeOption()) {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              interaction.options.getFocused()
            );
            interaction.respond(CommandBuilder.cleanAutocompleteResponse(res)).catch((e) => {
              Logger.error(`CustomSlashCommandBuilder: /${this.getName()}`, e);
            })
            return;
          } else {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              Number(interaction.options.getFocused())
            );
            interaction.respond(CommandBuilder.cleanAutocompleteResponse(res)).catch((e) => {
              Logger.error(`CustomSlashCommandBuilder: /${this.getName()}`, e);
            })
          }
        }
      }
    } catch (e) {
      Logger.error(`CustomSlashCommandBuilder: /${this.getName()}`, e);
    }
  }

  getMetadata() {
    const counts = {
      subcommands: 0,
      subcommandGroups: 0,
      options: 0,
    };

    this._customOptions.forEach((o) => {
      if (o instanceof CustomSlashCommandSubcommandBuilder) {
        counts.subcommands++;
        counts.options += o.getOptionCount();
      } else if (o instanceof CustomSlashCommandSubcommandGroupBuilder) {
        counts.subcommandGroups++;
        const meta = o.getMetadata();
        counts.subcommands += meta.options.subcommands;
        counts.options += meta.options.options;
      } else {
        counts.options++;
      }
    });

    return {
      name: this._builder.name,
      description: this._builder.description,
      options: counts,
    };
  }

  getCustomOptions() {
    return this._customOptions;
  }

  static cleanAutocompleteResponse(
    res: {
      name: string;
      value: string;
    }[]
  ): {
    name: string;
    value: string;
  }[];
  static cleanAutocompleteResponse(
    res: {
      name: string;
      value: number;
    }[]
  ): {
    name: string;
    value: number;
  }[];
  static cleanAutocompleteResponse(
    res: {
      name: string;
      value: string | number;
    }[]
  ) {
    return res.filter((r) => r.name.length > 0).slice(0, 25);
  }
}