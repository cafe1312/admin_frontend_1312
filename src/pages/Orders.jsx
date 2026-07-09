import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { ShoppingBag, ChevronRight, User, Phone, Check, RefreshCw, XCircle, Download, Trash2, Printer } from 'lucide-react';

const SEED_ORDERS = [
  {
    id: 1045,
    createdAt: new Date().toISOString(),
    totalAmount: 14.50,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'PENDING',
    customer: { name: 'Alice Smith', phone: '+1 456 7890' },
    items: [
      { id: 1, quantity: 2, price: 3.80, product: { name: 'Cafe Latte' } },
      { id: 2, quantity: 1, price: 6.90, product: { name: 'Gourmet Club Sandwich' } }
    ]
  },
  {
    id: 1044,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    totalAmount: 8.90,
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    status: 'PREPARING',
    customer: { name: 'Bob Johnson', phone: '+1 654 3210' },
    items: [
      { id: 3, quantity: 1, price: 8.90, product: { name: '1312 Signature Burger' } }
    ]
  },
  {
    id: 1043,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    totalAmount: 5.50,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    status: 'READY',
    customer: { name: 'Charlie Rose', phone: '+1 987 6543' },
    items: [
      { id: 4, quantity: 1, price: 5.50, product: { name: 'Tiramisu Classic' } }
    ]
  }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelTimeLeft, setCancelTimeLeft] = useState(0);
  const [printSize, setPrintSize] = useState('3in-a');
  const [cafeSettings, setCafeSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.settings) {
          setCafeSettings(res.settings);
        }
      } catch (err) {
        console.error('Error fetching settings for printing:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!selectedOrder || selectedOrder.status !== 'PENDING') {
      setCancelTimeLeft(0);
      return;
    }

    const checkTime = () => {
      const placedTime = new Date(selectedOrder.createdAt).getTime();
      const elapsed = (Date.now() - placedTime) / 1000;
      const remaining = Math.max(0, 10 - elapsed);
      return Math.ceil(remaining);
    };

    setCancelTimeLeft(checkTime());

    const timer = setInterval(() => {
      const remaining = checkTime();
      setCancelTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        setOrders(SEED_ORDERS);
      }
    } catch (err) {
      console.warn('API error fetching orders, using seed dashboard');
      setOrders(SEED_ORDERS);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
    
    // Auto poll orders for a real-time admin experience
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        // mock bypass
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { paymentStatus: newPaymentStatus });
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
        }
      } else {
        // mock bypass
        setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
        }
      }
    } catch (err) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Are you sure you want to delete order #${selectedOrder.id} completely from the database?`)) {
      return;
    }

    try {
      const res = await api.delete(`/orders/${selectedOrder.id}`);
      if (res.success) {
        alert('Order deleted successfully.');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert(res.message || 'Failed to delete order.');
      }
    } catch (err) {
      alert('Error deleting order.');
    }
  };

  const handlePrintKOT = (order) => {
    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
    const dateTimeStr = new Date(order.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const isCompact = printSize.endsWith('-b');
    const widthStyle = printSize.startsWith('3in') ? '72mm' : '48mm';

    let kotHtml = '';

    if (!isCompact) {
      // Standard A layout
      kotHtml = `
        <div class="text-center bold" style="font-size: 1.25em; margin-bottom: 2px;">KITCHEN ORDER TICKET</div>
        <div class="text-center" style="font-size: 0.9em; margin-bottom: 5px;">--- LIVE ORDER ---</div>
        <div class="line"></div>
        <div><span class="bold">Order ID:</span> #${order.id}</div>
        <div><span class="bold">Date/Time:</span> ${dateTimeStr}</div>
        <div><span class="bold">Customer:</span> ${order.customer?.name || 'Walk-in'}</div>
        <div class="line"></div>
        <div class="bold" style="margin-top: 5px; margin-bottom: 3px; font-size: 1.05em;">ITEMS:</div>
        <table style="font-size: 1em;">
          ${order.items.map(item => `
            <tr class="item-row">
              <td style="width: 80%;">${item.product?.name}</td>
              <td style="width: 20%; text-align: right;" class="bold">x${item.quantity}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <div class="bold" style="font-size: 1.1em; text-align: right; margin-top: 5px;">Total Qty: ${totalItems}</div>
        <div class="line"></div>
      `;
    } else {
      // Compact B layout (all uppercase, very condensed)
      kotHtml = `
        <div class="text-center bold" style="font-size: 1.05em; letter-spacing: 0.5px;">* KITCHEN TICKET *</div>
        <div class="line"></div>
        <div>ORDER ID: #${order.id}</div>
        <div>DATE/TIME: ${dateTimeStr.toUpperCase()}</div>
        <div>CLIENT: ${(order.customer?.name || 'WALK-IN').toUpperCase()}</div>
        <div class="line"></div>
        <table style="font-size: 0.95em;">
          ${order.items.map(item => `
            <tr class="item-row">
              <td><strong>${item.product?.name.toUpperCase()}</strong></td>
              <td style="text-align: right; font-weight: bold; font-size: 1.1em;">* ${item.quantity}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <div style="font-weight: bold;">TOTAL ITEMS: ${totalItems}</div>
        <div class="line"></div>
      `;
    }

    printReceipt(kotHtml, widthStyle, isCompact);
  };

  const handlePrintBill = (order) => {
    const cafeName = cafeSettings?.cafeName || '1312 Cafe';
    const cafeAddress = cafeSettings?.address || '1312 Gourmet St, Culinary City';
    const cafePhone = cafeSettings?.phone || '+1 234 567 8900';
    const taxPercentage = cafeSettings ? parseFloat(cafeSettings.taxPercentage) : 8.0;

    const dateTimeStr = new Date(order.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const isPaid = order.paymentStatus === 'PAID';
    const paymentStatusLabel = isPaid ? 'PAID' : 'UNPAID';

    // Calculate billing details mathematically
    const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryCharges = order.deliveryCharges || 0;
    const taxableAmount = Math.max(0, (order.totalAmount - deliveryCharges) / (1 + taxPercentage / 100));
    const discountAmount = Math.max(0, subtotal - taxableAmount);
    const taxAmount = taxableAmount * (taxPercentage / 100);

    const isCompact = printSize.endsWith('-b');
    const widthStyle = printSize.startsWith('3in') ? '72mm' : '48mm';

    let billHtml = '';

    if (!isCompact) {
      // Standard A layout
      billHtml = `
        <div class="text-center bold" style="font-size: 1.35em; margin-bottom: 2px;">${cafeName}</div>
        <div class="text-center" style="font-size: 0.85em; margin-bottom: 5px; line-height: 1.2;">
          ${cafeAddress}<br>Phone: ${cafePhone}
        </div>
        <div class="double-line"></div>
        <div><span class="bold">Order ID:</span> #${order.id}</div>
        <div><span class="bold">Date/Time:</span> ${dateTimeStr}</div>
        <div><span class="bold">Payment:</span> <span class="bold" style="border: 1px solid #000; padding: 0 4px;">${paymentStatusLabel}</span> (${order.paymentMethod})</div>
        <div class="line"></div>
        <div><span class="bold">Customer:</span> ${order.customer?.name}</div>
        ${order.customer?.phone ? `<div><span class="bold">Phone:</span> ${order.customer.phone}</div>` : ''}
        ${order.deliveryMethod === 'DELIVERY' && (order.address || order.customer?.address) ? `
          <div style="margin-top: 3px; font-size: 0.9em; line-height: 1.2;">
            <span class="bold">Delivery Address:</span><br>${order.address || order.customer.address}
          </div>
        ` : '<div><span class="bold">Method:</span> TAKEAWAY</div>'}
        <div class="double-line"></div>
        <table style="width: 100%; font-size: 0.95em;">
          <thead>
            <tr style="border-bottom: 1px dashed #000;">
              <th style="width: 55%; font-weight: bold;">Item</th>
              <th style="width: 15%; font-weight: bold; text-align: center;">Qty</th>
              <th style="width: 30%; font-weight: bold; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr class="item-row">
                <td>${item.product?.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="line"></div>
        <table style="width: 100%; font-size: 0.95em; line-height: 1.4;">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${discountAmount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">-₹${discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${taxAmount > 0 ? `
            <tr>
              <td>Tax (${taxPercentage}%):</td>
              <td style="text-align: right;">₹${taxAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${deliveryCharges > 0 ? `
            <tr>
              <td>Delivery Charges:</td>
              <td style="text-align: right;">₹${deliveryCharges.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr style="font-weight: bold; font-size: 1.1em; border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
            <td style="padding: 4px 0;">TOTAL BILL:</td>
            <td style="text-align: right; padding: 4px 0;">₹${parseFloat(order.totalAmount).toFixed(2)}</td>
          </tr>
        </table>
        <div class="double-line"></div>
        <div class="text-center" style="margin-top: 8px; font-style: italic; font-size: 0.9em;">
          Thank you for dining with us!
        </div>
      `;
    } else {
      // Compact B layout (all uppercase, double lines, very condensed)
      billHtml = `
        <div class="text-center bold" style="font-size: 1.1em; letter-spacing: 0.5px;">*** ${cafeName.toUpperCase()} ***</div>
        <div class="text-center" style="font-size: 0.8em; line-height: 1.2;">
          ${cafeAddress.toUpperCase()}
        </div>
        <div class="line"></div>
        <div>ORDER ID: #${order.id}</div>
        <div>DATE/TIME: ${dateTimeStr.toUpperCase()}</div>
        <div>PAYMENT: ${paymentStatusLabel} (${order.paymentMethod.toUpperCase()})</div>
        <div class="line"></div>
        <div>CLIENT: ${order.customer?.name.toUpperCase()}</div>
        ${order.deliveryMethod === 'DELIVERY' && (order.address || order.customer?.address) ? `
          <div>DELIVERY TO: ${(order.address || order.customer.address).toUpperCase()}</div>
        ` : '<div>TYPE: TAKEAWAY</div>'}
        <div class="line"></div>
        <table style="width: 100%; font-size: 0.9em;">
          ${order.items.map(item => `
            <tr class="item-row">
              <td colspan="2"><strong>${item.product?.name.toUpperCase()}</strong></td>
            </tr>
            <tr style="border-bottom: 1px dotted #ccc;">
              <td style="padding-left: 10px; color: #333;">${item.quantity} X ₹${item.price.toFixed(2)}</td>
              <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table style="width: 100%; font-size: 0.95em; line-height: 1.3;">
          <tr>
            <td>SUBTOTAL:</td>
            <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${discountAmount > 0 ? `
            <tr>
              <td>DISCOUNT:</td>
              <td style="text-align: right;">-₹${discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${taxAmount > 0 ? `
            <tr>
              <td>TAX (${taxPercentage}%):</td>
              <td style="text-align: right;">₹${taxAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${deliveryCharges > 0 ? `
            <tr>
              <td>DELIVERY:</td>
              <td style="text-align: right;">₹${deliveryCharges.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr style="font-weight: bold; border-top: 1px dashed #000;">
            <td>TOTAL:</td>
            <td style="text-align: right;">₹${parseFloat(order.totalAmount).toFixed(2)}</td>
          </tr>
        </table>
        <div class="line"></div>
        <div class="text-center" style="margin-top: 5px; font-weight: bold;">THANK YOU! COME AGAIN!</div>
      `;
    }

    printReceipt(billHtml, widthStyle, isCompact);
  };

  const printReceipt = (htmlContent, widthStyle, isCompact) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: ${isCompact ? '5px 2px' : '10px 5px'};
              font-family: 'Courier New', Courier, monospace;
              color: #000;
              background-color: #fff;
              width: ${widthStyle};
              box-sizing: border-box;
              font-size: ${isCompact ? (widthStyle === '48mm' ? '8.5px' : '10.5px') : (widthStyle === '48mm' ? '10px' : '12px')};
            }
            .receipt {
              width: 100%;
              max-height: 1200mm;
              word-wrap: break-word;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 4px 0; }
            .double-line { border-top: 3px double #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 2px 0; }
            .item-row td { vertical-align: top; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const filteredOrders = orders.filter((o) =>
    statusFilter === 'ALL' ? true : o.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 bg-white p-3 border border-primary/10 rounded-2xl shadow-sm">
        {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === s
                ? 'bg-primary text-cafeDark border-primary'
                : 'bg-background text-cafeDark/60 border-primary/10 hover:border-primary/20'
            }`}
          >
            {s}
          </button>
        ))}
        
        <button
          onClick={fetchOrders}
          className="ml-auto p-2 border border-primary/10 hover:bg-primary/10 rounded-xl transition-all"
          title="Refresh orders list"
        >
          <RefreshCw className="h-4 w-4 text-cafeDark/60" />
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Order cards list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-primary/10 rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-cafeDark/40 uppercase tracking-widest mb-4">Incoming Orders</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-primary/10 hover:border-primary/20 hover:bg-primary/5'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-cafeDark">Order #{order.id}</p>
                    <p className="text-[10px] text-cafeDark/40 uppercase font-semibold">
                      {order.customer?.name} • {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'PREPARING'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'READY'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'COMPLETED'
                          ? 'bg-primary/20 text-cafeDark'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-cafeDark/30" />
                  </div>
                </button>
              ))}

              {filteredOrders.length === 0 && (
                <p className="text-center py-12 text-cafeDark/40 font-semibold">
                  No orders in this status.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Order details */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-primary/5 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-cafeDark">Order Details</h3>
                  <p className="text-xs text-cafeDark/40 font-semibold uppercase mt-0.5">#{selectedOrder.id}</p>
                </div>
                <span className="text-sm font-bold text-primary">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>

              {/* Customer & Delivery Info */}
              <div className="space-y-3 text-xs text-cafeDark/70 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold">{selectedOrder.customer?.name}</span>
                  </p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    selectedOrder.deliveryMethod === 'DELIVERY' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedOrder.deliveryMethod || 'TAKEAWAY'}
                  </span>
                </div>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{selectedOrder.customer?.phone}</span>
                </p>
                {selectedOrder.deliveryMethod === 'DELIVERY' && (selectedOrder.address || selectedOrder.customer?.address) && (
                  <div className="border-t border-primary/5 pt-2 space-y-2">
                    <p className="text-[11px] text-cafeDark/80">
                      <span className="font-bold block text-[9px] text-cafeDark/40 uppercase">Delivery Address:</span>
                      <span className="mt-0.5 block leading-normal">{selectedOrder.address || selectedOrder.customer?.address}</span>
                    </p>
                    {selectedOrder.distance !== undefined && selectedOrder.distance !== null && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-cafeDark/70 bg-cafeDark/5 p-2 rounded-xl border border-primary/5 mt-2 animate-fade-in">
                        <div>
                          <span className="font-bold block text-[8px] text-cafeDark/40 uppercase">Distance:</span>
                          <span>{parseFloat(selectedOrder.distance).toFixed(2)} km</span>
                        </div>
                        <div>
                          <span className="font-bold block text-[8px] text-cafeDark/40 uppercase">Delivery Fee:</span>
                          <span>₹{parseFloat(selectedOrder.deliveryCharges || 0).toFixed(2)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-bold block text-[8px] text-cafeDark/40 uppercase">Live Coordinates:</span>
                          <span className="font-mono">Lat: {parseFloat(selectedOrder.latitude).toFixed(6)}, Lon: {parseFloat(selectedOrder.longitude).toFixed(6)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className="border-t border-primary/5 pt-2 flex justify-between items-center text-[10px] font-semibold text-cafeDark/60">
                  <span>Payment: <strong className="text-cafeDark">{selectedOrder.paymentMethod}</strong></span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{selectedOrder.paymentStatus}</span>
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-cafeDark/40 uppercase tracking-widest">Ordered Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-semibold">
                      <span className="text-cafeDark/80">
                        {item.product?.name} <span className="text-cafeDark/40 font-normal">x{item.quantity}</span>
                      </span>
                      <span className="text-cafeDark">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Actions Section */}
              <div className="space-y-3 border-t border-primary/5 pt-4">
                <p className="text-[10px] font-bold text-cafeDark/40 uppercase tracking-widest">Print Options</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-cafeDark/60">Receipt Size:</span>
                    <select
                      value={printSize}
                      onChange={(e) => setPrintSize(e.target.value)}
                      className="text-xs bg-background border border-primary/15 rounded-lg px-2.5 py-1.5 font-bold outline-none text-cafeDark focus:border-primary shrink-0 cursor-pointer"
                    >
                      <option value="3in-a">3 Inch A (Standard)</option>
                      <option value="3in-b">3 Inch B (Compact)</option>
                      <option value="2in-a">2 Inch A (Standard)</option>
                      <option value="2in-b">2 Inch B (Compact)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePrintKOT(selectedOrder)}
                      className="flex items-center justify-center gap-1.5 h-9 border border-primary/20 hover:bg-primary/5 text-cafeDark text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" /> Print KOT
                    </button>
                    <button
                      onClick={() => handlePrintBill(selectedOrder)}
                      className="flex items-center justify-center gap-1.5 h-9 bg-cafeDark hover:bg-cafeDark/90 text-background text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" /> Print Bill
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="space-y-3 border-t border-primary/5 pt-4">
                <p className="text-[10px] font-bold text-cafeDark/40 uppercase tracking-widest">Action Status Flow</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.paymentStatus === 'PENDING' && selectedOrder.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'PAID')}
                      className="col-span-2 flex items-center justify-center gap-2 h-10 bg-primary text-cafeDark text-xs font-bold rounded-xl hover:bg-cafeDark hover:text-primary transition-all duration-300 shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Payment Received
                    </button>
                  )}

                  {selectedOrder.status === 'PENDING' && (
                    <button
                      disabled={cancelTimeLeft > 0}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                      className={`col-span-2 flex items-center justify-center gap-2 h-10 text-xs font-bold rounded-xl transition-all ${
                        cancelTimeLeft > 0 
                          ? 'bg-cafeDark/10 text-cafeDark/30 cursor-not-allowed' 
                          : 'bg-primary text-cafeDark hover:bg-cafeDark hover:text-primary shadow-sm'
                      }`}
                    >
                      <Check className="h-4 w-4" /> 
                      {cancelTimeLeft > 0 ? `Wait (${cancelTimeLeft}s)` : 'Accept Order'}
                    </button>
                  )}

                  {selectedOrder.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                      className="col-span-2 flex items-center justify-center gap-2 h-10 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Check className="h-4 w-4" /> Set Ready for Pick Up
                    </button>
                  )}

                  {selectedOrder.status === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                      className="col-span-2 flex items-center justify-center gap-2 h-10 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" /> Set Order Completed
                    </button>
                  )}

                  {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                    <button
                      disabled={selectedOrder.status === 'PENDING' && cancelTimeLeft > 0}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                      className={`col-span-2 flex items-center justify-center gap-2 h-10 border text-xs font-bold rounded-xl transition-colors ${
                        selectedOrder.status === 'PENDING' && cancelTimeLeft > 0
                          ? 'border-cafeDark/5 text-cafeDark/20 cursor-not-allowed bg-transparent'
                          : 'border-red-200 hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <XCircle className="h-4 w-4" /> Cancel Order
                    </button>
                  )}

                  {/* Delete button (If order is more than 3 days old) */}
                  {(() => {
                    const elapsedDays = (Date.now() - new Date(selectedOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                    if (elapsedDays >= 3) {
                      return (
                        <button
                          onClick={handleDeleteOrder}
                          className="col-span-2 mt-2 flex items-center justify-center gap-2 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Order from DB
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-primary/10 border-dashed rounded-2xl p-12 text-center text-cafeDark/40 font-semibold shadow-sm">
              Select an order from the list to manage.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
