import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  category?: { name: string };
}

async function getProducts() {
  // We use localhost:8000 here because Next.js is running on your host machine during dev.
  // In Docker, this will be the Kong container name.
  const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) return { items: [] };
    return res.json();
  } catch {
    return { items: [] };
  }
}

export default async function HomePage() {
  const { items: products } = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {products.length === 0 ? (
        <p className="text-zinc-500">No products found. Check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group block"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-6 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                <span className="text-zinc-400 text-sm">No image</span>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-1 truncate">{product.name}</h2>
                <p className="text-sm text-zinc-500 mb-2 truncate">
                  {product.category?.name || 'Uncategorized'}
                </p>
                <p className="font-bold">${(product.priceCents / 100).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
