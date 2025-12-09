
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../App';
import { Product } from '../types';
import Modal from '../components/Modal';
import { SearchIcon } from '../components/Icons';

const InventoryForm: React.FC<{
    onSubmit: (product: Omit<Product, 'id' | 'imageUrl'>, id?: string) => void;
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
            });
        } else {
            setFormData({ name: '', price: '', cost: '', stock: '', lowStockThreshold: '5', supplierId: '' });
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
        };
        onSubmit(productData, productToEdit?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="اسم المنتج" required className="w-full p-2 border rounded" />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="سعر البيع" required className="w-full p-2 border rounded" step="0.01" />
                <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="سعر التكلفة" required className="w-full p-2 border rounded" step="0.01" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="الكمية الحالية" required className="w-full p-2 border rounded" />
                <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} placeholder="حد المخزون المنخفض" required className="w-full p-2 border rounded" />
            </div>
            {/* In a real app, this would be a dropdown of suppliers */}
            <input type="text" name="supplierId" value={formData.supplierId} onChange={handleChange} placeholder="معرف المورد (اختياري)" className="w-full p-2 border rounded" />
            <div className="flex justify-end space-x-3 space-x-reverse">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">إلغاء</button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded">{productToEdit ? 'تحديث المنتج' : 'إضافة منتج'}</button>
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

    const handleFormSubmit = (productData: Omit<Product, 'id' | 'imageUrl'>, id?: string) => {
        if (id) {
            // Editing existing product
            context?.updateProduct({ ...productToEdit!, ...productData });
        } else {
            // Adding new product
            context?.addProduct({ ...productData, imageUrl: `https://picsum.photos/seed/${productData.name}/200` });
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
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المخزون</h1>
                <button onClick={handleAddNewClick} className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                    + إضافة منتج
                </button>
            </div>

            <div className="mb-4 relative">
                 <input
                    type="text"
                    placeholder="بحث في المخزون..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
                 <div className="absolute left-3 top-1/2 -translate-y-1/2">
                       <SearchIcon className="w-5 h-5 text-gray-400" />
                 </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">المنتج</th>
                                <th scope="col" className="px-6 py-3">السعر</th>
                                <th scope="col" className="px-6 py-3">التكلفة</th>
                                <th scope="col" className="px-6 py-3">المخزون</th>
                                <th scope="col" className="px-6 py-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => {
                                 const isLowStock = product.stock <= product.lowStockThreshold;
                                 return (
                                    <tr key={product.id} className={`border-b hover:bg-gray-50 transition-colors ${isLowStock ? 'bg-red-50' : 'bg-white'}`}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {product.name}
                                            {isLowStock && <span className="mr-2 text-xs text-red-600 font-bold">(منخفض)</span>}
                                        </th>
                                        <td className="px-6 py-4">{product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{product.cost.toFixed(2)}</td>
                                        <td className={`px-6 py-4 font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>{product.stock}</td>
                                        <td className="px-6 py-4 flex space-x-2 space-x-reverse">
                                            <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900">تعديل</button>
                                            <button onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) context.deleteProduct(product.id) }} className="text-red-600 hover:text-red-900">حذف</button>
                                        </td>
                                    </tr>
                                 );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">لا توجد منتجات مطابقة للبحث</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setProductToEdit(null); }} title={productToEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}>
                 <InventoryForm onSubmit={handleFormSubmit} onClose={() => { setModalOpen(false); setProductToEdit(null); }} productToEdit={productToEdit} />
            </Modal>
        </div>
    );
};

export default InventoryScreen;
