import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Layers, Plus, Edit2, Trash2, RefreshCw, X, Image as ImageIcon, Upload, CheckCircle2 } from 'lucide-react';

export const AdminCategories = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    order: 0,
  });
  const [existingImage, setExistingImage] = useState('');
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
      status: 'active',
      order: categories.length + 1,
    });
    setExistingImage('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      status: cat.status,
      order: cat.order || 0,
    });
    setExistingImage(cat.image || '');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCategory && !selectedFile) {
      showInbuiltAlert('Missing Cover Image', 'Please select a cover image from your system.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('order', formData.order);

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
      showInbuiltAlert('Save Error', err.message || 'Failed to save category.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat) => {
    if (cat.totalProducts > 0) {
      showInbuiltAlert(
        'Cannot Delete Category',
        `Cannot delete category "${cat.name}". It still has ${cat.totalProducts} doors assigned to it. Please reassign or delete the doors first.`,
        'warning'
      );
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.deleteCategory(cat._id);
          await fetchCategories();
        } catch (err) {
          showInbuiltAlert('Delete Error', err.message || 'Failed to delete category.', 'danger');
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
            Category Management
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
            Organize door types (Waterproof Doors, Glass Doors, Wooden Doors) per Section 14.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchCategories}
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
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E8E2D5] text-stone-400 text-xs">
          No categories found. Click "Add Category" to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const img = getImageUrl(cat.image);

            return (
              <div
                key={cat._id}
                className="bg-white rounded-xl border border-[#E8E2D5] overflow-hidden shadow-xs hover:border-[#8C6D46] transition-all flex flex-col justify-between"
              >
                <div className="relative h-32 sm:h-36 bg-[#F2EFE9] overflow-hidden">
                  <img src={img} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif text-[clamp(1.15rem,3.2vw,1.35rem)] font-semibold leading-tight">{cat.name}</h3>
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-mono block mt-0.5">
                      Slug: {cat.slug}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#6B6862] line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2EFE9]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#1A1A1A]">
                        {cat.totalProducts || 0} Doors Total
                      </span>
                      <span className="text-[11px] text-stone-500">
                        ({cat.publicProducts || 0} Pub / {cat.restrictedProducts || 0} Restr.)
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0 ${
                        cat.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F2EFE9]">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
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

      {/* Add / Edit Category Modal (Responsive Sheet on Mobile, Dialog on Desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#E8E2D5] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl safe-pb max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5] sticky top-0 bg-white z-10">
              <h3 className="font-serif text-[clamp(1.15rem,3.5vw,1.4rem)] font-semibold text-[#1A1A1A]">
                {editingCategory ? 'Edit Door Category' : 'Add Door Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
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
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the door category..."
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-stone-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="font-semibold uppercase tracking-wider text-stone-700 block">
                  Category Cover Image *
                </label>

                {existingImage && !selectedFile && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden border border-[#E8E2D5] bg-[#F2EFE9]">
                    <img
                      src={getImageUrl(existingImage)}
                      alt="Current cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                      Current Cover
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="New preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} /> New Selection
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-[#E8E2D5] hover:border-[#8C6D46] rounded-xl p-3.5 bg-[#FAF9F5] transition-colors text-center">
                  <input
                    type="file"
                    id="category-image-upload"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/avif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="category-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1 py-1"
                  >
                    <Upload size={20} className="text-[#8C6D46]" />
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      Tap to choose category cover image
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Recommended: 800x600 JPG, PNG, or WEBP
                    </span>
                  </label>
                </div>
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
