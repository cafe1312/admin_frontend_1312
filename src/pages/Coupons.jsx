import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Plus, Tag, Trash2, X } from 'lucide-react';

const SEED_COUPONS = [
  { id: 1, code: 'WELCOME10', discount: 10.0, active: true },
  { id: 2, code: 'FREE1312', discount: 13.12, active: false },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    active: true,
  });

  const [confirmDeleteCoupon, setConfirmDeleteCoupon] = useState(null);

  const loadCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
      } else {
        setCoupons(SEED_COUPONS);
      }
    } catch (err) {
      console.warn('API error, loading seed coupons');
      setCoupons(SEED_COUPONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discount) return;

    const payload = {
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      active: formData.active,
    };

    try {
      const res = await api.post('/coupons', payload);
      if (res.success) {
        loadCoupons();
      } else {
        const mockNew = {
          id: Date.now(),
          ...payload,
        };
        setCoupons([mockNew, ...coupons]);
      }
      setIsModalOpen(false);
      setFormData({ code: '', discount: '', active: true });
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    }
  };

  const handleToggleState = async (coupon) => {
    const updatedState = !coupon.active;
    try {
      const res = await api.put(`/coupons/${coupon.id}`, { active: updatedState });
      if (res.success) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: updatedState } : c)));
      } else {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: updatedState } : c)));
      }
    } catch (err) {
      setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: updatedState } : c)));
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteCoupon) return;
    try {
      const res = await api.delete(`/coupons/${confirmDeleteCoupon.id}`);
      if (res.success) {
        loadCoupons();
      } else {
        setCoupons(coupons.filter((c) => c.id !== confirmDeleteCoupon.id));
      }
    } catch (err) {
      setCoupons(coupons.filter((c) => c.id !== confirmDeleteCoupon.id));
    } finally {
      setConfirmDeleteCoupon(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 border border-primary/10 rounded-2xl shadow-sm">
        <h2 className="text-xs font-bold text-cafeDark/40 uppercase tracking-widest">Coupons & Promos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-cafeDark text-xs font-semibold rounded-xl hover:bg-cafeDark hover:text-primary transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border border-primary/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Tag className="h-3 w-3" /> {coupon.discount}% Off
                </span>
                <h4 className="font-serif text-lg font-bold text-cafeDark tracking-wider pt-2">{coupon.code}</h4>
              </div>

              <button
                onClick={() => setConfirmDeleteCoupon(coupon)}
                className="p-2 text-cafeDark/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Coupon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-primary/5 pt-4">
              <span className="text-[10px] font-bold text-cafeDark/40 uppercase tracking-wider">Activation status</span>
              <button
                onClick={() => handleToggleState(coupon)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all border ${
                  coupon.active
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                }`}
              >
                {coupon.active ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full py-12 text-center text-cafeDark/40 font-semibold bg-white border border-dashed border-primary/20 rounded-3xl">
            No coupons generated.
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmDeleteCoupon && (
        <div className="fixed inset-0 z-50 bg-adminDark/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-primary/10 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-cafeDark">Delete Coupon?</h3>
            <p className="text-xs text-cafeDark/60 leading-relaxed">
              Are you sure you want to delete coupon code <strong>{confirmDeleteCoupon.code}</strong>?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteCoupon(null)}
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
              <h3 className="font-serif text-lg font-bold text-cafeDark">Create Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-cafeDark/5">
                <X className="h-5 w-5 text-cafeDark/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafeDark/60 uppercase">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="e.g. 15"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-primary/20 rounded"
                />
                <label htmlFor="active-check" className="text-xs font-bold text-cafeDark/60 uppercase">
                  Enable coupon immediately
                </label>
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
