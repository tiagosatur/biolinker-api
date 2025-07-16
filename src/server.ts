import { buildApp } from './app';
import { serverConfig } from './config/env';

const start = async () => {
  try {
    const app = await buildApp();
    
    await app.listen({ 
      port: Number(serverConfig.port),
      host: '0.0.0.0'
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start(); 