import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Star, Heart, Share, Check } from 'lucide-react';
import { getProduct } from '../services/category';
import { useCartStore } from '../store/cart';
import { ImageCarousel } from '../components/product/ImageCarousel';
import { QuantityStepper } from '../components/product/QuantityStepper';
import { SkeletonProductDetail } from '../components/ui/SkeletonCard';
import { ErrorState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vshops.example';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  const {
    data: product,
    isLoading,
    error
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.color);
      if (product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    setAddingToCart(true);
    try {
      addItem(product, selectedColor, selectedSize, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <SkeletonProductDetail />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <ErrorState 
          message="Product not found" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.productName,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": "vshops"
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.productName} — vshops</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={`${SITE_URL}/product/${product.id}`} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={`${product.productName} — vshops`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
        <meta property="og:url" content={`${SITE_URL}/product/${product.id}`} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.productName} — vshops`} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={product.images[0]} />
        
        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <ImageCarousel images={product.images} productName={product.productName} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.productName}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">(4.0) • 123 reviews</span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${product.price.toFixed(2)}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {selectedColor && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: selectedColor.toLowerCase() }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {selectedColor}
                  </span>
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        py-2 px-3 border rounded-lg text-sm font-medium transition-colors
                        ${selectedSize === size
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                className="w-32"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.isActive || addingToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {addingToCart ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {!product.isActive 
                  ? 'Out of Stock' 
                  : addingToCart 
                  ? 'Adding...' 
                  : 'Add to Cart'
                }
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Product Details</h3>
              <dl className="space-y-2">
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">SKU:</dt>
                  <dd className="text-sm text-gray-900">{product.id.slice(0, 8).toUpperCase()}</dd>
                </div>
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">Category:</dt>
                  <dd className="text-sm text-gray-900">{product.category?.categoryName || 'General'}</dd>
                </div>
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">Status:</dt>
                  <dd className={`text-sm ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? 'In Stock' : 'Out of Stock'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};