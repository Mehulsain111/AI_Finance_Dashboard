"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function LiveMarketTicker() {
  const [prices, setPrices] = useState(null);
  const [prevPrices, setPrevPrices] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/ticker");

    eventSource.onmessage = (event) => {
      const newPrices = JSON.parse(event.data);
      setPrices((current) => {
        setPrevPrices(current);
        return newPrices;
      });
    };

    return () => eventSource.close();
  }, []);

  if (!prices) {
    return (
      <div className="d-flex align-items-center justify-content-center p-2 text-body-secondary small border-top border-secondary border-opacity-10" style={{ background: "color-mix(in srgb, var(--bs-body-bg) 40%, transparent)" }}>
        Connecting to live market...
      </div>
    );
  }

  const renderTicker = (symbol, price, prevPrice, keySuffix = "") => {
    const isUp = !prevPrice || price >= prevPrice;
    return (
      <div key={`${symbol}${keySuffix}`} className="d-flex align-items-center gap-1 mx-3" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
        <span className="fw-bold">{symbol}</span>
        <span className={isUp ? "text-success" : "text-danger"}>
          ${price}
        </span>
        {isUp ? <TrendingUp size={12} className="text-success" /> : <TrendingDown size={12} className="text-danger" />}
      </div>
    );
  };

  return (
    <div className="border-top border-secondary border-opacity-10 overflow-hidden position-relative w-100" style={{ background: "color-mix(in srgb, var(--bs-body-bg) 40%, transparent)", height: "30px" }}>
      <div className="d-flex align-items-center h-100 position-absolute ticker-scroll">
        <div className="d-flex align-items-center px-4">
          {Object.entries(prices).map(([symbol, price]) => renderTicker(symbol, price, prevPrices?.[symbol]))}
        </div>
        {/* Duplicate for seamless scrolling */}
        <div className="d-flex align-items-center px-4">
          {Object.entries(prices).map(([symbol, price]) => renderTicker(symbol, price, prevPrices?.[symbol], "-dup"))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll {
          animation: ticker 15s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
