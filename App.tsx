
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

interface DataContextType {
    products: Product[];
    suppliers: Supplier[];
    sales: Sale[];
    customers: Customer[];
    storeSettings: StoreSettings;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    addSale: (cart: CartItem[], paymentType: PaymentType, customerId?: string) => string; // Returns sale ID
    getProductById: (id: string) => Product | undefined;
    getCustomerById: (id: string) => Customer | undefined;
    addCustomer: (customer: Omit<Customer, 'id' | 'totalDebt' | 'transactions'>) => void;
    repayDebt: (customerId: string, amount: number) => void;
    updateStoreSettings: (settings: StoreSettings) => void;
    resetAllData: () => void;
    logout: () => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    navigateToScreen: (screen: Screen) => void;
}

export const DataContext = React.createContext<DataContextType | null>(null);

const DEFAULT_STORE_SETTINGS: StoreSettings = {
    name: 'سوبر ماركت البركة',
    address: 'الرياض - المملكة العربية السعودية',
    phone: '0500000000',
    taxRate: 15,
    footerText: 'شكراً لتسوقكم معنا!'
};

const App: React.FC = () => {
    const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
    const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', INITIAL_SUPPLIERS);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [storeSettings, setStoreSettings] = useLocalStorage<StoreSettings>('storeSettings', DEFAULT_STORE_SETTINGS);
    
    const [activeScreen, setActiveScreen] = useState<Screen>('sales');
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ id: Date.now(), text, type });
    }, []);

    const handleLogin = (password: string): boolean => {
        const CORRECT_PASSWORD = '1234';
        if (password === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            showToast('تم تسجيل الدخول بنجاح');
            return true;
        }
        return false;
    };

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
    }, [setIsAuthenticated]);

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        const newProduct: Product = { ...product, id: `P${Date.now()}` };
        setProducts(prev => [...prev, newProduct]);
        showToast('تم إضافة المنتج بنجاح');
    }, [setProducts, showToast]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        showToast('تم تحديث المنتج');
    }, [setProducts, showToast]);

    const deleteProduct = useCallback((productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('تم حذف المنتج', 'info');
    }, [setProducts, showToast]);

    const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = { ...supplier, id: `S${Date.now()}` };
        setSuppliers(prev => [...prev, newSupplier]);
        showToast('تم إضافة المورد');
    }, [setSuppliers, showToast]);

    const updateSupplier = useCallback((updatedSupplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
        showToast('تم تحديث بيانات المورد');
    }, [setSuppliers, showToast]);

    const deleteSupplier = useCallback((supplierId: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        showToast('تم حذف المورد', 'info');
    }, [setSuppliers, showToast]);

    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'totalDebt' | 'transactions'>) => {
        const newCustomer: Customer = {
            ...customerData,
            id: `C${Date.now()}`,
            totalDebt: 0,
            transactions: []
        };
        setCustomers(prev => [...prev, newCustomer]);
        showToast('تم إضافة العميل بنجاح');
    }, [setCustomers, showToast]);

    const repayDebt = useCallback((customerId: string, amount: number) => {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                const newTransaction: DebtTransaction = {
                    id: `TR${Date.now()}`,
                    date: new Date().toISOString(),
                    amount: amount,
                    type: 'REPAYMENT',
                    note: 'سداد نقدي'
                };
                return {
                    ...c,
                    totalDebt: c.totalDebt - amount,
                    transactions: [...c.transactions, newTransaction]
                };
            }
            return c;
        }));
        showToast('تم تسجيل عملية السداد');
    }, [setCustomers, showToast]);

    const addSale = useCallback((cart: CartItem[], paymentType: PaymentType, customerId?: string) => {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const saleId = `SA${Date.now()}`;
        const newSale: Sale = {
            id: saleId,
            items: cart,
            totalAmount,
            paymentType,
            date: new Date().toISOString(),
            customerId: customerId
        };
        
        setSales(prev => [...prev, newSale]);

        // Update stock
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            cart.forEach(cartItem => {
                const productIndex = updatedProducts.findIndex(p => p.id === cartItem.productId);
                if (productIndex !== -1) {
                    updatedProducts[productIndex].stock -= cartItem.quantity;
                }
            });
            return updatedProducts;
        });

        // If Credit, Update Customer Debt
        if (paymentType === PaymentType.CREDIT && customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    const newTransaction: DebtTransaction = {
                        id: `TR${Date.now()}`,
                        date: new Date().toISOString(),
                        amount: totalAmount,
                        type: 'DEBT',
                        saleId: saleId,
                        note: 'شراء آجل'
                    };
                    return {
                        ...c,
                        totalDebt: c.totalDebt + totalAmount,
                        transactions: [...c.transactions, newTransaction]
                    };
                }
                return c;
            }));
        }

        showToast('تمت عملية البيع بنجاح');
        return saleId;
    }, [setSales, setProducts, setCustomers, showToast]);
    
    const updateStoreSettings = useCallback((settings: StoreSettings) => {
        setStoreSettings(settings);
        showToast('تم حفظ إعدادات المتجر');
    }, [setStoreSettings, showToast]);

    const resetAllData = useCallback(() => {
        setProducts([]);
        setSales([]);
        setCustomers([]);
        setSuppliers([]);
        showToast('تم حذف جميع البيانات بنجاح', 'info');
        setActiveScreen('sales');
    }, [setProducts, setSales, setCustomers, setSuppliers, showToast]);

    const getProductById = useCallback((id: string) => {
        return products.find(p => p.id === id);
    }, [products]);

    const getCustomerById = useCallback((id: string) => {
        return customers.find(c => c.id === id);
    }, [customers]);

    const navigateToScreen = useCallback((screen: Screen) => {
        setActiveScreen(screen);
    }, []);

    const dataContextValue = useMemo(() => ({
        products,
        suppliers,
        sales,
        customers,
        storeSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addSale,
        getProductById,
        getCustomerById,
        addCustomer,
        repayDebt,
        updateStoreSettings,
        resetAllData,
        logout: handleLogout,
        showToast,
        navigateToScreen
    }), [products, suppliers, sales, customers, storeSettings, addProduct, updateProduct, deleteProduct, addSupplier, updateSupplier, deleteSupplier, addSale, getProductById, getCustomerById, addCustomer, repayDebt, updateStoreSettings, resetAllData, handleLogout, showToast, navigateToScreen]);


    const renderScreen = () => {
        switch (activeScreen) {
            case 'sales': return <SalesScreen />;
            case 'inventory': return <InventoryScreen />;
            case 'reports': return <ReportsScreen />;
            case 'suppliers': return <SuppliersScreen />;
            case 'debt': return <DebtScreen />;
            case 'settings': return <SettingsScreen />;
            default: return <SalesScreen />;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <DataContext.Provider value={dataContextValue}>
            <div className="bg-gray-100 min-h-screen font-sans">
                {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
                <main className="pb-20">
                    {renderScreen()}
                </main>
                <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            </div>
        </DataContext.Provider>
    );
};

export default App;