import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import Collections from "./Collections.js";

const commands = new Collections();
commands.prefix = global.prefa;

async function readcommands() {
  commands.clear();
  const pluginsDir = path.join(process.cwd(), "Plugins");
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
    return;
  }

  const cmdFiles = fs
    .readdirSync(pluginsDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of cmdFiles) {
    try {
      const filePath = path.join(pluginsDir, file);
      const module = await import(pathToFileURL(filePath).href);
      const cmdModule = module.default;
      if (!cmdModule || !cmdModule.name) {
        console.warn(`[ SPIDER-BOT ] Skipping ${file}: missing default export or name`);
        continue;
      }
      commands.set(cmdModule.name, cmdModule);
    } catch (err) {
      console.error(`[ EXCEPTION ] Failed to load plugin ${file}: ${err.message}`);
    }
  }
}

export { readcommands, commands };
