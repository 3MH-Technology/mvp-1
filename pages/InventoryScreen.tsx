
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Product } from '../types';
import Modal from '../components/Modal';
import { SearchIcon, TrashIcon } from '../components/Icons';

const InventoryScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const filtered = useMemo(() => {
        if (!context?.products) return [];
        const t = searchTerm.toLowerCase();
        return context.products.filter(p => p.name.toLowerCase().includes(t) || p.barcode?.includes(t));
    }, [context?.products, searchTerm]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = {
            name: fd.get('name') as string,
            barcode: fd.get('barcode') as string,
            price: parseFloat(fd.get('price') as string),
            cost: parseFloat(fd.get('cost') as string),
            stock: parseInt(fd.get('stock') as string),
            lowStockThreshold: parseInt(fd.get('lowStockThreshold') as string),
            imageUrl: fd.get('imageUrl') as string || '',
        };

        if (editProduct) {
            context?.updateProduct({ ...editProduct, ...data });
        } else {
            context?.addProduct(data);
        }
        setModalOpen(false);
        setEditProduct(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-gray-800 underline decoration-primary decoration-4 underline-offset-8">المخزون</h1>
                <button onClick={() => { setEditProduct(null); setModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg">+ إضافة</button>
            </div>

            <div className="relative mb-6">
                <input type="text" placeholder="بحث بالاسم أو الباركود..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary" />
                <SearchIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
                {filtered.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="object-cover w-full h-full" /> : <span>📦</span>}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">{p.name}</h3>
                            <p className="text-xs text-gray-400">Barcode: {p.barcode || '---'}</p>
                            <div className="flex gap-4 mt-1">
                                <span className="text-xs font-bold text-primary">السعر: {p.price}</span>
                                <span className={`text-xs font-bold ${p.stock <= p.lowStockThreshold ? 'text-red-500' : 'text-gray-500'}`}>المخزون: {p.stock}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditProduct(p); setModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg">تعديل</button>
                            <button onClick={() => context?.deleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'تعديل المنتج' : 'إضافة منتج'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input name="name" defaultValue={editProduct?.name} placeholder="اسم المنتج" required className="w-full p-3 border rounded-xl" />
                    <input name="barcode" defaultValue={editProduct?.barcode} placeholder="رقم الباركود" className="w-full p-3 border rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="price" type="number" step="0.01" defaultValue={editProduct?.price} placeholder="سعر البيع" required className="p-3 border rounded-xl" />
                        <input name="cost" type="number" step="0.01" defaultValue={editProduct?.cost} placeholder="سعر التكلفة" required className="p-3 border rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="stock" type="number" defaultValue={editProduct?.stock} placeholder="الكمية المتوفرة" required className="p-3 border rounded-xl" />
                        <input name="lowStockThreshold" type="number" defaultValue={editProduct?.lowStockThreshold ?? 5} placeholder="تنبيه عند نقص" required className="p-3 border rounded-xl" />
                    </div>
                    <input name="imageUrl" defaultValue={editProduct?.imageUrl} placeholder="رابط الصورة (اختياري)" className="w-full p-3 border rounded-xl" />
                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg">حفظ البيانات</button>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryScreen;
