export type Command = {
   command: string;
   description: string;
   builder?: (yargs: any) => void;
   handler: (args: any) => void;
};

export type DownloadBatch = {
   name: string
   href: string
}

export type Database = {
   [key: string]: string
}

export type DatabaseObject = {
   load: () => Promise<Database>
   save: (data: Database) => Promise<void>
}

export type SearchArgs = {
   term: string
   limit: number
   platform: Platforms
   page?: number
}

export type SearchResult = {
   id?: string
   cover?: string
   provider: string
   sku: string
   url: string
   name: string
   platform: string
   region: string
}

export type ItemDetails = {
   sku: string
   provider: string
   notes: string
   publisher: string
   releaseDate: string
   lastUpdate?: string
}

export type Provider = {
   id: string
   baseUrl: string
   isCookieRequired?: boolean
   search: (args: SearchArgs) => Promise<{ statusCode: number, result: SearchResult[] }>
   download: (sku: string) => Promise<DownloadBatch[] | undefined>
   details: (sku: string) => Promise<ItemDetails | undefined>
}

export type Platforms = "psx" | "ps2" | "psp" | "psp-eboots" | "dreamcast" | "saturn" | "genesis" | "mega-drive" | "game-gear" | "sega-cd" | "3do" | "neo-geo-cd" | "turbografx-16" | "turbografx-cd" | "wonderswan" | "ws" | "msx" | "nes" | "snes" | "nds" | "n64" | "gba" | "gbc" | "gb" | "gcn" | "f-disk-sys" | "scummvm"