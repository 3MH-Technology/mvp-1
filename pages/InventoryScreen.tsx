
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../App';
import { Product } from '../types';
import Modal from '../components/Modal';
import { SearchIcon } from '../components/Icons';

const InventoryForm: React.FC<{
    onSubmit: (product: Omit<Product, 'id'>, id?: string) => void;
    onClose: () => void;
    productToEdit?: Product | null;
}> = ({ onSubmit, onClose, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        cost: '',
        stock: '',
        lowStockThreshold: '',
        supplierId: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                price: productToEdit.price.toString(),
                cost: productToEdit.cost.toString(),
                stock: productToEdit.stock.toString(),
                lowStockThreshold: productToEdit.lowStockThreshold.toString(),
                supplierId: productToEdit.supplierId || '',
                imageUrl: productToEdit.imageUrl || '',
            });
        } else {
            setFormData({ name: '', price: '', cost: '', stock: '', lowStockThreshold: '5', supplierId: '', imageUrl: '' });
        }
    }, [productToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            name: formData.name,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost),
            stock: parseInt(formData.stock, 10),
            lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
            supplierId: formData.supplierId,
            imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/200`
        };
        onSubmit(productData, productToEdit?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="مثال: حليب المراعي" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (اختياري)</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition dir-ltr" style={{direction: 'ltr'}} />
                {formData.imageUrl && (
                    <div className="mt-2 flex justify-center">
                        <img src={formData.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                     <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" step="0.01" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
                     <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="0.00" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" step="0.01" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">الكمية الحالية</label>
                     <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">حد التنبيه</label>
                     <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} placeholder="5" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">المورد (اختياري)</label>
                 <input type="text" name="supplierId" value={formData.supplierId} onChange={handleChange} placeholder="كود المورد" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition">إلغاء</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition shadow-md">{productToEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
            </div>
        </form>
    );
};

const InventoryScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!context?.products) return [];
        return context.products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.includes(searchTerm)
        );
    }, [context?.products, searchTerm]);

    const handleFormSubmit = (productData: Omit<Product, 'id'>, id?: string) => {
        if (id) {
            context?.updateProduct({ ...productToEdit!, ...productData });
        } else {
            context?.addProduct(productData);
        }
        setModalOpen(false);
        setProductToEdit(null);
    };
    
    const handleEditClick = (product: Product) => {
        setProductToEdit(product);
        setModalOpen(true);
    };

    const handleAddNewClick = () => {
        setProductToEdit(null);
        setModalOpen(true);
    };

    if (!context) return <div>Loading...</div>;

    return (
        <div className="p-4 pb-20 bg-gray-50 min-h-screen">
             {/* Header Section */}
             <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-2 -mx-4 px-4 mb-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-800">إدارة المخزون</h1>
                    <button onClick={handleAddNewClick} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center">
                        <span className="text-xl ml-1">+</span> إضافة منتج
                    </button>
                </div>

                <div className="relative shadow-sm rounded-xl">
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-none shadow bg-white focus:ring-2 focus:ring-primary text-gray-700 transition-all outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                     {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4">المنتج</th>
                                <th scope="col" className="px-6 py-4">السعر</th>
                                <th scope="col" className="px-6 py-4">التكلفة</th>
                                <th scope="col" className="px-6 py-4">المخزون</th>
                                <th scope="col" className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(product => {
                                 const isLowStock = product.stock <= product.lowStockThreshold;
                                 return (
                                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isLowStock ? 'bg-red-50/50' : 'bg-white'}`}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                            )}
                                            {isLowStock && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="مخزون منخفض"></span>}
                                            {product.name}
                                        </th>
                                        <td className="px-6 py-4 font-bold text-gray-700">{product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{product.cost.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md font-bold text-xs ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center space-x-3 space-x-reverse">
                                            <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-lg transition-colors">تعديل</button>
                                            <button onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) context.deleteProduct(product.id) }} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                 );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl mb-2">📦</span>
                                            <p>لا توجد منتجات مطابقة للبحث</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setProductToEdit(null); }} title={productToEdit ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}>
                 <InventoryForm onSubmit={handleFormSubmit} onClose={() => { setModalOpen(false); setProductToEdit(null); }} productToEdit={productToEdit} />
            </Modal>
        </div>
    );
};

export default InventoryScreen;
