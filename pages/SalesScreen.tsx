
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Product, CartItem, PaymentType, Customer } from '../types';
import { SearchIcon, ShoppingCartIcon, PrinterIcon, UserAddIcon } from '../components/Icons';
import Modal from '../components/Modal';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
    <div onClick={() => onAddToCart(product)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="relative h-36 overflow-hidden bg-gray-100">
            {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            )}
             {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold border-2 border-white px-3 py-1 rounded-md transform -rotate-12">نفذت الكمية</span>
                </div>
            )}
             {product.stock > 0 && product.stock <= product.lowStockThreshold && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    كمية قليلة ({product.stock})
                </div>
            )}
        </div>
        <div className="p-3">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 mb-1">{product.name}</h3>
            <div className="flex justify-between items-center">
                 <p className="text-primary-dark font-bold text-lg">{product.price.toFixed(2)} <span className="text-xs font-normal">ر.س</span></p>
            </div>
        </div>
        <button disabled={product.stock <= 0} className={`w-full py-2 text-sm font-bold flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-primary-light text-primary-dark group-hover:bg-primary group-hover:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-colors`}>
             {product.stock > 0 ? (
                 <>
                    <ShoppingCartIcon className="w-4 h-4" />
                    <span>إضافة</span>
                 </>
             ) : 'غير متوفر'}
        </button>
    </div>
);

const InvoiceModal: React.FC<{ isOpen: boolean; onClose: () => void; saleId: string | null; context: any }> = ({ isOpen, onClose, saleId, context }) => {
    if (!isOpen || !saleId) return null;
    const sale = context.sales.find((s: any) => s.id === saleId);
    if (!sale) return null;
    const settings = context.storeSettings;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="فاتورة ضريبية">
            <div className="p-4" id="invoice-print">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{settings.name}</h2>
                    <p className="text-sm text-gray-500">{settings.address}</p>
                    <p className="text-sm text-gray-500">هاتف: {settings.phone}</p>
                    {settings.vatNumber && <p className="text-sm text-gray-500">الرقم الضريبي: {settings.vatNumber}</p>}
                </div>
                
                <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">رقم الفاتورة:</span>
                        <span className="font-bold">{sale.id}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">التاريخ:</span>
                        <span>{new Date(sale.date).toLocaleDateString('ar-EG')} {new Date(sale.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">طريقة الدفع:</span>
                        <span className="font-bold">{sale.paymentType}</span>
                    </div>
                    {sale.customerId && (
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">العميل:</span>
                            <span className="font-bold">{context.getCustomerById(sale.customerId)?.name || 'غير معروف'}</span>
                        </div>
                    )}
                </div>

                <table className="w-full text-sm text-right mb-4">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-2">المنتج</th>
                            <th className="py-2 text-center">الكمية</th>
                            <th className="py-2">السعر</th>
                            <th className="py-2">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item: CartItem) => {
                            const product = context.getProductById(item.productId);
                            return (
                                <tr key={item.productId} className="border-b border-gray-50">
                                    <td className="py-2">{product?.name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2">{item.price.toFixed(2)}</td>
                                    <td className="py-2 font-bold">{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className="flex justify-between items-center text-xl font-bold border-t border-gray-800 pt-4">
                    <span>الإجمالي الكلي:</span>
                    <span>{sale.totalAmount.toFixed(2)} ر.س</span>
                </div>
                 <div className="text-center text-xs text-gray-400 mt-2">
                    الأسعار تشمل ضريبة القيمة المضافة {settings.taxRate}%
                </div>
                
                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>{settings.footerText}</p>
                </div>
            </div>
            <div className="flex gap-3 mt-4 print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900">
                    <PrinterIcon className="w-5 h-5" />
                    طباعة
                </button>
                <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200">
                    إغلاق
                </button>
            </div>
        </Modal>
    );
};

const CustomerSelectModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (customer: Customer) => void;
    context: any;
}> = ({ isOpen, onClose, onSelect, context }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const filteredCustomers = context.customers.filter((c: Customer) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    const handleAddNew = (e: React.FormEvent) => {
        e.preventDefault();
        context.addCustomer({ name: newCustomerName, phone: newCustomerPhone });
        setNewCustomerName('');
        setNewCustomerPhone('');
        setShowAddForm(false);
        // The new customer will appear in the list, user can select them
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="اختيار عميل للبيع الآجل">
            {!showAddForm ? (
                <div>
                     <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="ابحث عن عميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                         <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
                        {filteredCustomers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">لا يوجد عملاء مطابقين</div>
                        ) : (
                            filteredCustomers.map((c: Customer) => (
                                <div 
                                    key={c.id} 
                                    onClick={() => onSelect(c)}
                                    className="p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-bold">{c.name}</div>
                                        <div className="text-xs text-gray-500">{c.phone}</div>
                                    </div>
                                    {c.totalDebt > 0 && <div className="text-red-500 text-sm font-bold">مدين: {c.totalDebt.toFixed(2)}</div>}
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="w-full py-3 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                        <UserAddIcon className="w-5 h-5" />
                        عميل جديد
                    </button>
                </div>
            ) : (
                <form onSubmit={handleAddNew} className="space-y-4">
                    <input type="text" placeholder="اسم العميل" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <input type="tel" placeholder="رقم الهاتف" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-100 py-3 rounded-lg">إلغاء</button>
                        <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg font-bold">حفظ</button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

const SalesScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [lastSaleId, setLastSaleId] = useState<string | null>(null);

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
                    context?.showToast(`الكمية المتاحة من ${product.name} محدودة (${product.stock})`, 'error');
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
                    
                    if (newQuantity < 1) return item; 
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
    
    const clearCart = () => {
        if (window.confirm('هل أنت متأكد من تفريغ السلة؟')) {
            setCart([]);
            setCheckoutModalOpen(false);
        }
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);
    
    const initiateCheckout = (type: PaymentType) => {
        if (type === PaymentType.CREDIT) {
            setCustomerModalOpen(true);
        } else {
            finalizeSale(type);
        }
    };

    const finalizeSale = (type: PaymentType, customerId?: string) => {
        if (cart.length > 0 && context) {
            const saleId = context.addSale(cart, type, customerId);
            setLastSaleId(saleId);
            setCart([]);
            setCheckoutModalOpen(false);
            setCustomerModalOpen(false);
            setInvoiceModalOpen(true);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        finalizeSale(PaymentType.CREDIT, customer.id);
    };

    if (!context) return <div>Loading...</div>;
    
    return (
        <div className="p-4 min-h-screen pb-24">
             {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-print, #invoice-print * { visibility: visible; }
                    #invoice-print { 
                        position: fixed; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        height: 100%;
                        margin: 0; 
                        padding: 20px; 
                        background: white;
                        z-index: 9999;
                    }
                }
            `}</style>

            <header className="sticky top-0 bg-gray-100 py-3 z-10 -mx-4 px-4 shadow-sm mb-4">
                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الباركود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-none shadow-md bg-white focus:ring-2 focus:ring-primary text-gray-800 placeholder-gray-400 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                       <SearchIcon className="w-6 h-6" />
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
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl font-bold">لم يتم العثور على منتجات</p>
                </div>
            )}
            
            {cart.length > 0 && (
                <div className="fixed bottom-16 right-0 left-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-30">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div onClick={() => setCheckoutModalOpen(true)} className="flex items-center cursor-pointer flex-1">
                            <div className="relative">
                                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/30">
                                    <ShoppingCartIcon className="w-6 h-6" />
                                </div>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                                </span>
                            </div>
                            <div className="mr-4">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">الإجمالي</span>
                                <span className="font-extrabold text-2xl text-gray-800 block leading-none">{cartTotal.toFixed(2)} <span className="text-sm font-normal text-gray-500">ر.س</span></span>
                            </div>
                        </div>
                        <button onClick={() => setCheckoutModalOpen(true)} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95">
                            إتمام البيع
                        </button>
                    </div>
                </div>
            )}

            {/* Sales Checkout Modal */}
            <Modal isOpen={isCheckoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="فاتورة البيع">
                <div className="flex flex-col h-full max-h-[70vh]">
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        {cart.length === 0 ? (
                             <p className="text-center text-gray-500 py-10">السلة فارغة</p>
                        ) : (
                            cart.map(item => {
                                const product = context.getProductById(item.productId);
                                if (!product) return null;
                                return (
                                    <div key={item.productId} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 group">
                                        <div className="flex items-center flex-1">
                                            {product.imageUrl && <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover ml-3 bg-gray-100" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{product.price.toFixed(2)} ر.س / للوحدة</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-r-lg transition-colors">+</button>
                                                <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, -1)} className={`w-8 h-8 flex items-center justify-center rounded-l-lg transition-colors ${item.quantity > 1 ? 'text-gray-600 hover:bg-white' : 'text-gray-300'}`}>-</button>
                                            </div>
                                            
                                            <div className="text-left min-w-[60px]">
                                                <span className="font-bold text-gray-900 block">{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>

                                            <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                            <span>عدد العناصر</span>
                            <span>{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                            <span className="text-lg font-bold text-gray-800">المجموع النهائي</span>
                            <span className="text-2xl font-bold text-primary-dark">{cartTotal.toFixed(2)} ر.س</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <button onClick={() => initiateCheckout(PaymentType.CASH)} className="flex flex-col items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-2 rounded-lg shadow transition-transform active:scale-95">
                                <span className="text-xl">💵</span>
                                <span className="text-xs">نقدي</span>
                            </button>
                            <button onClick={() => initiateCheckout(PaymentType.CARD)} className="flex flex-col items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-2 rounded-lg shadow transition-transform active:scale-95">
                                <span className="text-xl">💳</span>
                                <span className="text-xs">بطاقة</span>
                            </button>
                            <button onClick={() => initiateCheckout(PaymentType.CREDIT)} className="flex flex-col items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-2 rounded-lg shadow transition-transform active:scale-95">
                                 <span className="text-xl">📓</span>
                                 <span className="text-xs">آجل (دين)</span>
                            </button>
                        </div>
                         <button onClick={clearCart} className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            تفريغ السلة وحذف الفاتورة
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Customer Selection Modal for Credit Sales */}
            <CustomerSelectModal 
                isOpen={isCustomerModalOpen} 
                onClose={() => setCustomerModalOpen(false)} 
                onSelect={handleCustomerSelect}
                context={context}
            />

            {/* Invoice Receipt Modal */}
            <InvoiceModal 
                isOpen={isInvoiceModalOpen}
                onClose={() => setInvoiceModalOpen(false)}
                saleId={lastSaleId}
                context={context}
            />
        </div>
    );
};

export default SalesScreen;
