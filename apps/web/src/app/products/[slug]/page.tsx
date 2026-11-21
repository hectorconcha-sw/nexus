import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from './AddToCartButton';
import { config } from '@/lib/config';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Placeholder */}
        <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border dark:border-zinc-800">
          <span className="text-zinc-400">No image available</span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-blue-600 mb-2">
            {product.category?.name || 'Uncategorized'}
          </p>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${(product.priceCents / 100).toFixed(2)}</p>

          <div className="prose dark:prose-invert mb-8 text-zinc-600 dark:text-zinc-400">
            <p>{product.description || 'No description provided for this product.'}</p>
          </div>

          <div className="mb-8">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
            >
              Status: {product.status}
            </span>
            <span className="ml-4 text-sm text-zinc-500">SKU: {product.sku}</span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
