/**
 * TradingViewMiniChart — grafic mini per companie (V13.10)
 *
 * Widget oficial TradingView „mini-symbol-overview". Preț live + trend 1 zi.
 * Se instanțiază per companie cu unique widgetId (evită conflicte multiple).
 */
import { useEffect, useRef } from 'react';

export default function TradingViewMiniChart({ symbol = 'BVB:SNG', height = 220 }) {
  const container = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!container.current || initialized.current) return;
    initialized.current = true;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height,
      locale: 'ro',
      dateRange: '3M',
      colorTheme: 'light',
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
      trendLineColor: 'rgba(124, 58, 237, 1)',
      underLineColor: 'rgba(124, 58, 237, 0.15)',
      underLineBottomColor: 'rgba(124, 58, 237, 0)',
    });
    container.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div ref={container} className="tradingview-widget-container" style={{ height, width: '100%' }} data-testid={`tv-mini-${symbol.replace(':', '-')}`}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
