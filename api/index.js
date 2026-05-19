/**
 * Vercel: export Express app trực tiếp (nhanh hơn serverless-http).
 * @see https://vercel.com/docs/frameworks/backend/express
 */
import { createApp } from '../server/src/app.js';

const app = createApp();

export default app;

export const config = {
  maxDuration: 60,
};
