import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, Plus, Edit2, Trash2, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active',
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Error loading categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 'active',
      order: categories.length + 1,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      status: cat.status,
      order: cat.order || 0,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('order', formData.order);
      data.append('image', formData.image);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingCategory) {
        await api.updateCategory(editingCategory._id, data);
      } else {
        await api.createCategory(data);
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.totalProducts > 0) {
      alert(`Cannot delete category "${cat.name}". It still has ${cat.totalProducts} doors assigned to it.`);
      return;
    }

    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    try {
      await api.deleteCategory(cat._id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
            Category Management
          </h1>
          <p className="text-xs text-[#6B6862] mt-0.5">
            Organize door types (Waterproof Doors, Glass Doors, Wooden Doors) per Section 14.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
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
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E8E2D5] text-stone-400 text-xs">
          No categories found. Click "Add Category" to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const img = cat.image
              ? cat.image.startsWith('/uploads')
                ? `http://localhost:5000${cat.image}`
                : cat.image
              : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={cat._id}
                className="bg-white rounded-xl border border-[#E8E2D5] overflow-hidden shadow-xs hover:border-[#8C6D46] transition-all flex flex-col justify-between"
              >
                <div className="relative h-36 bg-[#F2EFE9] overflow-hidden">
                  <img src={img} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif text-xl font-semibold">{cat.name}</h3>
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-mono">
                      Slug: {cat.slug}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#6B6862] line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2EFE9]">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#1A1A1A]">
                        {cat.totalProducts || 0} Doors Total
                      </span>
                      <span className="text-[11px] text-stone-500">
                        ({cat.publicProducts || 0} Public / {cat.restrictedProducts || 0} Restr.)
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        cat.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="px-3 py-1.5 rounded-md hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 font-semibold text-xs flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E8E2D5] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                {editingCategory ? 'Edit Door Category' : 'Add Door Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Waterproof Doors"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of doors in this category..."
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#1A1A1A] file:text-white hover:file:bg-[#8C6D46] cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Or paste external image URL..."
                  className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A]"
                />
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
