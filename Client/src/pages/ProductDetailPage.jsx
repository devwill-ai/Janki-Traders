import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { EnquiryModal } from '../components/EnquiryModal';
import {
  ArrowLeft,
  Lock,
  Unlock,
  MessageCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRestrictedAccess, openAccessModal, settings } = useCustomer();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProductById(id);
        if (res.success) {
          setProduct(res.data);
        }
      } catch (err) {
        setError(err.message || 'Product could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, hasRestrictedAccess]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} from Janki Traders Architectural Doors Catalogue`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(
    `Hello Janki Traders, I would like to inquire about door: "${product?.name}" (Code: ${product?.product_code || 'N/A'}).`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedText}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">
            Loading Door Details...
          </p>
        </div>
      </div>
    );
  }

  // Handle Restricted or Not Found Error
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#E8E2D5] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
            Restricted Trade Product
          </h2>
          <p className="text-xs text-[#6B6862] leading-relaxed">
            {error || 'This door model is part of our restricted catalogue. Please request 7-day trade access to view full specifications.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={openAccessModal}
              className="w-full py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Request 7-Day Access
            </button>
            <Link
              to="/shop"
              className="w-full py-2 rounded-md bg-[#FAF9F5] text-stone-600 text-xs font-medium hover:bg-[#E8E2D5]"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map((img) =>
        img.startsWith('/uploads') ? `http://localhost:5000${img}` : img
      )
    : ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* Back to Shop Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6862] hover:text-[#1A1A1A] transition-colors py-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Shop</span>
        </button>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-xl border border-[#E8E2D5] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Visual */}
            <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/4] rounded-lg overflow-hidden bg-[#F2EFE9] border border-[#E8E2D5]">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {product.category_id?.name && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs font-semibold tracking-wider uppercase rounded-sm border border-[#E8E2D5]">
                    {product.category_id.name}
                  </span>
                )}
                {product.visibility === 'restricted' ? (
                  <span className="px-3 py-1 bg-[#1A1A1A] text-white text-xs font-semibold tracking-wider uppercase rounded-sm flex items-center gap-1.5 shadow-sm">
                    <Lock size={12} className="text-[#C5A880]" />
                    <span>Restricted</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase rounded-sm shadow-sm">
                    Public Catalogue
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#8C6D46] shadow-sm'
                        : 'border-[#E8E2D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Code */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded bg-[#FAF9F5] text-[#8C6D46] border border-[#E8E2D5]">
                  CODE: {product.product_code || 'JT-CUSTOM'}
                </span>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full text-stone-500 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] transition-colors border border-[#E8E2D5]"
                  title="Share product"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                </button>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              <div className="pt-2 border-t border-[#F2EFE9]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Door Specification & Overview
                </h4>
                <p className="text-sm text-[#4A4742] leading-relaxed font-light whitespace-pre-line">
                  {product.description || 'Premium architectural door built to stringent quality benchmarks.'}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-2 pt-2 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#8C6D46]" />
                  <span>Factory calibrated edge finishes & durable bonding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#8C6D46]" />
                  <span>Compatible with standard magnetic & mortise locksets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#8C6D46]" />
                  <span>Direct wholesale & bulk delivery dispatch available</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
              <button
                onClick={() => setIsEnquiryModalOpen(true)}
                className="w-full py-3.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>Submit Product Enquiry</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp Directly</span>
              </a>

              <p className="text-[11px] text-center text-stone-500">
                Submitting an enquiry automatically tracks this item under your <Link to="/inquired" className="underline font-medium text-[#1A1A1A]">Inquired Products</Link> list.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        product={product}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </div>
  );
};
