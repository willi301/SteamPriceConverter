
import { useEffect, useState } from "react";

import type {
  RegionalPricesResponse
} from "../types/steam";

interface Props {
  appId: string;
}

export default function PricePanel({ appId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] =
    useState<RegionalPricesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      setLoading(true);
      setError(null);

      try {
        const extensionApi = (
          globalThis as typeof globalThis & {
            chrome?: {
              runtime?: {
                sendMessage: <T>(message: unknown) => Promise<T>;
              };
            };
          }
        ).chrome;

        if (!extensionApi?.runtime?.sendMessage) {
          throw new Error("Extension runtime is unavailable.");
        }

        const result =
          await extensionApi.runtime.sendMessage<RegionalPricesResponse>({
            type: "GET_REGIONAL_PRICES",
            appId
          });

        if (cancelled) return;

        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError("Could not connect to SteamPrice.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, [appId]);

  return (
    <section className="sp-panel">
      <button
        className="sp-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="sp-brand">
          <span className="sp-icon">S</span>
          SteamPrice
        </span>

        <span className="sp-toggle">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="sp-content">
          <div className="sp-subtitle">
            Regional price comparison
          </div>

          {loading && (
            <p className="sp-message">
              Loading regional prices...
            </p>
          )}

          {error && (
            <p className="sp-error">{error}</p>
          )}

          {!loading && data && (
            <>
              {data.prices.map((item) => (
                <div
                  className="sp-price-row"
                  key={item.region.countryCode}
                >
                  <div className="sp-region">
                    <span>{item.region.flag}</span>
                    <div>
                      <div className="sp-country">
                        {item.region.countryName}
                      </div>
                      <div className="sp-currency">
                        {item.region.currencyCode}
                      </div>
                    </div>
                  </div>

                  <div className="sp-price">
                    {item.available && item.price ? (
                      <>
                        {item.price.discount_percent > 0 && (
                          <span className="sp-discount">
                            -{item.price.discount_percent}%
                          </span>
                        )}

                        <div className="sp-price-values">
                          <span className="sp-local-price">
                            {item.price.final_formatted}
                          </span>

                          {item.usdEquivalent !== null && (
                            <span className="sp-usd-price">
                              ≈ ${item.usdEquivalent.toFixed(2)} USD
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="sp-unavailable">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="sp-footer">
                Prices retrieved from Steam storefronts
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
