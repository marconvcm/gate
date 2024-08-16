import _ from 'lodash';
import { Router } from 'express';
import type { ItemDetails, Platforms, Provider, SearchResult } from 'gate-providers/src/Types';

const searchRouter = Router();

searchRouter.get('/:provider?/search', async (req, res) => {
    try {
        const providerCatalog = req.app.get('providers');
        const { limit = 10, query, platform } = req.query;
        const { provider } = req.params;
        const pageSize = parseInt(limit as string);
        const results: SearchResult[] = await fetchSearchResults(provider, query as string, platform as Platforms, pageSize, providerCatalog);
        res.json(_.uniqBy(results, 'sku').slice(0, pageSize));
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

searchRouter.get('/:provider/:sku/details', async (req, res) => {
    try {
        const providerCatalog = req.app.get('providers');
        const { provider, sku } = req.params;
        const details: ItemDetails | undefined = await fetchDetails(provider, sku, providerCatalog);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

async function fetchDetails(provider: string | undefined, sku: string, providerCatalog: Record<string, Provider>) {
    const providerInstance = providerCatalog[provider || 'cdromance'];
    const result = await providerInstance.details(sku);
    return result;
}

async function fetchSearchResults(provider: string | undefined, query: string, platform: Platforms, limit: number, providerCatalog: Record<string, Provider>) {
    const providerInstance = providerCatalog[provider || 'cdromance'];
    const results: SearchResult[] = [];
    let page = 0;

    while (results.length < limit) {
        const searchResult = await providerInstance.search({ term: query, limit, platform });
        if (searchResult.statusCode !== 200 || !searchResult.result.length) {
            break;
        }
        results.push(...searchResult.result);
        page++;
    }

    return results;
}

export default searchRouter;
