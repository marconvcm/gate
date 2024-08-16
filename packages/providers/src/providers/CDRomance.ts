import { createProviderFactory } from '../infra/Factory';
import * as cheerio from 'cheerio';
import type { DatabaseObject, DownloadBatch, Platforms, Provider, SearchResult } from '../Types';
import { pathValue, queryParam } from '../infra/Params';

const providerName = "cdromance";

const platforms: Record<Platforms, string> = {
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

const factory = createProviderFactory({
   init: async (databaseObj: DatabaseObject, createSku: (url: string) => string): Promise<Provider> => {
      return {
         id: providerName,
         baseUrl: "https://cdromance.org",
         search: async ({ term, limit, platform, page }) => {
            const pageIndex = (page || 0) + 1;
            const url = `https://cdromance.org/${pathValue("page", pageIndex)}?s=${term}&${queryParam('platform', platforms[platform])}`;
            console.log(url);
            const { html, status } = await fetch(url, {
               "headers": {
                  "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "upgrade-insecure-requests": "1",
                  "Referer": "https://cdromance.org",
                  "Referrer-Policy": "no-referrer-when-downgrade"
               },
               "body": null,
               "method": "GET"
            }).then(async response => {
               return {
                  html: await response.text(),
                  status: response.status
               }
            });

            if (status !== 200) {
               return { statusCode: status, result: [] };
            }

            const $ = cheerio.load(html);

            const containers = new Array(...$(".games-loop .game-container"));

            const searchResult = containers.map((container): SearchResult => {

               const url = $(container).find('a').attr('href') || "unknown";
               const cover = ($(container).find('img').attr('src') || "unknown").replace("-150x150", "");
               const sku = createSku(url);
               const name = $(container).find(".game-title").text();
               const platform = $(container).find(".console").text();
               const region = $(container).find(".region").attr("title") ?? "unknown";

               return { cover, sku, url, name, platform, region, provider: providerName };
            });

            const database = await databaseObj.load();
            const updatedDatabase = searchResult.reduce((acc, result) => {
               if (!acc[result.sku]) {
                  acc[result.sku] = result.url;
               }
               return acc;
            }, database);
            await databaseObj.save(updatedDatabase);

            return {
               statusCode: status,
               result: searchResult
            };
         },

         download: async (sku: string) => {
            const database = await databaseObj.load();
            const url = database[sku];
            if (!url) {
               console.error(`No URL found for SKU: ${sku}`);
               return;
            }
            const { html, cookies } = await fetch(url, {
               "headers": {
                  "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "upgrade-insecure-requests": "1",
                  "Referer": "https://cdromance.org",
                  "Referrer-Policy": "no-referrer-when-downgrade"
               },
               "body": null,
               "method": "GET"
            }).then(async response => {
               return {
                  html: await response.text(),
                  cookies: response.headers.get("set-cookie")
               }
            });

            let $ = cheerio.load(html);
            const pageId = $("[data-id]").attr("data-id");
            if (!pageId) {
               console.error(`No download data-id found for SKU: ${sku}`);
               return;
            }

            const downloadPage = await fetch("https://cdromance.org/wp-content/plugins/cdromance/public/ajax.php", {
               "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.5",
                  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "priority": "u=1, i",
                  "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "sec-gpc": "1",
                  "x-requested-with": "XMLHttpRequest",
                  "Referer": "https://cdromance.org",
                  "Referrer-Policy": "no-referrer-when-downgrade"
               },
               "body": "post_id=" + pageId,
               "method": "POST"
            }).then(response => response.text());

            $ = cheerio.load(downloadPage);

            const downloadBatch: DownloadBatch[] = [];

            $(".download-links a").each((index, element) => {
               const href = $(element).attr("href");
               const name = $(element).html() || "";
               if (href) {
                  downloadBatch.push({ name, href });
               }
            });

            return downloadBatch;
         },

         details: async (sku: string) => {
            const database = await databaseObj.load();
            const url = database[sku];
            if (!url) {
               console.error(`No URL found for SKU: ${sku}`);
               return;
            }

            const { html } = await fetch(url, {
               "headers": {
                  "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "upgrade-insecure-requests": "1",
                  "Referer": "https://cdromance.org",
                  "Referrer-Policy": "no-referrer-when-downgrade"
               },
               "body": null,
               "method": "GET"
            }).then(async response => {
               return {
                  html: await response.text(),
               }
            });

            let $ = cheerio.load(html);

            return {
               sku,
               url,
               provider: providerName,
               notes: $(".game-description").text(),
               publisher: $("div > table > tbody > tr:nth-child(6) > td > a").text(),
               releaseDate: $("[itemprop=datePublished]").text(),
            }
         }
      }
   }
});

export default factory;