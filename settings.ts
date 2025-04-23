
import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === 'sandbox' ? "./sandbox.env" : ".env"
});

export const settings = {
    //SYSTEM
    WORKSPACE: process.env.WORKSPACE || 'local',
    WITH_PAYMENT: process.env.WITH_PAYMENT || 'n',
    NODE_ENV: process.env.NODE_ENV || 'local',
    APP_NAME: process.env.APP_NAME || '',
    TRANSFER_TO_DESTINY_MINUTES_INTERVAL: parseInt(process.env.TRANSFER_TO_DESTINY_MINUTES_INTERVAL!) || 60,
    CHECK_PRICE_SECONDS_DELAY: parseInt(process.env.CHECK_PRICE_SECONDS_DELAY!) || 120,
    PAGE_SIZE: parseInt(process.env.PAGE_SIZE!) || 10,

    //SERVER
    PORT: process.env.PORT,
    API_SECRET_KEY: process.env.API_SECRET_KEY || '',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1y',

    //DATABASE
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_HOST: process.env.DB_HOST,
    DB_DATABASE: process.env.DB_DATABASE || '',
    DB_USERNAME: process.env.DB_USERNAME || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    MONGODB_URI: process.env.MONGODB_URI || '',

    //CRYPTO
    UNISWAP_V3_ADDRESS: process.env.UNISWAP_V3_ADDRESS || '',
    MATIC_USD_ADDRESS: process.env.MATIC_USD_ADDRESS || '',
    MATIC_ADDRESS: process.env.MATIC_ADDRESS || '',
    WMATIC_ADDRESS: process.env.WMATIC_ADDRESS || '',
    MAKERX_ADDRESS: process.env.MAKERX_ADDRESS || '',
    UNISWAP_QUOTER_V2_ADDRESS: process.env.UNISWAP_QUOTER_V2_ADDRESS || '',
    UNISWAP_ROUTER_V3_ADDRESS: process.env.UNISWAP_ROUTER_V3_ADDRESS || '',
    ALCHEMY_API: process.env.ALCHEMY_API || '',
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '',
    TX_APPROVALS: Number(process.env.TX_APPROVALS) || 1,
    ENCRYPT_32BIT_KEY: process.env.ENCRYPT_32BIT_KEY || '',
    ENCRYPT_16BIT_IV_KEY: process.env.ENCRYPT_16BIT_IV_KEY || '',
    SECRET_KEY: process.env.SECRET_KEY || '',
    CHAIN_ID: parseInt(process.env.CHAIN_ID!)
};
