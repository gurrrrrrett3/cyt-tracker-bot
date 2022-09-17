import Bot from "../bot";
import CustomMessageContextMenuCommandBuilder from "./objects/CustomMessageContextMenuCommandBuilder";
import CustomUserContextMenuCommandBuilder from "./objects/CustomUserContextMenuCommandBuilder";
import CustomSlashCommandBuilder from "./objects/customSlashCommandBuilder";


export class BaseModuleType {
    constructor(bot: Bot) {}
    init: (bot: Bot) => Promise<void>;
}

export class Module {
    name: string;
    description: string;
    init: (bot: Bot) => promise<void>;
}

export type CustomCommandBuilder = CustomSlashCommandBuilder | CustomUserContextMenuCommandBuilder | CustomMessageContextMenuCommandBuilder