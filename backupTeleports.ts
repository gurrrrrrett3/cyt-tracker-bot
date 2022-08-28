import { PrismaClient } from "@prisma/client";
import fs from "fs";

const db = new PrismaClient()

db.teleport.findMany().then((teleports) => {
    fs.writeFileSync("./teleports.json", JSON.stringify(teleports, null, 4));  
})