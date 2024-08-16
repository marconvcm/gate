import { getDefaultProvider, getProvider, curl } from "gate-providers";
import type { Command, DownloadBatch } from "gate-providers";

const command: Command = {
   command: "download <sku...>",
   description: "Download a ROM by ID",
   builder: (yargs) => yargs.positional("sku", {
      description: "The SKU of the ROM to download (use search command to find SKU)",
      type: "string",
      array: true
   }).option("useCurl", {
      alias: "c",
      description: "Use curl to download the ROM",
      type: "boolean",
      default: true
   }).option("cookie", {
      alias: "k",
      description: "Cookie to use for download",
      type: "string",
      default: null
   }),
   handler: async ({ sku, useCurl, cookie, provider }) => {

      const providerGateway = getProvider(provider) || getDefaultProvider();

      if (providerGateway.isCookieRequired && !cookie) {
         console.error("This provider requires a cookie to download ROMs. Please provide a cookie using the --cookie flag.");
         return;
      }

      let downloadBatch: DownloadBatch[] = [];

      for (const id of sku) {
         const batch = await providerGateway.download(id) || [];
         downloadBatch = downloadBatch.concat(batch);
      }

      if (useCurl) {
         const output = downloadBatch.map(({ name, href }) => curl({
            url: href,
            fileName: name,
            cookies: cookie,
            headers: {
               "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
               "accept-language": "en-US,en;q=0.6",
               "priority": "u=0, i",
               "referer": providerGateway.baseUrl,
               "sec-ch-ua": '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
               "sec-ch-ua-mobile": "?0",
               "sec-ch-ua-model": '""',
               "sec-ch-ua-platform": '"macOS"',
               "sec-ch-ua-platform-version": '"14.5.0"',
               "sec-fetch-dest": "document",
               "sec-fetch-mode": "navigate",
               "sec-fetch-site": "cross-site",
               "sec-fetch-user": "?1",
               "sec-gpc": "1",
               "upgrade-insecure-requests": "1",
               "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
            },
            prettyPrint: true
         })).join("\n\n");
         ``
         console.log(output);
      }
   }
}

export default command;

