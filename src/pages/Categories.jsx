import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Plus, Trash2, Search, X } from 'lucide-react';

const SEED_CATEGORIES = [
  { id: 1, name: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop' },
  { id: 2, name: 'Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop' },
  { id: 3, name: 'Cold Coffee', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop' },
  { id: 4, name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success && res.categories?.length) {
        setCategories(res.categories);
      } else {
        setCategories(SEED_CATEGORIES);
      }
    } catch (err) {
      console.warn('API error, using seed categories');
      setCategories(SEED_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const payload = {
      name: newCatName,
      image: newCatImage.trim() || undefined,
    };

    try {
      const res = await api.post('/categories', payload);
      if (res.success) {
        loadCategories();
      } else {
        const mockNew = {
          id: Date.now(),
          ...payload,
        };
        setCategories([mockNew, ...categories]);
      }
      setIsModalOpen(false);
      setNewCatName('');
      setNewCatImage('');
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteCat) return;
    try {
      const res = await api.delete(`/categories/${confirmDeleteCat.id}`);
      if (res.success) {
        loadCategories();
      } else {
        setCategories(categories.filter((c) => c.id !== confirmDeleteCat.id));
      }
    } catch (err) {
      setCategories(categories.filter((c) => c.id !== confirmDeleteCat.id));
    } finally {
      setConfirmDeleteCat(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-primary/10 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none placeholder:text-cafeDark/30"
          />
          <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-cafeDark/30" />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-cafeDark text-xs font-semibold rounded-xl hover:bg-cafeDark hover:text-primary transition-all duration-300 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="group bg-white border border-primary/10 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="aspect-[4/3] bg-primary/5 relative overflow-hidden">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop'}
                alt={cat.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-cafeDark">{cat.name}</h4>
              </div>
              
              <button
                onClick={() => setConfirmDeleteCat(cat)}
                className="p-2 text-cafeDark/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-12 text-center text-cafeDark/40 font-semibold bg-white border border-dashed border-primary/20 rounded-3xl">
            No categories found.
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 bg-adminDark/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-primary/10 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-cafeDark">Delete Category?</h3>
            <p className="text-xs text-cafeDark/60 leading-relaxed">
              Are you sure you want to delete category <strong>{confirmDeleteCat.name}</strong>? This will cascade-delete all products associated with it.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteCat(null)}
                className="px-4 py-2 border border-primary/10 hover:bg-primary/5 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-adminDark/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-primary/10 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-3">
              <h3 className="font-serif text-lg font-bold text-cafeDark">Add Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-cafeDark/5">
                <X className="h-5 w-5 text-cafeDark/60" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coffee"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com..."
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
