import _ from "lodash";
import { DownloadBatch, SearchResult } from "gate-providers";
import { useEffect, useState } from "react";

export const useSearch = () => {
   const [search, setSearch] = useState<string>();
   const [results, setResults] = useState<Record<string, SearchResult[]>>({});

   const invokeSearch = (async () => {
      const param = search?.trim();
      const json = await fetch(`http://localhost:3000/api/cdromance/search?query=${param}&limit=100`)
         .then(res => res.json())
         .then(json => json as SearchResult[])
      setResults(_.groupBy(json, 'platform'));
   });

   useEffect(() => {
      search && invokeSearch();
   }, [search]);

   return {
      query: (term: string) => setSearch(_ => term),
      searchTerm: search,
      queryResult: results,
      platforms: Object.keys(results).sort()
   }
}

export const useDownloadInfo = () => {
   const [downloadInfo, setDownloadInfo] = useState<DownloadBatch[]>([]);

   const invokeDownloadInfo = (async (sku: string, provider: string) => {
      const json = await fetch(`http://localhost:3000/api/download/${sku}/${provider}`)
         .then(res => res.json())
         .then(json => json as Record<string, string>)
      setDownloadInfo(json);
   });

   return {
      downloadInfo,
      fetchDownloadInfo: invokeDownloadInfo
   }
}

export const useDetails = () => {
   const [details, setDetails] = useState<Record<string, any>>({});

   const invokeDetails = (async (sku: string, provider: string) => {
      const json = await fetch(`http://localhost:3000/api/${provider}/${sku}/details`)
         .then(res => res.json())
         .then(json => json as Record<string, any>)
      setDetails(json);
   });

   return {
      details,
      fetchDetails: invokeDetails
   }
}