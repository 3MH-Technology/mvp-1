
import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { DataContext } from '../App';
import { Product, CartItem, PaymentType, Customer } from '../types';
import { SearchIcon, ShoppingCartIcon, PrinterIcon, UserAddIcon, TrashIcon } from '../components/Icons';
import Modal from '../components/Modal';

const InvoicePrint: React.FC<{ saleId: string; context: any }> = ({ saleId, context }) => {
    const sale = context.sales.find((s: any) => s.id === saleId);
    if (!sale) return null;
    const settings = context.storeSettings;

    return (
        <div id="print-area" className="hidden print:block p-4 text-black bg-white w-full max-w-[80mm] mx-auto text-[12px] font-sans leading-relaxed">
            <div className="text-center border-b-2 border-black pb-2 mb-2">
                <h2 className="text-lg font-bold uppercase">{settings.name}</h2>
                <p>{settings.address}</p>
                <p>هاتف: {settings.phone}</p>
                {settings.vatNumber && <p>الرقم الضريبي: {settings.vatNumber}</p>}
            </div>
            
            <div className="mb-2 text-[10px]">
                <div className="flex justify-between"><span>رقم الفاتورة:</span> <span className="font-bold">{sale.id}</span></div>
                <div className="flex justify-between"><span>التاريخ:</span> <span>{new Date(sale.date).toLocaleString('ar-EG')}</span></div>
                <div className="flex justify-between"><span>طريقة الدفع:</span> <span>{sale.paymentType}</span></div>
            </div>

            <table className="w-full mb-2 border-b border-gray-300">
                <thead className="border-b border-black">
                    <tr className="text-right">
                        <th className="py-1">الصنف</th>
                        <th className="py-1 text-center">ك</th>
                        <th className="py-1 text-left">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item: CartItem) => {
                        const product = context.getProductById(item.productId);
                        return (
                            <tr key={item.productId} className="border-b border-gray-100 last:border-0">
                                <td className="py-1">{product?.name}</td>
                                <td className="py-1 text-center">{item.quantity}</td>
                                <td className="py-1 text-left">{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="space-y-1 font-bold">
                <div className="flex justify-between"><span>المجموع:</span> <span>{sale.totalAmount.toFixed(2)} ر.س</span></div>
                <div className="flex justify-between text-[10px]"><span>شامل الضريبة ({settings.taxRate}%):</span> <span>{(sale.totalAmount * settings.taxRate / (100 + settings.taxRate)).toFixed(2)} ر.س</span></div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-black text-center text-[10px]">
                <p>{settings.footerText}</p>
                <p className="mt-1">نظام المحاسبة الذكي</p>
            </div>
        </div>
    );
};

const SalesScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSaleId, setLastSaleId] = useState<string | null>(null);

    const filteredProducts = useMemo(() => {
        if (!context?.products) return [];
        const term = searchTerm.toLowerCase();
        return context.products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.barcode?.includes(term) ||
            p.id.includes(term)
        );
    }, [context?.products, searchTerm]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    context?.showToast('عذراً، نفذت الكمية', 'error');
                    return prev;
                }
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, quantity: 1, price: product.price }];
        });
    };

    const handleSale = (type: PaymentType, customerId?: string) => {
        if (!context || cart.length === 0) return;
        const id = context.addSale(cart, type, customerId);
        setLastSaleId(id);
        setCart([]);
        setCheckoutOpen(false);
        setShowReceipt(true);
        
        if (context.storeSettings.autoPrint) {
            setTimeout(() => window.print(), 500);
        }
    };

    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    return (
        <div className="p-4 safe-area-inset">
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #print-area { display: block !important; }
                }
            `}</style>
            
            {lastSaleId && <InvoicePrint saleId={lastSaleId} context={context} />}

            <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-20 flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="باركود أو اسم المنتج..."
                        className="w-full pr-10 pl-4 py-3 rounded-2xl border-none shadow-md focus:ring-2 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <SearchIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                {cart.length > 0 && (
                    <button onClick={() => setCheckoutOpen(true)} className="bg-primary text-white p-3 rounded-2xl shadow-lg relative">
                        <ShoppingCartIcon className="w-6 h-6" />
                        <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} className={`bg-white p-3 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform relative ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="aspect-square bg-gray-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="object-cover w-full h-full" /> : <span className="text-2xl">📦</span>}
                        </div>
                        <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
                        <p className="text-primary font-black">{p.price.toFixed(2)} <span className="text-[10px]">ر.س</span></p>
                        {p.stock <= 5 && p.stock > 0 && <span className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] px-1.5 rounded-full">بقي {p.stock}</span>}
                    </div>
                ))}
            </div>

            <Modal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} title="إتمام الفاتورة">
                <div className="space-y-4">
                    <div className="max-h-[40vh] overflow-y-auto space-y-2">
                        {cart.map(item => {
                            const p = context?.getProductById(item.productId);
                            return (
                                <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{p?.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCart(c => c.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} className="w-8 h-8 rounded-lg bg-gray-200">-</button>
                                        <button onClick={() => setCart(c => c.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))} className="w-8 h-8 rounded-lg bg-gray-200">+</button>
                                        <button onClick={() => setCart(c => c.filter(i => i.productId !== item.productId))} className="text-red-500 mr-2"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <div className="flex justify-between items-center font-black text-xl text-primary-dark">
                            <span>الإجمالي:</span>
                            <span>{cartTotal.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button onClick={() => handleSale(PaymentType.CASH)} className="bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center">💵<span>كاش</span></button>
                        <button onClick={() => handleSale(PaymentType.CARD)} className="bg-blue-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center">💳<span>بطاقة</span></button>
                    </div>
                    <button onClick={() => {
                        const custId = prompt('اسم أو رقم جوال العميل للبيع الآجل:');
                        if(custId) handleSale(PaymentType.CREDIT, custId);
                    }} className="w-full bg-gray-800 text-white py-3 rounded-2xl font-bold mt-2">📓 بيع آجل (دين)</button>
                </div>
            </Modal>

            <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="تمت العملية">
                <div className="text-center space-y-4 py-4">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
                    <p className="font-bold text-xl">تم حفظ الفاتورة بنجاح</p>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <PrinterIcon className="w-5 h-5" /> طباعة
                        </button>
                        <button onClick={() => setShowReceipt(false)} className="flex-1 bg-gray-100 py-3 rounded-xl">إغلاق</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesScreen;
