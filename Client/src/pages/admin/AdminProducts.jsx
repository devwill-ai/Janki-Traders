import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert('Please select at least one door image from your system.');
      return;
    }

    if (editingProduct && existingImages.length === 0 && (!selectedFiles || selectedFiles.length === 0)) {
      alert('Please keep at least one existing image or select a new image from your system.');
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
      alert(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete door "${prod.name}"?`)) return;

    try {
      await api.deleteProduct(prod._id);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
            Product Management
          </h1>
          <p className="text-xs text-[#6B6862] mt-0.5">
            Create, edit, and categorize doors. Configure Public vs Restricted visibility per Section 13.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="px-3.5 py-2 rounded-md bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wide uppercase flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Door</span>
          </button>
        </div>
      </div>

      {/* Filters Bar (Search, Category, Visibility, Featured, Status) */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search door name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
            />
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
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
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Visibilities</option>
            <option value="public">Public Only</option>
            <option value="restricted">Restricted (7-Day Pass)</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Display Status</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
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
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#1A1A1A]"
                            title="Edit Door"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-xl border border-[#E8E2D5] max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                {editingProduct ? 'Edit Door Model' : 'Add New Door Model'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Door Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AquaShield Hydro-Lock WPC"
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
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
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] font-mono focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
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
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              {/* Visibility and Featured toggles (Section 13) */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF9F5] rounded-lg border border-[#E8E2D5]">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E8E2D5] rounded text-xs"
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
                    className="w-full px-2 py-1.5 bg-white border border-[#E8E2D5] rounded text-xs"
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
                    className="w-full px-2 py-1.5 bg-white border border-[#E8E2D5] rounded text-xs"
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
                        <div key={idx} className="relative group w-16 h-16 rounded-md overflow-hidden border border-[#E8E2D5] bg-[#F2EFE9]">
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
                <div className="border-2 border-dashed border-[#E8E2D5] hover:border-[#8C6D46] rounded-lg p-4 bg-[#FAF9F5] transition-colors text-center">
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
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload size={22} className="text-[#8C6D46]" />
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      Click to choose images from system
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Supports JPG, PNG, WEBP, AVIF (Max 5MB each, up to 6 images)
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
                        <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-emerald-300 bg-emerald-50">
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
                  className="flex-1 py-2.5 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white font-semibold transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
