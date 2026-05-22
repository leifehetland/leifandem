import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { compileMDX } from 'next-mdx-remote/rsc';

/**
 * Server Component that reads `src/content/story.mdx` at request time and
 * compiles it to a React node. The result is rendered as `children` of the
 * client-side `StoryPanel`.
 *
 * Editing the story = editing `story.mdx`. No restart needed in dev.
 */
export async function StoryContent() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'story.mdx');
  const source = await readFile(filePath, 'utf-8');
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
  });
  return content;
}
