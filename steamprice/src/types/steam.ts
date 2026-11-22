
export type CountryCode = "us" | "id" | "de";

export interface Region {
  countryCode: CountryCode;
  countryName: string;
  currencyCode: string;
  flag: string;
  minorUnitDigits: number;
}

export const REGIONS: Region[] = [
  {
    countryCode: "us",
    countryName: "United States",
    currencyCode: "USD",
    flag: "🇺🇸",
    minorUnitDigits: 2,
  },
  {
    countryCode: "id",
    countryName: "Indonesia",
    currencyCode: "IDR",
    flag: "🇮🇩",
    minorUnitDigits: 0,
  },
  {
    countryCode: "de",
    countryName: "Germany",
    currencyCode: "EUR",
    flag: "🇩🇪",
    minorUnitDigits: 2,
  },
];

export interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}

export interface RegionalPrice {
  region: Region;
  price: SteamPriceOverview | null;
  available: boolean;
  usdEquivalent: number | null;
  free: boolean;
}

export interface RegionalPricesResponse {
  appId: string;
  prices: RegionalPrice[];
  error?: string;
}

export interface SteamAppDetails {
  success: boolean;
  data?: {
    name?: string;
    is_free?: boolean;
    price_overview?: SteamPriceOverview;
  };
}
