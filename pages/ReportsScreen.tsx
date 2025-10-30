import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Sale } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LogoutIcon } from '../components/Icons';

type Timeframe = 'daily' | 'weekly' | 'monthly';

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-md ${colorClass}`}>
        <h4 className="text-sm font-semibold opacity-80">{title}</h4>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
);


const ReportsScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [timeframe, setTimeframe] = useState<Timeframe>('weekly');

    const { filteredSales, totalRevenue, totalCost, totalProfit } = useMemo(() => {
        if (!context) return { filteredSales: [], totalRevenue: 0, totalCost: 0, totalProfit: 0 };
        
        const now = new Date();
        const filteredSales = context.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            switch (timeframe) {
                case 'daily':
                    return saleDate.toDateString() === now.toDateString();
                case 'weekly':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0,0,0,0);
                    return saleDate >= weekStart;
                case 'monthly':
                    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const totalCost = filteredSales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, item) => {
                const product = context.getProductById(item.productId);
                return itemSum + (product ? product.cost * item.quantity : 0);
            }, 0);
        }, 0);

        const totalProfit = totalRevenue - totalCost;

        return { filteredSales, totalRevenue, totalCost, totalProfit };

    }, [context, timeframe]);

    const salesChartData = useMemo(() => {
        // This is a simplified grouping. A real app would use a library like date-fns.
        const groupedSales: { [key: string]: number } = {};
        filteredSales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
            if (!groupedSales[date]) {
                groupedSales[date] = 0;
            }
            groupedSales[date] += sale.totalAmount;
        });
        return Object.keys(groupedSales).map(date => ({ name: date, 'المبيعات': groupedSales[date] })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [filteredSales]);


    if (!context) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">التقارير</h1>
                <button 
                    onClick={context.logout} 
                    className="flex items-center text-sm text-red-600 bg-red-100 hover:bg-red-200 font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                    <LogoutIcon className="w-5 h-5 ml-2" />
                    تسجيل الخروج
                </button>
            </div>


            <div className="flex justify-center bg-gray-200 rounded-full p-1 mb-6">
                <button onClick={() => setTimeframe('daily')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold ${timeframe === 'daily' ? 'bg-white shadow' : ''}`}>يومي</button>
                <button onClick={() => setTimeframe('weekly')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold ${timeframe === 'weekly' ? 'bg-white shadow' : ''}`}>أسبوعي</button>
                <button onClick={() => setTimeframe('monthly')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold ${timeframe === 'monthly' ? 'bg-white shadow' : ''}`}>شهري</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="إجمالي المبيعات" value={`${totalRevenue.toFixed(2)} ر.س`} colorClass="bg-blue-100 text-blue-800" />
                <StatCard title="إجمالي التكلفة" value={`${totalCost.toFixed(2)} ر.س`} colorClass="bg-yellow-100 text-yellow-800" />
                <StatCard title="صافي الربح" value={`${totalProfit.toFixed(2)} ر.س`} colorClass="bg-primary-light text-primary-dark" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold mb-4">أداء المبيعات</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)} ر.س`} />
                        <Legend />
                        <Line type="monotone" dataKey="المبيعات" stroke="#4CAF50" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             {/* Future enhancement: Add BarChart for top selling products */}
        </div>
    );
};

export default ReportsScreen;
