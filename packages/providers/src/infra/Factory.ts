import type { DatabaseObject, Provider } from "../Types";
import { createSku } from "./sha1";

const providerCatalog = new Map<string, Provider>();

export const createProviderFactory = ({ init }: {
   init: (
      database: DatabaseObject,
      createSku: (url: string) => string
   ) => Promise<Provider>;
}) => {
   return async (databaseInstance: DatabaseObject) => {
      const provider = await init(databaseInstance, createSku);
      providerCatalog.set(provider.id, provider);
      return provider;
   }
}

export const getProvider = (id: string): Provider | undefined => {
   return providerCatalog.get(id);
}

export const getDefaultProvider = (): Provider => {
   return providerCatalog.get("romsfun") || providerCatalog.values().next().value;
}

export type CurlOptions = {
   url: string;
   fileName?: string;
   method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
   headers?: Record<string, string>;
   data?: Record<string, any> | string;
   cookies?: string | Record<string, string>; // Accepts a cookie file path (string) or inline cookies (object)
   timeout?: number;
   prettyPrint?: boolean; // Option to pretty-print the command
};

export function curl(options: CurlOptions): string {
   const { url, fileName, method = 'GET', headers = {}, data, cookies, timeout, prettyPrint = false } = options;

   // Base command
   let curlCommandParts = [`curl -k -L -X ${method.toUpperCase()}`, `'${encodeURI(url)}'`];

   if (fileName) {
      curlCommandParts.push(`-o '${fileName}'`);
   }

   // Add headers
   for (const [key, value] of Object.entries(headers)) {
      curlCommandParts.push(`-H '${key}: ${value}'`);
   }

   // Add data payload (only for methods that usually include a body)
   if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      curlCommandParts.push(`-d '${dataString}'`);
   }

   // Add cookies (either as a file or inline)
   if (cookies) {
      if (typeof cookies === 'string') {
         // Treat as cookie file
         curlCommandParts.push(`-b '${cookies}'`);
      } else {
         // Treat as inline cookies
         const cookieString = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
         curlCommandParts.push(`-b '${cookieString}'`);
      }
   }

   // Set timeout if provided
   if (timeout) {
      curlCommandParts.push(`--max-time ${timeout}`);
   }

   // Join command parts into a single string
   const separator = prettyPrint ? ' \\\n  ' : ' ';
   return curlCommandParts.join(separator);
}
