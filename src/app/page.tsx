import { getMenuTree } from '@/lib/menu';
import { MenuExperience } from '@/components/menu/MenuExperience';

// Menu is served fresh-ish; admin mutations call revalidatePath('/').
export const revalidate = 300;

export default async function HomePage() {
  const categories = await getMenuTree();
  return <MenuExperience categories={categories} />;
}
