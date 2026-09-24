import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inbuilt Confirm / Alert Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
  });

  const showInbuiltAlert = (title, message, type = 'warning') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'OK',
      cancelText: null,
      onConfirm: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    category_id: '',
    description: '',
    visibility: 'public',
    featured: false,
    status: 'active',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (visibilityFilter !== 'all') params.visibility = visibilityFilter;
      if (featuredFilter !== 'all') params.featured = featuredFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [prodsRes, catsRes] = await Promise.all([
        api.getAdminProducts(params),
        api.getAdminCategories(),
      ]);

      if (prodsRes.success) setProducts(prodsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.warn('Error loading products/categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, visibilityFilter, featuredFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      product_code: 'JT-' + Math.floor(100 + Math.random() * 900),
      category_id: categories[0]?._id || '',
      description: '',
      visibility: 'public',
      featured: false,
      status: 'active',
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      product_code: prod.product_code || '',
      category_id: prod.category_id?._id || prod.category_id,
      description: prod.description || '',
      visibility: prod.visibility,
      featured: prod.featured,
      status: prod.status,
    });
    setExistingImages(Array.isArray(prod.images) ? prod.images : []);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingProduct && (!selectedFiles || selectedFiles.length === 0)) {
      showInbuiltAlert('Missing Images', 'Please select at least one door image from your system.', 'warning');
      return;
    }

    if (editingProduct && existingImages.length === 0 && (!selectedFiles || selectedFiles.length === 0)) {
      showInbuiltAlert('Missing Images', 'Please keep at least one existing image or select a new image from your system.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('product_code', formData.product_code);
      data.append('category_id', formData.category_id);
      data.append('description', formData.description);
      data.append('visibility', formData.visibility);
      data.append('featured', formData.featured);
      data.append('status', formData.status);
      data.append('existingImages', JSON.stringify(existingImages));

      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          data.append('images', selectedFiles[i]);
        }
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, data);
      } else {
        await api.createProduct(data);
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (err) {
      showInbuiltAlert('Save Error', err.message || 'Failed to save product.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prod) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete door "${prod.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Door',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.deleteProduct(prod._id);
          await fetchProducts();
        } catch (err) {
          showInbuiltAlert('Delete Error', err.message || 'Failed to delete product.', 'danger');
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
            Product Management
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
            Create, edit, and categorize doors. Configure Public vs Restricted visibility.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchProducts}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-2 sm:flex-initial px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Door</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-3 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search door name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
            />
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Visibilities</option>
            <option value="public">Public Only</option>
            <option value="restricted">Restricted (7-Day Pass)</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Display Status</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Adaptive Data Presentation: Mobile Cards View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5]">
            <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5] text-xs">
            No products found matching criteria. Click "Add Door" to create one.
          </div>
        ) : (
          products.map((prod) => {
            const img = getImageUrl(prod.images?.[0]);

            return (
              <div
                key={prod._id}
                className="bg-white rounded-xl border border-[#E8E2D5] p-3.5 shadow-xs flex gap-3.5 items-start hover:border-[#8C6D46] transition-colors"
              >
                <img
                  src={img}
                  alt={prod.name}
                  className="w-20 h-24 rounded-lg object-cover border border-[#E8E2D5] shrink-0 bg-[#FAF9F5]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#8C6D46] font-semibold uppercase bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#E8E2D5]">
                      {prod.product_code || 'N/A'}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        prod.visibility === 'restricted'
                          ? 'bg-[#1A1A1A] text-[#FAF9F5]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prod.visibility}
                    </span>
                    {prod.featured && (
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-200">
                        <Sparkles size={10} /> Featured
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] truncate mt-1">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {prod.category_id?.name || '—'} •{' '}
                    <span
                      className={`font-semibold uppercase text-[10px] ${
                        prod.status === 'active' ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F2EFE9]">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all"
                      title="Delete Door"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden on mobile, visible md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E8E2D5] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Door Model</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Visibility</th>
                <th className="py-3.5 px-6">Featured</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No products found. Click "Add New Door" to create one.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const img = getImageUrl(prod.images?.[0]);

                  return (
                    <tr key={prod._id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={prod.name}
                            className="w-10 h-10 rounded object-cover border border-[#E8E2D5] shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-[#1A1A1A] block">{prod.name}</span>
                            <span className="text-[10px] font-mono text-[#8C6D46] uppercase font-medium">
                              Code: {prod.product_code || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-stone-600">
                        {prod.category_id?.name || '—'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            prod.visibility === 'restricted'
                              ? 'bg-[#1A1A1A] text-[#FAF9F5]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.visibility}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {prod.featured ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Sparkles size={13} />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-stone-400">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#1A1A1A] cursor-pointer"
                            title="Edit Door"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Door"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal (Responsive Sheet on Mobile, Dialog on Desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#E8E2D5] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92dvh] overflow-y-auto safe-pb">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5] sticky top-0 bg-white z-10">
              <h3 className="font-serif text-[clamp(1.15rem,3.5vw,1.4rem)] font-semibold text-[#1A1A1A]">
                {editingProduct ? 'Edit Door Model' : 'Add New Door Model'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Door Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AquaShield Hydro-Lock WPC"
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                    placeholder="e.g. JT-WP-101"
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] font-mono focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Short Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Material specs, waterproofing, finish details..."
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              {/* Visibility and Featured toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="restricted">Restricted (7d Access)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Featured</label>
                  <select
                    value={formData.featured ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.value === 'true' })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes (Home Page)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Direct Image Upload from System */}
              <div className="space-y-3">
                <label className="font-semibold uppercase tracking-wider text-stone-700 block">
                  Door Images (Upload directly from system)
                </label>

                {/* Existing Images preview when editing */}
                {existingImages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-stone-500 font-medium">Current Images:</span>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[#E8E2D5] bg-[#F2EFE9]">
                          <img
                            src={getImageUrl(img)}
                            alt={`Door ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer shadow-xs"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File input */}
                <div className="border-2 border-dashed border-[#E8E2D5] hover:border-[#8C6D46] rounded-xl p-4 bg-[#FAF9F5] transition-colors text-center">
                  <input
                    type="file"
                    id="door-images-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/avif"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles((prev) => [...prev, ...files]);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="door-images-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1"
                  >
                    <Upload size={22} className="text-[#8C6D46]" />
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      Tap or click to choose images from system
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Supports JPG, PNG, WEBP, AVIF (Max 5MB each)
                    </span>
                  </label>
                </div>

                {/* Preview of newly selected files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {selectedFiles.length} new image{selectedFiles.length > 1 ? 's' : ''} selected:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-stone-700 font-semibold cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#8C6D46] text-white font-semibold transition-colors cursor-pointer active:scale-95"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inbuilt Confirm / Alert Dialog */}
      <ConfirmModal
        {...confirmDialog}
        onCancel={() => {
          if (confirmDialog.onCancel) confirmDialog.onCancel();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};
