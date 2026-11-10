import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import { config } from '../config';

let client: Anthropic | undefined;

export function getClient(): Anthropic {
  if (!config.ai.enabled) {
    throw new Error('AI features need ANTHROPIC_API_KEY in .env');
  }
  client ??= new Anthropic();
  return client;
}

export type ImageInput = { base64: string; mediaType?: 'image/png' | 'image/jpeg' };

function buildContent(prompt: string, images: ImageInput[] = []): Anthropic.ContentBlockParam[] {
  return [
    ...images.map(
      (img): Anthropic.ImageBlockParam => ({
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType ?? 'image/png', data: img.base64 },
      }),
    ),
    { type: 'text', text: prompt },
  ];
}

/**
 * Ask Claude a question (optionally with screenshots) and get back JSON
 * that matches the given Zod schema.
 */
export async function askStructured<T extends z.ZodType>(opts: {
  system: string;
  prompt: string;
  schema: T;
  images?: ImageInput[];
  effort?: 'low' | 'medium' | 'high';
}): Promise<z.infer<T>> {
  const response = await getClient().messages.parse({
    model: config.ai.model,
    max_tokens: 16000,
    system: opts.system,
    thinking: { type: 'adaptive' },
    output_config: { effort: opts.effort ?? 'medium', format: zodOutputFormat(opts.schema) },
    messages: [{ role: 'user', content: buildContent(opts.prompt, opts.images) }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude declined this request (stop_reason: refusal)');
  }
  if (!response.parsed_output) {
    throw new Error(`Claude returned no parsable output (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output as z.infer<T>;
}

/** Ask Claude for free text (used by the test generator). Streams to avoid timeouts. */
export async function askText(opts: { system: string; prompt: string; images?: ImageInput[] }) {
  const stream = getClient().messages.stream({
    model: config.ai.model,
    max_tokens: 64000,
    system: opts.system,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    messages: [{ role: 'user', content: buildContent(opts.prompt, opts.images) }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === 'refusal') throw new Error('Claude declined this request');
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
