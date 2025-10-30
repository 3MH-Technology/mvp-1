
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Product, CartItem, PaymentType } from '../types';
import { SearchIcon, ShoppingCartIcon } from '../components/Icons';
import Modal from '../components/Modal';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
    <div onClick={() => onAddToCart(product)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105">
        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
        <div className="p-3 text-center">
            <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
            <p className="text-primary-dark font-bold mt-1">{product.price.toFixed(2)} ر.س</p>
        </div>
        <div className="bg-primary-light text-primary-dark text-center py-1">
            <span className="text-xs font-semibold">إضافة للسلة +</span>
        </div>
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
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { productId: product.id, quantity: 1, price: product.price }];
        });
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
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الباركود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 bg-white focus:outline-none focus:border-primary"
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
                <div className="fixed bottom-16 right-0 left-0 bg-primary-dark text-white p-4 shadow-lg flex justify-between items-center">
                    <div className="flex items-center">
                       <ShoppingCartIcon className="w-6 h-6 mr-3" />
                        <div>
                            <span className="font-bold text-lg">{cartTotal.toFixed(2)} ر.س</span>
                            <span className="text-sm block">{cart.reduce((sum, i) => sum + i.quantity, 0)} منتجات</span>
                        </div>
                    </div>
                    <button onClick={() => setCheckoutModalOpen(true)} className="bg-white text-primary-dark font-bold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                        إتمام البيع
                    </button>
                </div>
            )}

            <Modal isOpen={isCheckoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="إتمام عملية البيع">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">المبلغ الإجمالي: <span className="text-primary-dark">{cartTotal.toFixed(2)} ر.س</span></h3>
                    <p className="text-center text-gray-600 mb-6">اختر طريقة الدفع</p>
                    <div className="flex justify-around">
                        <button onClick={() => handleCheckout(PaymentType.CASH)} className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            {PaymentType.CASH}
                        </button>
                        <button onClick={() => handleCheckout(PaymentType.CREDIT)} className="bg-secondary hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            {PaymentType.CREDIT}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesScreen;
