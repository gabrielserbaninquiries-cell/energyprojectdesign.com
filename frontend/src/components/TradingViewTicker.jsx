/**
 * TradingViewTicker — Ticker tape live BVB (V13.10)
 *
 * Widget oficial TradingView (gratuit, publicly embeddable). Preturile sunt
 * REAL-TIME de la BVB via TradingView (delay standard 15 min conform contract
 * BVB-TradingView pentru user-i neînregistrați; instant pentru cei cu cont TV).
 */
import { useEffect, useRef } from 'react';

const SYMBOLS = [
  { proName: 'NYSE:XOM',       title: 'ExxonMobil' },
  { proName: 'NYSE:CVX',       title: 'Chevron' },
  { proName: 'NYSE:SHEL',      title: 'Shell' },
  { proName: 'EURONEXT:TTE',   title: 'TotalEnergies' },
  { proName: 'NYSE:BP',        title: 'BP' },
  { proName: 'NYSE:NEE',       title: 'NextEra Energy' },
  { proName: 'MIL:ENEL',       title: 'Enel' },
  { proName: 'BME:IBE',        title: 'Iberdrola' },
  { proName: 'OMXCOP:ORSTED',  title: 'Ørsted' },
  { proName: 'NASDAQ:TSLA',    title: 'Tesla' },
  { proName: 'NASDAQ:NVDA',    title: 'Nvidia' },
  { proName: 'NYSE:BRK.B',     title: 'Berkshire Hathaway' },
];

export default function TradingViewTicker() {
  const container = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!container.current || initialized.current) return;
    initialized.current = true;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'ro',
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="w-full" data-testid="tradingview-ticker">
      <div ref={container} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
