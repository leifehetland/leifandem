import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { compileMDX } from 'next-mdx-remote/rsc';

import type { Locale } from '@/types';

/**
 * Server Component that reads and compiles the locale-specific MDX story file.
 *
 * - locale = 'en' → src/content/story.en.mdx
 * - locale = 'no' → src/content/story.no.mdx
 *
 * Both versions are pre-rendered on the server and passed as separate props to
 * the client-side <StoryPanel>, which shows only the active locale's content.
 */
export async function StoryContent({ locale }: { locale: Locale }) {
  const filename = `story.${locale}.mdx`;
  const filePath = path.join(process.cwd(), 'src', 'content', filename);
  const source = await readFile(filePath, 'utf-8');
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
  });
  return content;
}
