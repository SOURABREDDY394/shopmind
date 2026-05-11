import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  MoreVertical,
  ChevronDown,
  Box,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Modal from '../components/Modal';
import { useBusinessData } from '../context/BusinessDataContext';

const emptyProduct = {
  name: '',
  category: 'Appliances',
  stock: 0,
  price: '',
  cost: '',
};

const Inventory = () => {
  const { products, analytics, addProduct, updateProduct, deleteProduct, exportProducts } = useBusinessData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const itemsPerPage = 5;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    let sortableItems = [...products].filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
      category: product.category,
      stock: product.stock,
      price: product.price,
      cost: product.cost || '',
    });
    setAddModalOpen(true);
  };

  const handleSaveProduct = (event) => {
    event.preventDefault();
    if (!productForm.name.trim()) return;
    setIsAdding(true);
    setTimeout(() => {
      if (editingProduct) {
        updateProduct(editingProduct.id, productForm);
      } else {
        addProduct(productForm);
      }
      setIsAdding(false);
      setAddModalOpen(false);
      setProductForm(emptyProduct);
      setEditingProduct(null);
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Inventory Management</h1>
          <p className="text-[var(--text-muted)] mt-1">Track and manage your product catalog and stock levels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 w-fit px-6 py-3 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Total Inventory</p>
              <p className="text-2xl font-bold text-white">${analytics.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
              <p className="text-2xl font-bold text-white">{analytics.lowStockCount} Items</p>
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
              <p className="text-2xl font-bold text-white">{analytics.categories} Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium p-4 flex flex-col md:flex-row gap-4 border-white/5 bg-[var(--active-bg)] backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search products by name, SKU or category..." 
            className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[var(--text)]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={exportProducts} className="flex items-center gap-2 px-6 py-3 bg-[var(--hover-bg)] border border-white/10 rounded-xl hover:bg-[var(--active-bg)] transition-all text-sm font-semibold text-[var(--text)]">
            <Filter className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[var(--hover-bg)] border border-white/10 rounded-xl hover:bg-[var(--active-bg)] transition-all text-sm font-semibold text-[var(--text)]">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[var(--hover-bg)]">
                <th 
                  className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Product Info
                    {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {sortConfig.key === 'category' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] text-center cursor-pointer hover:text-[var(--text)] transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Stock
                    {sortConfig.key === 'stock' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Price
                    {sortConfig.key === 'price' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[var(--active-bg)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10">
                        <Box className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text)] text-sm">{product.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">SKU-{product.id}00X9</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-3 py-1 bg-[var(--hover-bg)] rounded-full border border-white/10 text-[var(--text-muted)]">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-[var(--text)]">{product.stock}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Units</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-extrabold text-[var(--text)]">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 bg-[var(--hover-bg)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing <span className="text-white font-bold">{Math.min(filteredProducts.length, (currentPage-1)*itemsPerPage + 1)}-{Math.min(filteredProducts.length, currentPage*itemsPerPage)}</span> of <span className="text-white font-bold">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'border border-white/10 hover:bg-white/5'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-white/5 mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">No products found matching your search.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form className="space-y-4" onSubmit={handleSaveProduct}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Product Name</label>
              <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} type="text" placeholder="e.g. Arabica Beans" className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-[var(--text)]" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Category</label>
              <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-[var(--text)]">
                <option>Appliances</option>
                <option>Coffee</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Price ($)</label>
              <input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} type="number" min="0" step="0.01" placeholder="0.00" className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-[var(--text)]" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Stock</label>
              <input value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} type="number" min="0" step="1" className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-[var(--text)]" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Cost ($)</label>
              <input value={productForm.cost} onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })} type="number" min="0" step="0.01" placeholder="0.00" className="w-full bg-[var(--hover-bg)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-[var(--text)]" />
            </div>
          </div>
          <button 
            disabled={isAdding}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProduct ? 'Save Product' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
