import { getDefaultProvider, getProvider } from "gate-providers";
import type { Command, SearchResult } from "gate-providers";

const command: Command = {
   command: "search <term>",
   description: "Search for ROMs by term",
   builder: (yargs) => yargs.positional("term", {
      description: "The search term for ROMs",
      type: "string",
   }).option("limit", {
      alias: "l",
      description: "Maximum number of results to display",
      type: "number",
      default: 10
   }).option("platform", {
      alias: "p",
      description: "Filter results by platform",
      type: "string",
      default: null
   }).option("quiet", {
      alias: "q",
      description: "Only display the SKU of the ROM",
      type: "boolean",
      default: false
   }).option("urlOnly", {
      alias: "w",
      description: "Only display the SKU of the ROM",
      type: "boolean",
      default: false
   }),
   handler: async ({ term, limit, platform, quiet, provider, urlOnly }) => {
      const providerGateway = getProvider(provider) || getDefaultProvider();

      let page = 0;
      let searchResult: SearchResult[] = [];

      console.log(`[${provider}] Searching for ${term}...`);

      while (true) {

         const { statusCode, result } = await providerGateway.search({ term, limit, platform, page });

         if (statusCode !== 200) {
            break;
         }

         page++;

         searchResult.push(...result);

         if (searchResult.length >= limit) {
            break;
         }
      }

      searchResult = searchResult.slice(0, limit);

      if (quiet) {
         searchResult.forEach(({ sku }) => process.stdout.write(`${sku} `));
      } else if (urlOnly) {
         searchResult.forEach(({ url }) => process.stdout.write(`${url}\n`));
      } else {
         console.group("Search Results");
         console.table(searchResult.map(({ name, platform, region, sku, provider }) => ({ name, platform, region, sku, provider })));
      }
   }
}

export default command;