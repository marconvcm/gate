import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import type { Command } from "./Types";
import { CDRomanceFactory, defaultDatabaseObject } from "gate-providers";

const pipe = yargs(hideBin(process.argv)).option("provider", {
   alias: "u",
   description: "The provider to use for downloading ROMs",
   type: "string",
   default: "cdromance"
});

await Promise.all([
   ...await import("gate-providers").then(({
      CDRomanceFactory,
      ROMSFunFactory
   }) => [
         CDRomanceFactory,
         ROMSFunFactory
      ]),
]).then((providers) => {
   providers.forEach((provider) => {
      provider(defaultDatabaseObject);
   });
});

await Promise.all([
   import("./pipes/Providers"),
   import("./pipes/Platforms"),
   import("./pipes/Download"),
   import("./pipes/Search"),
]).then((commands) => {
   commands.forEach((command) => {
      if (command.default) {
         const { default: cmd } = command as { default: Command }
         if (cmd.builder) {
            pipe.command(
               cmd.command,
               cmd.description,
               cmd.builder,
               cmd.handler
            )
         } else {
            pipe.command(
               cmd.command,
               cmd.description,
               cmd.handler
            )
         }
      }
   });
});

pipe.parse()

