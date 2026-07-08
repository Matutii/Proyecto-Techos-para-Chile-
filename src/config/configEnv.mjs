// Carga el .env y expone las variables de entorno con valores por defecto de desarrollo
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;
export const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
export const PASSWORD = process.env.PASSWORD || '';
export const DATABASE = process.env.DATABASE || 'techos_para_chile';
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
