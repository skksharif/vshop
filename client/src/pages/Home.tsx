import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProductsByCategory } from "../services/category";
import { CategoryChip } from "../components/product/CategoryChip";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { EmptyState, ErrorState } from "../components/ui/EmptyState";
import { ProductCard } from "../components/product/ProductCard";
import { Category, Product } from "../types";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://vshops.example";

// Error Boundary
class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch Categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch Products by Category (only if category selected)
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory!),
    enabled: !!selectedCategory, // ✅ only fetch when category selected
  });

  if (categoriesLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    );
  }

  if (categoriesError) {
    return <ErrorState message="Failed to load categories." />;
  }

  if (!categories || categories.length === 0) {
    return <EmptyState message="No categories found." />;
  }

  // ✅ Main UI
  return (
    <ErrorBoundary>
      <Helmet>
        <title>vshops — Shop Categories</title>
        <meta
          name="description"
          content="Discover amazing products across all categories. Shop the latest trends in fashion, electronics, home goods and more at vshops."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome to vshops
            </h1>
            <p className="text-blue-100 md:text-lg">
              Discover amazing products across all categories
            </p>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <CategoryChip category={cat} />
              </button>
            ))}
          </div>
        </section>

        {/* Products for selected category */}
        {selectedCategory && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Products in{" "}
              {
                categories.find((c) => c.id === selectedCategory)?.categoryName
              }
            </h2>

            {productsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {productsError && (
              <ErrorState message="Failed to load products." />
            )}

            {!productsLoading && products && products.length === 0 && (
              <EmptyState message="No products found in this category." />
            )}

            {products && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </ErrorBoundary>
  );
};
