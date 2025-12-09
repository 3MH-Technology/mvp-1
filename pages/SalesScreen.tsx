
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Product, CartItem, PaymentType } from '../types';
import { SearchIcon, ShoppingCartIcon } from '../components/Icons';
import Modal from '../components/Modal';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
    <div onClick={() => onAddToCart(product)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <div className="relative h-32">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
             {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold transform -rotate-12 border-2 border-white px-2 py-1">نفذت الكمية</span>
                </div>
            )}
        </div>
        <div className="p-3 text-center">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
            <p className="text-primary-dark font-bold mt-1">{product.price.toFixed(2)} ر.س</p>
        </div>
        <button disabled={product.stock <= 0} className={`w-full py-1 text-xs font-semibold ${product.stock > 0 ? 'bg-primary-light text-primary-dark hover:bg-primary hover:text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} transition-colors`}>
             {product.stock > 0 ? 'إضافة للسلة +' : 'غير متوفر'}
        </button>
    </div>
);


const SalesScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!context?.products) return [];
        return context.products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.includes(searchTerm)
        );
    }, [context?.products, searchTerm]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                // Check stock limit
                if (existingItem.quantity >= product.stock) {
                    context?.showToast(`الكمية المتاحة من ${product.name} محدودة`, 'error');
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { productId: product.id, quantity: 1, price: product.price }];
        });
        context?.showToast(`تم إضافة ${product.name}`, 'success');
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.productId === productId) {
                    const product = context?.getProductById(productId);
                    const newQuantity = item.quantity + delta;
                    
                    if (newQuantity < 1) return item; // Can't go below 1 here, use delete button
                    if (product && newQuantity > product.stock) {
                         context?.showToast('لا توجد كمية كافية في المخزون', 'error');
                         return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);
    
    const handleCheckout = (paymentType: PaymentType) => {
        if (cart.length > 0 && context) {
            context.addSale(cart, paymentType);
            setCart([]);
            setCheckoutModalOpen(false);
        }
    };

    if (!context) return <div>Loading...</div>;
    
    return (
        <div className="p-4">
            <header className="sticky top-0 bg-gray-100 py-2 z-10">
                <div className="relative shadow-sm">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الباركود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                       <SearchIcon className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
            </div>
            
            {cart.length > 0 && (
                <div className="fixed bottom-16 right-0 left-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] flex justify-between items-center z-30">
                    <div className="flex items-center cursor-pointer" onClick={() => setCheckoutModalOpen(true)}>
                        <div className="bg-primary-light p-3 rounded-full text-primary-dark mr-3 relative">
                            <ShoppingCartIcon className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cart.reduce((sum, i) => sum + i.quantity, 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">الإجمالي</span>
                            <span className="font-bold text-xl text-gray-800 block">{cartTotal.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                    <button onClick={() => setCheckoutModalOpen(true)} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary-dark transition-all transform hover:scale-105">
                        عرض السلة
                    </button>
                </div>
            )}

            <Modal isOpen={isCheckoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="سلة المشتريات">
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {cart.map(item => {
                         const product = context.getProductById(item.productId);
                         if (!product) return null;
                         return (
                             <div key={item.productId} className="flex justify-between items-center border-b border-gray-100 py-3 last:border-0">
                                 <div className="flex-1">
                                     <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                     <p className="text-sm text-gray-500">{item.price.toFixed(2)} ر.س × {item.quantity}</p>
                                 </div>
                                 <div className="flex items-center space-x-3 space-x-reverse">
                                     <div className="flex items-center bg-gray-100 rounded-lg">
                                         <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-primary-dark hover:bg-gray-200 rounded-r-lg font-bold">+</button>
                                         <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                                         <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-gray-200 rounded-l-lg font-bold disabled:opacity-50">-</button>
                                     </div>
                                     <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                         </svg>
                                     </button>
                                 </div>
                             </div>
                         )
                    })}
                </div>
                
                <div className="border-t-2 border-dashed border-gray-300 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-gray-800">المجموع الكلي</span>
                        <span className="text-2xl font-bold text-primary-dark">{cartTotal.toFixed(2)} ر.س</span>
                    </div>
                    
                    <p className="text-center text-gray-600 mb-4 text-sm">اختر طريقة الدفع لإتمام العملية</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleCheckout(PaymentType.CASH)} className="flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-md">
                            <span className="text-xl mb-1">💵</span>
                            {PaymentType.CASH}
                        </button>
                        <button onClick={() => handleCheckout(PaymentType.CREDIT)} className="flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-md">
                             <span className="text-xl mb-1">💳</span>
                            {PaymentType.CREDIT}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesScreen;
