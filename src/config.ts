/**
 * Product settings.
 *
 * IS_DEMO is true only in the public online demo (built with `npm run build:demo`).
 * The demo keeps everything in memory, so nothing is saved after the page closes.
 * The version buyers download (`npm run build`) is the full app.
 */
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

/** Where demo visitors are sent to buy the full version. */
export const ETSY_SHOP_URL = 'https://www.etsy.com/shop/DigitoolsIN';
