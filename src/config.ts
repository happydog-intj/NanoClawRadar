import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import type { SourceConfig } from './types.js';

config();

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
export const LANGUAGE = (process.env.LANGUAGE || 'both') as 'en' | 'zh' | 'both';

export function loadSourceConfig(): SourceConfig {
  const configPath = join(process.cwd(), 'config', 'sources.yml');
  const content = readFileSync(configPath, 'utf8');
  return load(content) as SourceConfig;
}

export const OUTPUT_DIR = join(process.cwd(), 'digests');
export const PUBLIC_DIR = join(process.cwd(), 'public');
