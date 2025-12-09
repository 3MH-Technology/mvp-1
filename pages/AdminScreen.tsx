
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { TrashIcon, ReportsIcon } from '../components/Icons';

const AdminScreen: React.FC = () => {
    const context = useContext(DataContext);

    const { totalProfit, totalInventoryValue, totalDebt } = useMemo(() => {
        if (!context) return { totalProfit: 0, totalInventoryValue: 0, totalDebt: 0 };

        // Calculate Total Profit (Revenue - Cost of Sold Items)
        let revenue = 0;
        let cogs = 0; // Cost of Goods Sold

        context.sales.forEach(sale => {
            revenue += sale.totalAmount;
            sale.items.forEach(item => {
                const product = context.getProductById(item.productId);
                // If product is deleted, we might not find it, ideally store cost in sale item snapshot
                const cost = product ? product.cost : 0; 
                cogs += cost * item.quantity;
            });
        });

        // Calculate Current Inventory Value
        const inventoryValue = context.products.reduce((sum, p) => sum + (p.cost * p.stock), 0);

        // Total Debts
        const debt = context.customers.reduce((sum, c) => sum + c.totalDebt, 0);

        return {
            totalProfit: revenue - cogs,
            totalInventoryValue: inventoryValue,
            totalDebt: debt
        };
    }, [context]);

    const handleResetData = () => {
        if (window.confirm('⚠️ تحذير شديد ⚠️\nهل أنت متأكد من حذف جميع البيانات؟\nسيتم حذف (المنتجات، المبيعات، العملاء، الديون).\nلا يمكن استرجاع البيانات!')) {
            const code = window.prompt('للتأكيد النهائي، اكتب "حذف الكل"');
            if (code === 'حذف الكل') {
                context?.resetAllData();
            }
        }
    };

    if (!context) return <div>Loading...</div>;

    return (
        <div className="p-4 pb-24 bg-gray-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-extrabold text-yellow-500">لوحة المالك 🔒</h1>
                <button onClick={() => context.navigateToScreen('settings')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg">
                    عودة للإعدادات
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-gray-400 font-bold mb-2">صافي الربح الحقيقي</h3>
                    <p className="text-4xl font-bold text-green-400">{totalProfit.toFixed(2)} ر.س</p>
                    <p className="text-xs text-gray-500 mt-2">الإيرادات - تكلفة البضاعة المباعة</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-gray-400 font-bold mb-2">قيمة المخزون الحالي</h3>
                    <p className="text-4xl font-bold text-blue-400">{totalInventoryValue.toFixed(2)} ر.س</p>
                    <p className="text-xs text-gray-500 mt-2">رأس المال المجمد في البضاعة</p>
                </div>

                 <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-gray-400 font-bold mb-2">الديون المستحقة عند العملاء</h3>
                    <p className="text-4xl font-bold text-red-400">{totalDebt.toFixed(2)} ر.س</p>
                </div>
            </div>

            <div className="bg-red-900/30 border border-red-500/30 p-6 rounded-2xl">
                <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                    <TrashIcon className="w-5 h-5" /> منطقة الخطر
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                    هذا الزر يقوم بمسح جميع بيانات التطبيق وإعادته لضبط المصنع. استخدمه فقط إذا كنت تريد البدء من الصفر تماماً.
                </p>
                <button 
                    onClick={handleResetData}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-900/50"
                >
                    FORMAT - حذف جميع البيانات
                </button>
            </div>
        </div>
    );
};

export default AdminScreen;
