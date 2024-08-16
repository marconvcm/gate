import { Router } from 'express';
import type { DownloadBatch, Provider } from 'gate-providers';

const downloadRouter = Router();

downloadRouter.get('/:sku/:provider', async (req, res) => {
   const { sku, provider } = req.params;
   const providers = req.app.get('providers') as Record<string, Provider>;


   const batch = await fetchDownloadBatch(sku, provider, providers)
      .catch(() => res.status(500).json({ error: 'An error occurred while processing your request.' }));

   res.json(batch);
});

downloadRouter.get('/:sku/:provider/cookies', async (req, res) => {
   const { sku, provider } = req.params;
   const providers = req.app.get('providers') as Record<string, Provider>;
});


const fetchDownloadBatch = async (sku: string, provider: string, providerCatalog: Record<string, Provider>): Promise<DownloadBatch[]> => {
   const providerInstance = providerCatalog[provider || 'cdromance'];
   return await providerInstance.download(sku) || [];
}

const fetchDownloadCookies = async (sku: string, provider: string, providerCatalog: Record<string, Provider>): Promise<Record<string, string>> => {
   const providerInstance = providerCatalog[provider || 'cdromance'];
   return await providerInstance.fetchHttpCookies(sku) || '';
}

export default downloadRouter;