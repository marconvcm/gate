import type { Command } from "../Types";

export const platforms = {
   "psx": "psx-iso",
   "ps2": "ps2-iso",
   "psp": "psp",
   "psp-eboots": "psx2psp",
   "dreamcast": "dc-iso",
   "saturn": "sega_saturn_isos",
   "genesis": "sega_genesis_roms",
   "mega-drive": "sega_genesis_roms",
   "game-gear": "game-gear",
   "sega-cd": "sega_cd_isos",
   "3do": "3do-iso",
   "neo-geo-cd": "neo-geo-cd",
   "turbografx-16": "turbografx-16",
   "turbografx-cd": "turbografx-cd",
   "wonderswan": "wonderswan",
   "ws": "wonderswan",
   "msx": "msx-roms",
   "nes": "nes-roms",
   "snes": "snes-rom",
   "nds": "nds-roms",
   "n64": "n64-roms",
   "gba": "gba-roms",
   "gbc": "gbc_roms",
   "gb": "gb_roms",
   "gcn": "gcn-iso",
   "f-disk-sys": "famicom_disk_system",
   "scummvm": "scummvm"
}

const command: Command = {
   command: "platforms",
   description: "List all available platforms",
   handler: () => {
      console.table(Object.entries(platforms).map(([key, value]) => ({ platform: key })));
   }
}

export default command;