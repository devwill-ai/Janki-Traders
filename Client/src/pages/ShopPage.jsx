import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { ProductCard } from '../components/ProductCard';
import { EnquiryModal } from '../components/EnquiryModal';
import {
  Search,
  Lock,
  Unlock,
  Clock,
  X,
} from 'lucide-react';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRestrictedAccess, status, daysRemaining, openAccessModal } = useCustomer();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // all, public, restricted
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);

  // Sync category param from URL
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCats();
  }, [hasRestrictedAccess]);

  // Fetch Products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.warn('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, hasRestrictedAccess]);

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  // Filter products locally by visibility if selected
  const displayedProducts = products.filter((p) => {
    if (visibilityFilter === 'public') return p.visibility === 'public';
    if (visibilityFilter === 'restricted') return p.visibility === 'restricted';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E8E2D5] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
              Digital Catalogue
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1A1A] tracking-tight">
              Architectural & Wholesale Doors
            </h1>
            <p className="text-sm sm:text-base text-[#6B6862] font-light leading-relaxed">
              Explore our curated selection of waterproof FRP/WPC assemblies, contemporary fluted glass double doors, and hand-carved solid Burma teak.
            </p>
          </div>

          {/* Access status banner inside catalogue header */}
          <div className="mt-6">
            {status === 'active' ? (
              <div className="p-3.5 rounded-lg bg-[#EBF5EE] border border-[#A7D7B5] text-[#1E5631] text-xs font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock size={16} className="text-[#2E7D32]" />
                  <span>
                    Full Catalogue Unlocked • {daysRemaining} days remaining on your verified trade pass.
                  </span>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-sm">
                  Active Member
                </span>
              </div>
            ) : status === 'pending' ? (
              <div className="p-3.5 rounded-lg bg-[#FFF8E7] border border-[#F3DB9F] text-[#8C6D46] text-xs font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="animate-spin" />
                  <span>
                    Access Request Pending • You are currently viewing public selections while admin reviews your request.
                  </span>
                </div>
                <button
                  onClick={openAccessModal}
                  className="font-semibold underline hover:text-[#1A1A1A]"
                >
                  Check Status
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[#1A1A1A] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Lock size={15} className="text-[#8C6D46] shrink-0" />
                  <span className="text-stone-700">
                    Restricted trade designs & wholesale specs require verified 7-day access.
                  </span>
                </div>
                <button
                  onClick={openAccessModal}
                  className="px-4 py-1.5 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#8C6D46] transition-colors cursor-pointer"
                >
                  Unlock 7-Day Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter & Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search door by name, code (e.g. JT-WP-101)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E8E2D5] rounded-lg text-xs sm:text-sm text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:border-[#8C6D46] shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A1A1A]"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Visibility Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[clamp(10.5px,2.2vw,12px)] text-stone-500 font-medium">Visibility:</span>
            <div className="inline-flex bg-white p-0.5 sm:p-1 rounded-lg border border-[#E8E2D5] text-[clamp(10px,2vw,12px)] shadow-2xs">
              <button
                onClick={() => setVisibilityFilter('all')}
                className={`px-[clamp(8px,1.8vw,12px)] py-1 rounded-md transition-colors cursor-pointer ${
                  visibilityFilter === 'all' ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#6B6862] hover:text-[#1A1A1A]'
                }`}
              >
                All Doors
              </button>
              <button
                onClick={() => setVisibilityFilter('public')}
                className={`px-[clamp(8px,1.8vw,12px)] py-1 rounded-md transition-colors cursor-pointer ${
                  visibilityFilter === 'public' ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#6B6862] hover:text-[#1A1A1A]'
                }`}
              >
                Public Only
              </button>
              <button
                onClick={() => setVisibilityFilter('restricted')}
                className={`px-[clamp(8px,1.8vw,12px)] py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  visibilityFilter === 'restricted' ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#6B6862] hover:text-[#1A1A1A]'
                }`}
              >
                <Lock size={11} className={visibilityFilter === 'restricted' ? 'text-[#C5A880]' : 'text-stone-400'} />
                <span>Restricted Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-[#4A4742] border border-[#E8E2D5] hover:border-[#8C6D46]'
            }`}
          >
            All Collections
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-[#8C6D46] text-white shadow-xs'
                  : 'bg-white text-[#4A4742] border border-[#E8E2D5] hover:border-[#8C6D46]'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.slug ? 'bg-white/30 text-white' : 'bg-[#FAF9F5] text-stone-500'
                }`}>
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-96 rounded-lg bg-white border border-[#E8E2D5] animate-pulse" />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E2D5] p-8 space-y-4 my-6">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F5] text-[#8C6D46] flex items-center justify-center mx-auto border border-[#E8E2D5]">
              <Search size={22} />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
              No Door Models Found
            </h3>
            <p className="text-xs text-[#6B6862] max-w-md mx-auto">
              We couldn't find any doors matching your search criteria or filter. Try selecting a different category or clearing search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                handleCategoryClick('all');
                setVisibilityFilter('all');
              }}
              className="px-4 py-2 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onInquireClick={(prod) => setSelectedProductForEnquiry(prod)}
              />
            ))}

            {/* Restricted Content Teaser Card (Visible only when user is in public mode) */}
            {!hasRestrictedAccess && (
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2B2824] rounded-lg border border-[#8C6D46]/40 p-6 text-white flex flex-col justify-between text-center relative overflow-hidden shadow-md">
                <div className="space-y-4 my-auto">
                  <div className="w-12 h-12 rounded-full bg-[#8C6D46]/20 border border-[#C5A880] text-[#C5A880] flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={22} />
                  </div>

                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#C5A880] font-semibold block">
                      Trade Restricted Access
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-white mt-1">
                      More Models Await
                    </h3>
                  </div>

                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Access our hidden catalogue of bespoke architectural double doors, limited-run teak, and marine grade polymer doors.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={openAccessModal}
                    className="w-full py-2.5 rounded-md bg-[#FAF9F5] hover:bg-white text-[#1A1A1A] text-xs font-semibold tracking-wider uppercase transition-all shadow-md cursor-pointer hover:scale-105"
                  >
                    Unlock 7-Day Access
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
      />
    </div>
  );
};
