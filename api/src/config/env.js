import 'dotenv/config';

const env = {
  PORT: parseInt(process.env.PORT || '3001'),
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  AI_PROVIDER: process.env.AI_PROVIDER || 'openrouter',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
};

export default env;
