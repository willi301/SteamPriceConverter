
import type {
  CountryCode,
  SteamAppDetails,
  SteamPriceOverview
} from "../types/steam";

const STEAM_API =
  "https://store.steampowered.com/api/appdetails";

export async function fetchRegionalPrice(
  appId: string,
  countryCode: CountryCode
): Promise<SteamPriceOverview | null> {

  const url = new URL(STEAM_API);

  url.searchParams.set("appids", appId);
  url.searchParams.set("cc", countryCode);
  url.searchParams.set("l", "english");
  url.searchParams.set("filters", "price_overview");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Steam API request failed: ${response.status}`
    );
  }

  const result = await response.json() as Record<
    string,
    SteamAppDetails
  >;

  const appData = result[appId];

  if (!appData?.success) {
    throw new Error("Steam could not find this game.");
  }

  return appData.data?.price_overview ?? null;
}

interface ExchangeRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export async function fetchUsdExchangeRate(
  currencyCode: string
): Promise<number> {
  if (currencyCode === "USD") return 1;

  const url = `https://api.frankfurter.dev/v2/rate/${currencyCode.toLowerCase()}/usd`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate.");
  }

  const data = await response.json() as ExchangeRateResponse;

  return data.rate;
}
