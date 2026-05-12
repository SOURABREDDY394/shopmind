import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from '../hooks/useScrollEffects';
import {
  Package,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  MoreVertical,
  Box,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Modal from '../components/Modal';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { EmptyState, ErrorState, LoadingState, PageShell, formatCurrency } from '../components/ui';

const emptyProduct = {
  name: '',
  stock: 0,
  price: '',
};

const productStatus = (stock) => {
  if (Number(stock) <= 0) return 'Out of Stock';
  if (Number(stock) <= 5) return 'Low Stock';
  return 'In Stock';
};

const exportCsv = (rows) => {
  const headers = ['id', 'name', 'price', 'stock', 'created_at'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'shopmind-products.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const itemsPerPage = 5;

  const loadProducts = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setLoading(true);
    setError('');
    const { data, error: productsError } = await supabase
      .from('products')
      .select('id,name,price,stock,created_at')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (productsError) {
      setError(productsError.message);
      setProducts([]);
      return;
    }

    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const inventoryStats = useMemo(() => {
    const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0);
    const lowStockCount = products.filter((product) => productStatus(product.stock) !== 'In Stock').length;
    const categories = new Set(products.map((product) => product.category || 'Not tracked')).size;
    return {
      inventoryValue,
      lowStockCount,
      categories: products.length > 0 ? categories : 0,
    };
  }, [products]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const sortableItems = [...products]
      .map((product) => ({
        ...product,
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        sku: `SKU-${String(product.id).slice(0, 8).toUpperCase()}`,
        category: product.category || 'Not tracked',
        status: productStatus(product.stock),
      }))
      .filter((product) => product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search))
      .filter((product) => categoryFilter === 'all' || product.category === categoryFilter)
      .filter((product) => stockFilter === 'all' || product.status === stockFilter);

    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableItems;
  }, [products, searchTerm, categoryFilter, stockFilter, sortConfig]);

  const categories = useMemo(() => (
    ['all', ...new Set(products.map((product) => product.category || 'Not tracked'))]
  ), [products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Low Stock': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Out of Stock': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      stock: product.stock,
      price: product.price,
    });
    setAddModalOpen(true);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    if (!productForm.name.trim()) return;

    setSaving(true);
    setError('');

    const payload = {
      name: productForm.name.trim(),
      price: Number(productForm.price || 0),
      stock: Number(productForm.stock || 0),
    };

    const result = editingProduct
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setAddModalOpen(false);
    setProductForm(emptyProduct);
    setEditingProduct(null);
    loadProducts();
  };

  const deleteProduct = async (productId) => {
    setError('');
    const { error: deleteError } = await supabase.from('products').delete().eq('id', productId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    loadProducts();
  };

  return (
    <PageShell
      eyebrow="Inventory"
      title="Inventory Management"
      description="Track real Supabase products, stock levels, pricing, and fulfillment readiness."
      actions={(
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 w-fit px-6 py-3 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      )}
    >

      <ErrorState message={error} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Total Inventory</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {loading ? 'Loading...' : products.length ? formatCurrency(inventoryStats.inventoryValue, 0) : 'No data yet'}
              </p>
            </div>
          </div>
        </div>
        <div className="card-premium p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-inner animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-[var(--text)]">{loading ? 'Loading...' : products.length ? `${inventoryStats.lowStockCount} Items` : 'No data yet'}</p>
            </div>
          </div>
        </div>
        <div className="card-premium p-6 bg-gradient-to-br from-purple-500/5 to-transparent border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Categories</p>
              <p className="text-2xl font-bold text-[var(--text)]">{loading ? 'Loading...' : products.length ? `${inventoryStats.categories} Active` : 'No data yet'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium p-4 flex flex-col md:flex-row gap-4 border-white/5 bg-[var(--active-bg)] backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="input-premium w-auto min-w-[150px]">
            {categories.map((category) => (
              <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>
            ))}
          </select>
          <select value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setCurrentPage(1); }} className="input-premium w-auto min-w-[150px]">
            <option value="all">All stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button onClick={() => exportCsv(products)} className="flex items-center gap-2 px-6 py-3 bg-[var(--hover-bg)] border border-white/10 rounded-xl hover:bg-[var(--active-bg)] transition-all text-sm font-semibold text-[var(--text)]">
            <Filter className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={loadProducts} className="flex items-center gap-2 px-6 py-3 bg-[var(--hover-bg)] border border-white/10 rounded-xl hover:bg-[var(--active-bg)] transition-all text-sm font-semibold text-[var(--text)]">
            <ArrowUpDown className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-white/5 scanner-container">
        {/* Scanner line effect */}
        <div className="scanner-line" />
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="cursor-pointer hover:text-[var(--text)] transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Product Info
                    {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th>Category</th>
                <th className="text-center cursor-pointer hover:text-[var(--text)] transition-colors" onClick={() => handleSort('stock')}>
                  <div className="flex items-center justify-center gap-2">
                    Stock
                    {sortConfig.key === 'stock' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="cursor-pointer hover:text-[var(--text)] transition-colors" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">
                    Price
                    {sortConfig.key === 'price' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan="6">
                    <LoadingState label="Loading products from Supabase..." />
                  </td>
                </tr>
              )}
              {!loading && paginatedProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-[var(--active-bg)] transition-colors group ${
                  product.status === 'Low Stock' ? 'stock-indicator-amber' :
                  product.status === 'Out of Stock' ? 'stock-indicator-red' :
                  'stock-indicator-green'
                }`}
                >
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10">
                        <Box className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text)] text-sm">{product.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-medium px-3 py-1 bg-[var(--hover-bg)] rounded-full border border-white/10 text-[var(--text-muted)]">
                      {product.category}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="text-sm font-bold text-[var(--text)]">{product.stock}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Units</div>
                  </td>
                  <td>
                    <div className="text-sm font-extrabold text-[var(--text)]">${product.price.toFixed(2)}</div>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-500/20 rounded-xl text-blue-400 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[var(--hover-bg)] rounded-xl text-[var(--text-muted)] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[var(--hover-bg)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing <span className="text-white font-bold">{filteredProducts.length ? Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</span> of <span className="text-white font-bold">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'border border-white/10 hover:bg-white/5'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title={products.length ? 'No products match your filters' : 'No products yet. Add your first product from Data Entry.'}
              description={products.length ? 'Try a different search, category, or stock status.' : 'Products are loaded only from your Supabase products table.'}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <form className="space-y-4" onSubmit={handleSaveProduct}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Product Name</label>
              <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} type="text" placeholder="Product name" className="input-premium" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Price ($)</label>
              <input value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} type="number" min="0" step="0.01" placeholder="0.00" className="input-premium" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Stock</label>
              <input value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} type="number" min="0" step="1" className="input-premium" required />
            </div>
          </div>
          <button disabled={isSaving} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProduct ? 'Save Product' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
};

export default Inventory;
