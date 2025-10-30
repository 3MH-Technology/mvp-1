import React, { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Product, Supplier, Sale, CartItem, PaymentType } from './types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from './constants';
import SalesScreen from './pages/SalesScreen';
import InventoryScreen from './pages/InventoryScreen';
import ReportsScreen from './pages/ReportsScreen';
import SuppliersScreen from './pages/SuppliersScreen';
import BottomNav from './components/BottomNav';
import LoginScreen from './pages/LoginScreen';

type Screen = 'sales' | 'inventory' | 'reports' | 'suppliers';

interface DataContextType {
    products: Product[];
    suppliers: Supplier[];
    sales: Sale[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    addSale: (cart: CartItem[], paymentType: PaymentType) => void;
    getProductById: (id: string) => Product | undefined;
    logout: () => void;
}

export const DataContext = React.createContext<DataContextType | null>(null);

const App: React.FC = () => {
    // Best Practice Note:
    // `useLocalStorage` is used here for a backend-less, persistent local demo.
    // For a real-world application, you would replace these hooks with API calls
    // to a backend service like Firebase, Supabase, or a custom REST API.
    // The functions below (addProduct, addSale, etc.) would become asynchronous
    // functions that `fetch` data from your API.
    const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
    const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', INITIAL_SUPPLIERS);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    const [activeScreen, setActiveScreen] = useState<Screen>('sales');
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);

    const handleLogin = (password: string): boolean => {
        // NOTE: This is a simple, hardcoded password for local use.
        // In a real application, use a secure authentication service.
        const CORRECT_PASSWORD = '1234';
        if (password === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
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
    }, [setProducts]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }, [setProducts]);

    const deleteProduct = useCallback((productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }, [setProducts]);

    const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = { ...supplier, id: `S${Date.now()}` };
        setSuppliers(prev => [...prev, newSupplier]);
    }, [setSuppliers]);

    const updateSupplier = useCallback((updatedSupplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    }, [setSuppliers]);

    const deleteSupplier = useCallback((supplierId: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }, [setSuppliers]);

    const addSale = useCallback((cart: CartItem[], paymentType: PaymentType) => {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newSale: Sale = {
            id: `SA${Date.now()}`,
            items: cart,
            totalAmount,
            paymentType,
            date: new Date().toISOString(),
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
    }, [setSales, setProducts]);
    
    const getProductById = useCallback((id: string) => {
        return products.find(p => p.id === id);
    }, [products]);

    const dataContextValue = useMemo(() => ({
        products,
        suppliers,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addSale,
        getProductById,
        logout: handleLogout,
    }), [products, suppliers, sales, addProduct, updateProduct, deleteProduct, addSupplier, updateSupplier, deleteSupplier, addSale, getProductById, handleLogout]);


    const renderScreen = () => {
        switch (activeScreen) {
            case 'sales': return <SalesScreen />;
            case 'inventory': return <InventoryScreen />;
            case 'reports': return <ReportsScreen />;
            case 'suppliers': return <SuppliersScreen />;
            default: return <SalesScreen />;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <DataContext.Provider value={dataContextValue}>
            <div className="bg-gray-100 min-h-screen font-sans">
                <main className="pb-20">
                    {renderScreen()}
                </main>
                <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            </div>
        </DataContext.Provider>
    );
};

export default App;
