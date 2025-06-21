const signalBox = document.getElementById("signal");
const apiKey = "6XLTMJEEILYL1VE3";
const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=${apiKey}&outputsize=compact`;

function detectPriceAction(candles) {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const isBullishEngulfing =
    prev.close < prev.open &&
    last.close > last.open &&
    last.close > prev.open &&
    last.open < prev.close;

  const isBearishEngulfing =
    prev.close > prev.open &&
    last.close < last.open &&
    last.open > prev.close &&
    last.close < prev.open;

  if (isBullishEngulfing) return "⬆️ BUY (Bullish Engulfing)";
  if (isBearishEngulfing) return "⬇️ SELL (Bearish Engulfing)";
  return "⏸️ WAIT";
}

async function fetchCandles() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const timeseries = data["Time Series FX (1min)"];

    if (!timeseries) {
      signalBox.textContent = "Erreur de données.";
      return;
    }

    const candles = Object.entries(timeseries).slice(0, 5).map(([time, d]) => ({
      time,
      open: parseFloat(d["1. open"]),
      high: parseFloat(d["2. high"]),
      low: parseFloat(d["3. low"]),
      close: parseFloat(d["4. close"]),
    })).reverse();

    const signal = detectPriceAction(candles);
    signalBox.textContent = signal;

  } catch (err) {
    console.error(err);
    signalBox.textContent = "❌ Erreur API.";
  }
}

fetchCandles();
setInterval(fetchCandles, 60000);
