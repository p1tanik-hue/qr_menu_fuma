// Shared serialisable types passed from server to client components.

export interface VariantDTO {
  id: string;
  label: string | null;
  volume: number | null;
  volumeUnit: string;
  price: number;
  description: string | null;
  isDefault: boolean;
}

export interface AddonDTO {
  id: string;
  name: string;
  price: number;
}

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  thumbUrl: string | null;
  blurData: string | null;
  isFeatured: boolean;
  variants: VariantDTO[];
  addons: AddonDTO[];
}

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  kind: string;
  children: CategoryDTO[];
  products: ProductDTO[];
}
