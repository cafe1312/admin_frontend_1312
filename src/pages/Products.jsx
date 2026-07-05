import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, ArrowLeft, ArrowRight } from 'lucide-react';

const SEED_CATEGORIES = [
  { id: 1, name: 'Coffee' },
  { id: 2, name: 'Tea' },
  { id: 3, name: 'Cold Coffee' },
];

const SEED_PRODUCTS = [
  { id: 1, name: 'Espresso Single', price: 2.50, description: 'Rich, bold, and intense single shot of espresso.', available: true, categoryId: 1, category: { name: 'Coffee' }, image: 'https://images.unsplash.com/photo-1510707577719-fa7c18305222?w=100&auto=format&fit=crop' },
  { id: 2, name: 'Cafe Latte', price: 3.80, description: 'Double shot of espresso with steamed milk.', available: true, categoryId: 1, category: { name: 'Coffee' }, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop' },
  { id: 3, name: 'Cappuccino', price: 3.80, description: 'Classic espresso with steamed milk and deep foam.', available: false, categoryId: 1, category: { name: 'Coffee' }, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100&auto=format&fit=crop' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, pagination states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    available: true,
    isVeg: true,
  });

  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);

  const loadData = async () => {
    try {
      const prodRes = await api.get('/products');
      const catRes = await api.get('/categories');
      
      if (prodRes.success && prodRes.products?.length) {
        setProducts(prodRes.products);
      } else {
        setProducts(SEED_PRODUCTS);
      }

      if (catRes.success && catRes.categories?.length) {
        setCategories(catRes.categories);
      } else {
        setCategories(SEED_CATEGORIES);
      }
    } catch (err) {
      console.warn('API connection failed, falling back to mock lists');
      setProducts(SEED_PRODUCTS);
      setCategories(SEED_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? String(p.categoryId) === String(categoryFilter) : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      description: '',
      image: '',
      available: true,
      isVeg: true,
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      description: product.description || '',
      image: product.image || '',
      available: product.available,
      isVeg: product.isVeg === undefined ? true : product.isVeg,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      price: parseFloat(formData.price),
      isVeg: formData.isVeg,
    };

    try {
      if (modalMode === 'add') {
        const res = await api.post('/products', payload);
        if (res.success) {
          loadData();
        } else {
          // Mock local push
          const mockNew = {
            id: Date.now(),
            ...payload,
            category: { name: categories.find((c) => c.id === payload.categoryId)?.name || 'Custom' },
          };
          setProducts([mockNew, ...products]);
        }
      } else {
        const res = await api.put(`/products/${selectedProduct.id}`, payload);
        if (res.success) {
          loadData();
        } else {
          // Mock local edit
          setProducts(
            products.map((p) =>
              p.id === selectedProduct.id
                ? { ...p, ...payload, category: { name: categories.find((c) => c.id === payload.categoryId)?.name } }
                : p
            )
          );
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    }
  };

  const handleToggleAvailability = async (product) => {
    const updatedAvailable = !product.available;
    try {
      const res = await api.put(`/products/${product.id}`, { available: updatedAvailable });
      if (res.success) {
        setProducts(
          products.map((p) => (p.id === product.id ? { ...p, available: updatedAvailable } : p))
        );
      } else {
        // mock bypass
        setProducts(
          products.map((p) => (p.id === product.id ? { ...p, available: updatedAvailable } : p))
        );
      }
    } catch (err) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, available: updatedAvailable } : p))
      );
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirmDeleteProduct) return;
    try {
      const res = await api.delete(`/products/${confirmDeleteProduct.id}`);
      if (res.success) {
        loadData();
      } else {
        setProducts(products.filter((p) => p.id !== confirmDeleteProduct.id));
      }
    } catch (err) {
      setProducts(products.filter((p) => p.id !== confirmDeleteProduct.id));
    } finally {
      setConfirmDeleteProduct(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-primary/10 rounded-2xl shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-4 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none placeholder:text-cafeDark/30"
            />
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-cafeDark/30" />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-cafeDark text-xs font-semibold rounded-xl hover:bg-cafeDark hover:text-primary transition-all duration-300 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-primary/5 text-cafeDark/60 font-bold border-b border-primary/10">
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 border border-primary/10">
                      <img src={product.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&auto=format&fit=crop'} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-cafeDark">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-[2px] shrink-0 ${product.isVeg ? 'border-green-600' : 'border-red-650'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-cafeDark/60">{product.category?.name || 'Cafe Menu'}</td>
                  <td className="p-4 font-bold text-primary">₹{parseFloat(product.price).toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        product.available
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {product.available ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Sold Out
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-2 text-cafeDark/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteProduct(product)}
                      className="p-2 text-cafeDark/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-cafeDark/40 font-semibold">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-primary/10 px-4 py-3 bg-primary/5">
            <span className="text-[10px] font-semibold text-cafeDark/40 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="h-8 w-8 rounded-lg border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="h-8 w-8 rounded-lg border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 bg-adminDark/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-primary/10 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-cafeDark">Delete Product?</h3>
            <p className="text-xs text-cafeDark/60 leading-relaxed">
              Are you sure you want to delete <strong>{confirmDeleteProduct.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteProduct(null)}
                className="px-4 py-2 border border-primary/10 hover:bg-primary/5 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-adminDark/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-primary/10 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-3">
              <h3 className="font-serif text-lg font-bold text-cafeDark">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={() => setIsOpen(false) || setIsModalOpen(false)} className="p-1 rounded-full hover:bg-cafeDark/5">
                <X className="h-5 w-5 text-cafeDark/60" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cafe Latte"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3.80"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your menu product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available-check"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-primary/20 rounded cursor-pointer"
                  />
                  <label htmlFor="available-check" className="text-xs font-bold text-cafeDark/60 uppercase cursor-pointer">
                    Available in store
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVeg-check"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-600 border-primary/20 rounded cursor-pointer"
                  />
                  <label htmlFor="isVeg-check" className="text-xs font-bold text-green-600 uppercase cursor-pointer flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Veg Product
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-primary/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 border border-primary/10 hover:bg-primary/5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-10 bg-primary text-cafeDark hover:bg-cafeDark hover:text-primary rounded-xl text-xs font-semibold transition-all duration-300"
                >
                  {modalMode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
