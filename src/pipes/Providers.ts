import type { Command } from "../Types";

// This is placeholder data for the sake of the example
export const command: Command = {
   command: "providers",
   description: "List all available providers",
   handler: () => {
      console.table([
         { provider: "The Eye" },
         { provider: "Vimm's Lair" },
         { provider: "Retrostic" },
         { provider: "RomsMania" },
         { provider: "DopeROMs" },
         { provider: "CoolROM" },
         { provider: "CDRommance" },
         { provider: "RetroGames" },
         { provider: "Emuparadise" },
         { provider: "ROMsDownload" },
         { provider: "ROMsMania" },
         { provider: "ROMsMode" },
         { provider: "FreeROMs" },
         { provider: "ROMsUniverse" },
         { provider: "ROMsWorld" },
         { provider: "ROMs43" },
      ])
   }
}

export default command;