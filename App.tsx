
import React, { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Product, Supplier, Sale, CartItem, PaymentType, Customer, DebtTransaction, StoreSettings, Screen } from './types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from './constants';
import SalesScreen from './pages/SalesScreen';
import InventoryScreen from './pages/InventoryScreen';
import ReportsScreen from './pages/ReportsScreen';
import SuppliersScreen from './pages/SuppliersScreen';
import DebtScreen from './pages/DebtScreen';
import SettingsScreen from './pages/SettingsScreen';
import BottomNav from './components/BottomNav';
import LoginScreen from './pages/LoginScreen';
import Toast from './components/Toast';

interface ToastMessage {
    id: number;
    text: string;
    type: 'success' | 'error' | 'info';
}

const DEFAULT_SETTINGS: StoreSettings = {
    name: 'بقالة الخير',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '0500000000',
    taxRate: 15,
    footerText: 'شكراً لزيارتكم',
    autoPrint: true
};

export const DataContext = React.createContext<any>(null);

const App: React.FC = () => {
    const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
    const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', INITIAL_SUPPLIERS);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [storeSettings, setStoreSettings] = useLocalStorage<StoreSettings>('storeSettings', DEFAULT_SETTINGS);
    
    const [activeScreen, setActiveScreen] = useState<Screen>('sales');
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ id: Date.now(), text, type });
    }, []);

    const handleLogin = (pass: string) => {
        if (pass === '1234') {
            setIsAuthenticated(true);
            showToast('تم تسجيل الدخول بنجاح');
            return true;
        }
        return false;
    };

    const addProduct = (p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: `P${Date.now()}` }]);
    const updateProduct = (p: Product) => setProducts(prev => prev.map(old => old.id === p.id ? p : old));
    const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

    const addSale = useCallback((cart: CartItem[], type: PaymentType, custId?: string) => {
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const saleId = `INV-${Date.now().toString().slice(-6)}`;
        
        const newSale: Sale = { id: saleId, items: cart, totalAmount: total, paymentType: type, date: new Date().toISOString(), customerId: custId };
        setSales(prev => [...prev, newSale]);

        setProducts(prev => prev.map(p => {
            const item = cart.find(ci => ci.productId === p.id);
            return item ? { ...p, stock: p.stock - item.quantity } : p;
        }));

        if (type === PaymentType.CREDIT && custId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === custId || c.name === custId) {
                    const trans: DebtTransaction = { id: `T${Date.now()}`, date: new Date().toISOString(), amount: total, type: 'DEBT', saleId };
                    return { ...c, totalDebt: c.totalDebt + total, transactions: [...c.transactions, trans] };
                }
                return c;
            }));
        }
        return saleId;
    }, [setSales, setProducts, setCustomers]);

    const contextValue = useMemo(() => ({
        products, suppliers, sales, customers, storeSettings,
        addProduct, updateProduct, deleteProduct,
        addSale, getProductById: (id: string) => products.find(p => p.id === id),
        addCustomer: (c: any) => setCustomers(prev => [...prev, { ...c, id: `C${Date.now()}`, totalDebt: 0, transactions: [] }]),
        repayDebt: (id: string, amt: number) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, totalDebt: c.totalDebt - amt, transactions: [...c.transactions, { id: `R${Date.now()}`, date: new Date().toISOString(), amount: amt, type: 'REPAYMENT' }] } : c)),
        updateStoreSettings: setStoreSettings,
        resetAllData: () => { setProducts([]); setSales([]); setCustomers([]); setSuppliers([]); showToast('تم الحذف'); },
        logout: () => setIsAuthenticated(false),
        showToast,
        navigateToScreen: setActiveScreen
    }), [products, suppliers, sales, customers, storeSettings, addSale, showToast]);

    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

    return (
        <DataContext.Provider value={contextValue}>
            <div className="bg-gray-50 min-h-screen font-sans pb-20">
                {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
                <main className="max-w-4xl mx-auto">
                    {activeScreen === 'sales' && <SalesScreen />}
                    {activeScreen === 'inventory' && <InventoryScreen />}
                    {activeScreen === 'reports' && <ReportsScreen />}
                    {activeScreen === 'suppliers' && <SuppliersScreen />}
                    {activeScreen === 'debt' && <DebtScreen />}
                    {activeScreen === 'settings' && <SettingsScreen />}
                </main>
                <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            </div>
        </DataContext.Provider>
    );
};

export default App;
