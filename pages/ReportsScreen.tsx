
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { PaymentType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { PrinterIcon } from '../components/Icons';
import Modal from '../components/Modal';

// Reusing InvoiceModal logic partially or creating a view for it
const InvoiceViewer: React.FC<{ saleId: string; onClose: () => void; context: any }> = ({ saleId, onClose, context }) => {
    const sale = context.sales.find((s: any) => s.id === saleId);
    if (!sale) return null;
    const settings = context.storeSettings;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="عرض الفاتورة">
            <div className="p-4" id="invoice-print-view">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{settings.name}</h2>
                    <p className="text-sm text-gray-500">نسخة فاتورة</p>
                </div>
                <div className="border-b border-gray-200 pb-2 mb-2 text-sm">
                    <p>رقم الفاتورة: <b>{sale.id}</b></p>
                    <p>التاريخ: {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</p>
                    <p>الدفع: {sale.paymentType}</p>
                </div>
                <table className="w-full text-sm text-right mb-4">
                     <thead>
                        <tr className="border-b">
                            <th className="py-1">المنتج</th>
                            <th className="py-1">سعر</th>
                            <th className="py-1">إجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item: any) => {
                             const p = context.getProductById(item.productId);
                             return (
                                 <tr key={item.productId} className="border-b border-gray-50">
                                     <td className="py-2">{p?.name} x{item.quantity}</td>
                                     <td className="py-2">{item.price}</td>
                                     <td className="py-2 font-bold">{(item.price * item.quantity).toFixed(2)}</td>
                                 </tr>
                             );
                        })}
                    </tbody>
                </table>
                 <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>الإجمالي</span>
                    <span>{sale.totalAmount.toFixed(2)}</span>
                </div>
            </div>
             <div className="flex gap-3 mt-4 print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                    <PrinterIcon className="w-5 h-5" /> طباعة
                </button>
                <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">إغلاق</button>
            </div>
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-print-view, #invoice-print-view * { visibility: visible; }
                    #invoice-print-view { 
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
        </Modal>
    );
};

type Timeframe = 'daily' | 'weekly' | 'monthly';

const StatCard: React.FC<{ title: string; value: string; colorClass: string; icon?: string }> = ({ title, value, colorClass, icon }) => (
    <div className={`p-5 rounded-2xl shadow-sm border border-gray-100 bg-white flex items-center justify-between transform transition hover:scale-105 duration-200`}>
        <div>
             <h4 className="text-gray-500 text-sm font-semibold mb-1">{title}</h4>
             <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        {icon && <div className="text-3xl opacity-20">{icon}</div>}
    </div>
);


const ReportsScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
    const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

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

    // Data for Sales Trend Line Chart
    const salesChartData = useMemo(() => {
        const groupedSales: { [key: string]: number } = {};
        // Initialize with 0 for better chart look based on timeframe could be added here
        filteredSales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
            if (!groupedSales[date]) {
                groupedSales[date] = 0;
            }
            groupedSales[date] += sale.totalAmount;
        });
        return Object.keys(groupedSales).map(date => ({ name: date, 'المبيعات': groupedSales[date] })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [filteredSales]);

    // Data for Top Selling Products Bar Chart
    const topSellingData = useMemo(() => {
        const productCounts: {[key: string]: number} = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = context?.getProductById(item.productId);
                const name = product ? product.name : 'منتج محذوف';
                productCounts[name] = (productCounts[name] || 0) + item.quantity;
            });
        });
        
        return Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredSales, context]);

    // Data for Payment Type Pie Chart
    const paymentTypeData = useMemo(() => {
        const counts = { [PaymentType.CASH]: 0, [PaymentType.CREDIT]: 0, [PaymentType.CARD]: 0 };
        filteredSales.forEach(sale => {
            if (counts[sale.paymentType] !== undefined) {
                counts[sale.paymentType] += sale.totalAmount;
            }
        });
        const data = [
            { name: PaymentType.CASH, value: counts[PaymentType.CASH] },
            { name: PaymentType.CREDIT, value: counts[PaymentType.CREDIT] },
            { name: PaymentType.CARD, value: counts[PaymentType.CARD] }
        ].filter(i => i.value > 0);
        return data.length ? data : [{name: 'لا توجد بيانات', value: 1}];
    }, [filteredSales]);

    const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];


    if (!context) return <div>Loading...</div>;

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-20">
            {viewInvoiceId && <InvoiceViewer saleId={viewInvoiceId} onClose={() => setViewInvoiceId(null)} context={context} />}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-800">التقارير المالية</h1>
                    <p className="text-gray-500 text-sm">نظرة عامة على أداء المتجر</p>
                </div>
            </div>

            <div className="flex justify-center bg-white p-1.5 rounded-2xl shadow-sm mb-8 max-w-md mx-auto border border-gray-100">
                <button onClick={() => setTimeframe('daily')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${timeframe === 'daily' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>يومي</button>
                <button onClick={() => setTimeframe('weekly')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${timeframe === 'weekly' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>أسبوعي</button>
                <button onClick={() => setTimeframe('monthly')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${timeframe === 'monthly' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>شهري</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard title="إجمالي المبيعات" value={`${totalRevenue.toFixed(2)} ر.س`} colorClass="text-blue-600" icon="💰" />
                <StatCard title="إجمالي التكلفة" value={`${totalCost.toFixed(2)} ر.س`} colorClass="text-orange-600" icon="📦" />
                <StatCard title="صافي الربح" value={`${totalProfit.toFixed(2)} ر.س`} colorClass="text-green-600" icon="📈" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg ml-2">📊</span>
                        نمو المبيعات
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fontSize: 12, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: 'none'}} 
                                    formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'المبيعات']}
                                />
                                <Line type="monotone" dataKey="المبيعات" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg ml-2">🏆</span>
                        الأكثر مبيعاً (بالكمية)
                    </h3>
                    <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={topSellingData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6"/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#4B5563'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="count" fill="#607D8B" radius={[0, 4, 4, 0]}>
                                    {topSellingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Payment Type Distribution */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-green-100 text-green-600 p-1.5 rounded-lg ml-2">💳</span>
                        طرق الدفع
                    </h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ر.س`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Recent Sales / Invoices List */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 mt-2">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-gray-100 text-gray-600 p-1.5 rounded-lg ml-2">🧾</span>
                        أحدث الفواتير
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500">
                                    <th className="py-2">رقم الفاتورة</th>
                                    <th className="py-2">التاريخ</th>
                                    <th className="py-2">المبلغ</th>
                                    <th className="py-2">الدفع</th>
                                    <th className="py-2">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {context.sales.slice().reverse().slice(0, 5).map(sale => (
                                    <tr key={sale.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium">{sale.id}</td>
                                        <td className="py-3 text-gray-500">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="py-3 font-bold">{sale.totalAmount.toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{sale.paymentType}</span>
                                        </td>
                                        <td className="py-3">
                                            <button onClick={() => setViewInvoiceId(sale.id)} className="text-primary hover:text-primary-dark font-bold text-xs">عرض</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
