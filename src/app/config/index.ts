import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL,
};
