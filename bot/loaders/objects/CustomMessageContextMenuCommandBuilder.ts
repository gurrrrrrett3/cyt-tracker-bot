import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  LocaleString,
  LocalizationMap,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import CommandBuilder from "./customSlashCommandBuilder";

export default class CustomMessageContextMenuCommandBuilder {
  protected enabled: boolean = true;
  private _builder = new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message);
  private _module = "";
  execute: (interaction: MessageContextMenuCommandInteraction) => any = async () => Promise.resolve();

  constructor() {}

  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  setFunction(callback: (interaction: MessageContextMenuCommandInteraction) => any): this {
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

  setDefaultMemberPermissions(permissions: bigint) {
    this._builder.setDefaultMemberPermissions(permissions);
    return this;
  }

  setDMPermission(permission: boolean) {
    this._builder.setDMPermission(permission);
    return this;
  }

  toConextMenuCommandBuilder(): ContextMenuCommandBuilder {
    return this._builder;
  }

  getName(): string {
    return this._builder.name;
  }

  getType(): "MESSAGE" {
    return "MESSAGE";
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

  run(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    if (interaction.commandType == ApplicationCommandType.Message) {
      this.execute(interaction);
    }
    return Promise.resolve();
  }
}
