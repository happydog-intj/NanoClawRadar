import { Telegraf } from 'telegraf';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../config.js';

export async function sendTelegramNotification(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram notifications disabled (missing credentials)');
    return;
  }

  try {
    const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

    await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });

    console.log('✅ Sent Telegram notification');
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export function formatTelegramMessage(highlights: Array<{ title: string; description: string }>): string {
  const lines: string[] = [];

  lines.push('🔭 *NanoClaw Radar Daily Digest*');
  lines.push('');

  for (const highlight of highlights.slice(0, 5)) {
    lines.push(`• *${highlight.title}*`);
    lines.push(`  ${highlight.description}`);
    lines.push('');
  }

  lines.push('[Read full digest →](https://happydog-intj.github.io/nanoclaw-radar)');

  return lines.join('\n');
}
