import {
  fetchRegionalPrice,
  fetchUsdExchangeRate
} from "../services/steamApi";

import {
  REGIONS,
  type RegionalPricesResponse
} from "../types/steam";

const CACHE_DURATION = 15 * 60 * 1000;

interface CacheEntry {
  timestamp: number;
  data: RegionalPricesResponse;
}

interface PriceMessage {
  type: "GET_REGIONAL_PRICES";
  appId: string;
}

const extensionApi = (globalThis as typeof globalThis & {
  chrome: {
    storage: {
      local: {
        get(key: string): Promise<Record<string, unknown>>;
        set(items: Record<string, unknown>): Promise<void>;
      };
    };
    runtime: {
      onMessage: {
        addListener(
          listener: (
            message: PriceMessage,
            sender: unknown,
            sendResponse: (response: unknown) => void
          ) => boolean | void
        ): void;
      };
    };
  };
}).chrome;

async function getRegionalPrices(
  appId: string
): Promise<RegionalPricesResponse> {

  const cacheKey = `prices_v2_${appId}`;

  // Check cached prices first.
  const cached = await extensionApi.storage.local.get(cacheKey);

  const cachedEntry = cached[cacheKey] as
    CacheEntry | undefined;

  if (
    cachedEntry &&
    Date.now() - cachedEntry.timestamp < CACHE_DURATION
  ) {
    return cachedEntry.data;
  }


  // Fetch all three regions concurrently.
  const prices = await Promise.all(
    REGIONS.map(async (region) => {
      try {
        const [price, exchangeRate] = await Promise.all([
          fetchRegionalPrice(appId, region.countryCode),
          fetchUsdExchangeRate(region.currencyCode),
        ]);

        const usdEquivalent =
          price !== null
            ? (price.final / 100) * exchangeRate
            : null;

        return {
          region,
          price,
          available: price !== null,
          usdEquivalent,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${region.countryName}:`,
          error
        );

        return {
          region,
          price: null,
          available: false,
          usdEquivalent: null,
        };
      }
    })
  );

  const data: RegionalPricesResponse = { appId, prices };
  await extensionApi.storage.local.set({
    [cacheKey]: { timestamp: Date.now(), data } satisfies CacheEntry,
  });
  return data;
}

extensionApi.runtime.onMessage.addListener(
  (
    message: PriceMessage,
    _sender,
    sendResponse
  ) => {

    if (message.type !== "GET_REGIONAL_PRICES") {
      return;
    }

    getRegionalPrices(message.appId)
      .then(sendResponse)
      .catch((error: unknown) => {
        sendResponse({
          appId: message.appId,
          prices: [],
          error: error instanceof Error
            ? error.message
            : "An unexpected error occurred."
        });
      });

    return true;
  }
);

