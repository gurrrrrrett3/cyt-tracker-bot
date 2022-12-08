
/**
 * @name Discord-Bot-Template
 * @author [gart](https://github.com/gurrrrrrett3) gart#9211
 * @license MIT
 */

import { Client } from 'discord.js';
import Bot from './bot/bot';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent"
    ]
})

client.setMaxListeners(0);

client.login(process.env.TOKEN);

export const bot = new Bot(client);
export const db = new PrismaClient()

bot.moduleLoader.loadModules()