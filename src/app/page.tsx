import { getMenuTree } from '@/lib/menu';
import { MenuExperience } from '@/components/menu/MenuExperience';

// Rendered per request (needs the database) — no build-time prerender,
// and menu edits appear instantly.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await getMenuTree();
  return <MenuExperience categories={categories} />;
}
