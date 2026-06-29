import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Search, User, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

const SEED_CUSTOMERS = [
  { id: 1, name: 'Alice Smith', phone: '+1 456 7890', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), _count: { orders: 5 } },
  { id: 2, name: 'Bob Johnson', phone: '+1 654 3210', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), _count: { orders: 2 } },
  { id: 3, name: 'Charlie Rose', phone: '+1 987 6543', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), _count: { orders: 1 } },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.success && res.customers) {
        setCustomers(res.customers);
      } else {
        setCustomers(SEED_CUSTOMERS);
      }
    } catch (err) {
      console.warn('API error, using seed customers');
      setCustomers(SEED_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewDetails = async (cust) => {
    setSelectedCustomer(cust);
    setDetailsLoading(true);
    setCustomerDetails(null);
    try {
      const res = await api.get(`/customers/${cust.id}`);
      if (res.success && res.customer) {
        setCustomerDetails(res.customer);
      } else {
        // mock details
        setCustomerDetails({
          ...cust,
          orders: [
            { id: 1045, totalAmount: 14.50, status: 'COMPLETED', createdAt: new Date().toISOString() },
            { id: 1022, totalAmount: 8.90, status: 'COMPLETED', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        });
      }
    } catch (err) {
      setCustomerDetails({
        ...cust,
        orders: [
          { id: 1045, totalAmount: 14.50, status: 'COMPLETED', createdAt: new Date().toISOString() },
          { id: 1022, totalAmount: 8.90, status: 'COMPLETED', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex bg-white p-4 border border-primary/10 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-background border border-primary/20 rounded-xl text-xs focus:border-primary focus:outline-none placeholder:text-cafeDark/30"
          />
          <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-cafeDark/30" />
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Table of customers */}
        <div className="lg:col-span-7 bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-primary/5 text-cafeDark/60 font-bold border-b border-primary/10">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-cafeDark">{cust.name}</p>
                      <p className="text-[10px] text-cafeDark/40 font-semibold mt-0.5">{cust.phone}</p>
                    </td>
                    <td className="p-4 text-cafeDark/80 font-semibold">
                      {cust._count?.orders || 0} orders
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetails(cust)}
                        className="px-3.5 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg hover:bg-primary hover:text-cafeDark transition-colors"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-cafeDark/40 font-semibold">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Order details */}
        <div className="lg:col-span-5">
          {selectedCustomer ? (
            <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Profile Card Header */}
              <div className="border-b border-primary/5 pb-4 space-y-1">
                <h3 className="font-serif text-lg font-bold text-cafeDark">{selectedCustomer.name}</h3>
                <p className="text-xs text-cafeDark/40 font-semibold uppercase tracking-wider">{selectedCustomer.phone}</p>
              </div>

              {detailsLoading ? (
                <Spinner />
              ) : customerDetails ? (
                <div className="space-y-6">
                  {/* Join Date */}
                  <div className="flex items-center gap-2 text-xs text-cafeDark/60">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Customer since: {new Date(customerDetails.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Orders logs */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-cafeDark/40 uppercase tracking-widest">Order History</p>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {customerDetails.orders?.map((ord) => (
                        <div key={ord.id} className="flex justify-between items-center p-3 rounded-xl border border-primary/5 bg-primary/5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-cafeDark">Order #{ord.id}</p>
                            <p className="text-[9px] text-cafeDark/40 font-semibold">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="text-right space-y-0.5">
                            <p className="text-xs font-bold text-primary">₹{parseFloat(ord.totalAmount).toFixed(2)}</p>
                            <span className="text-[8px] font-bold text-cafeDark/50 uppercase tracking-widest">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {(!customerDetails.orders || customerDetails.orders.length === 0) && (
                        <p className="text-xs text-cafeDark/40 font-semibold text-center py-6">
                          No order logs recorded.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          ) : (
            <div className="bg-white border border-primary/10 border-dashed rounded-2xl p-12 text-center text-cafeDark/40 font-semibold shadow-sm">
              Select a customer to view purchase history logs.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
