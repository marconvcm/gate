import { createProviderFactory } from '../infra/Factory';
import * as cheerio from 'cheerio';
import type { DatabaseObject, DownloadBatch, Provider, SearchResult } from '../Types';
import { pathValue } from '../infra/Params';

const providerName = "romsfun";

const factory = createProviderFactory({
   init: async (databaseObj: DatabaseObject, createSku: (url: string) => string): Promise<Provider> => {
      return {
         id: providerName,
         baseUrl: "https://romsfun.com",
         isCookieRequired: true,
         search: async ({ term, limit, platform, page }) => {

            const searchResult: SearchResult[] = [];

            const { html, status } = await fetch(`https://romsfun.com/${pathValue("page", page)}?s=${term}`).then(async response => {
               return {
                  html: await response.text(),
                  status: response.status
               }
            });

            if (status !== 200) {
               return { statusCode: status, result: [] };
            }

            const $ = cheerio.load(html);

            const containers = new Array(...$(".archive-container"));

            containers.map((container): SearchResult => {
               const url = $(container).find('a').attr('href') || "unknown";
               const cover = $(container).find('img').attr('src') || "unknown";
               const sku = createSku(url);
               const name = $(container).find("h3").text().trim();
               const platform = /\/roms\/([^/]+)\//.exec(url)?.[1] ?? "unknown";
               const region = "unknown";
               return { sku, url, name, platform, region, provider: providerName, cover };
            }).forEach(result => searchResult.push(result));

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

            const { html, cookies } = await fetch(url).then(async response => {
               return {
                  html: await response.text(),
                  cookies: response.headers.get("set-cookie") || ""
               }
            });

            let $ = cheerio.load(html)

            const downloadPageHref = $("a.btn-primary").attr("href");

            if (!downloadPageHref) {
               console.error(`No download page found for SKU: ${sku}`);
               return;
            }

            $ = cheerio.load(await (await fetch(downloadPageHref)).text())

            return await Promise.all(
               new Array(...$("a.h6").map(async (index, element) => {
                  const href = element.attribs["href"];
                  const html = await (await fetch("https://romsfun.com/wp-admin/admin-ajax.php", {
                     "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
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
                        "Referer": href,
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                     },
                     "body": "action=k_get_download",
                     "method": "POST"
                  })).text()
                  $ = cheerio.load(html);
                  const downloadLink: DownloadBatch = {
                     name: decodeURI(($("a").attr("href") || "").split("/").pop() || ""),
                     href: $("a").attr("href") || ""
                  };

                  return downloadLink;
               })
               )
            )
         },

         details: async (sku: string) => {
            return {
               sku,
               provider: providerName,
               notes: "",
               publisher: "",
               releaseDate: "",
               rating: {
                  count: 0,
                  average: 0
               }
            }
         }
      }
   }
});

export default factory;