import type { CurlOptions, DownloadBatch } from 'gate-providers';

export function countryEmoji(region: string): string {
   switch (region) {
      case 'Region Europe, USA':
         return '🇪🇺🇺🇸';
      case 'Region Japan':
         return '🇯🇵';
      case 'Region Europe':
         return '🇪🇺';
      case 'Region USA':
         return '🇺🇸';
      default:
         return '';
   }
}


export function curl(options: CurlOptions): string {
   const { url, fileName, method = 'GET', headers = {}, data, cookies, timeout, prettyPrint = false } = options;

   // Base command
   let curlCommandParts = [`curl -k -L -X ${method.toUpperCase()}`];

   if (fileName) {
      curlCommandParts.push(`-o "${fileName}"`);
   }

   // Add headers
   for (const [key, value] of Object.entries(headers)) {
      curlCommandParts.push(`-H "${key}: ${value}"`);
   }

   // Add data payload (only for methods that usually include a body)
   if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      curlCommandParts.push(`-d "${dataString}"`);
   }

   // Add cookies (either as a file or inline)
   if (cookies) {
      if (typeof cookies === 'string') {
         // Treat as cookie file
         curlCommandParts.push(`-b "${cookies}"`);
      } else {
         // Treat as inline cookies
         const cookieString = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
         curlCommandParts.push(`-b "${cookieString}"`);
      }
   }

   // Set timeout if provided
   if (timeout) {
      curlCommandParts.push(`--max-time ${timeout}`);
   }

   // Join command parts into a single string
   const separator = prettyPrint ? ' \\\n  ' : ' ';

   curlCommandParts.push(`"${encodeURI(url)}"`);

   return curlCommandParts.join(separator);
}


export const commandToDownloadIt = (downloadBatch: DownloadBatch, headerBuilder: () => Record<string, string>): string => {
   const { name, href } = downloadBatch;
   return curl({
      url: href,
      fileName: name,
      headers: headerBuilder(),
      prettyPrint: true,
   });
}