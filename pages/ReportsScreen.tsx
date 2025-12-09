
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Sale, PaymentType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { LogoutIcon } from '../components/Icons';

type Timeframe = 'daily' | 'weekly' | 'monthly';

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-md ${colorClass} transform transition hover:scale-105`}>
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

    const topSellingData = useMemo(() => {
        const productCounts: {[key: string]: number} = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = context?.getProductById(item.productId);
                const name = product ? product.name : item.productId;
                productCounts[name] = (productCounts[name] || 0) + item.quantity;
            });
        });
        
        return Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredSales, context]);

    const paymentTypeData = useMemo(() => {
        const counts = { [PaymentType.CASH]: 0, [PaymentType.CREDIT]: 0 };
        filteredSales.forEach(sale => {
            if (counts[sale.paymentType] !== undefined) {
                counts[sale.paymentType] += sale.totalAmount;
            }
        });
        return [
            { name: PaymentType.CASH, value: counts[PaymentType.CASH] },
            { name: PaymentType.CREDIT, value: counts[PaymentType.CREDIT] }
        ].filter(i => i.value > 0);
    }, [filteredSales]);

    const COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#FF5722'];


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
                    خروج
                </button>
            </div>


            <div className="flex justify-center bg-gray-200 rounded-full p-1 mb-6">
                <button onClick={() => setTimeframe('daily')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold transition-all ${timeframe === 'daily' ? 'bg-white shadow text-primary-dark' : 'text-gray-600'}`}>يومي</button>
                <button onClick={() => setTimeframe('weekly')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold transition-all ${timeframe === 'weekly' ? 'bg-white shadow text-primary-dark' : 'text-gray-600'}`}>أسبوعي</button>
                <button onClick={() => setTimeframe('monthly')} className={`px-4 py-2 w-full rounded-full text-sm font-semibold transition-all ${timeframe === 'monthly' ? 'bg-white shadow text-primary-dark' : 'text-gray-600'}`}>شهري</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="إجمالي المبيعات" value={`${totalRevenue.toFixed(2)} ر.س`} colorClass="bg-blue-100 text-blue-800" />
                <StatCard title="إجمالي التكلفة" value={`${totalCost.toFixed(2)} ر.س`} colorClass="bg-yellow-100 text-yellow-800" />
                <StatCard title="صافي الربح" value={`${totalProfit.toFixed(2)} ر.س`} colorClass="bg-primary-light text-primary-dark" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md col-span-1 lg:col-span-2">
                    <h3 className="font-bold mb-4 text-gray-700">أداء المبيعات</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} ر.س`} contentStyle={{borderRadius: '8px'}} />
                            <Legend />
                            <Line type="monotone" dataKey="المبيعات" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-bold mb-4 text-gray-700">المنتجات الأكثر مبيعاً (بالكمية)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                         <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee"/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="count" fill="#607D8B" radius={[4, 4, 4, 4]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                 <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-bold mb-4 text-gray-700">توزيع المبيعات (نقدي / آجل)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={paymentTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {paymentTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} ر.س`} />
                            <Legend verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
