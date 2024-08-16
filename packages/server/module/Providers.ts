import type { Request } from "express";
import { CDRomanceFactory, defaultDatabaseObject, ROMSFunFactory, type Provider } from "gate-providers";

const romsCatalogProvider: Record<string, Provider> = {
   cdromance: await CDRomanceFactory(defaultDatabaseObject),
   romsfun: await ROMSFunFactory(defaultDatabaseObject),
};

export const providers = () => romsCatalogProvider;