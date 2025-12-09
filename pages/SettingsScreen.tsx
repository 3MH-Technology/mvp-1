
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../App';
import { LogoutIcon, TrashIcon } from '../components/Icons';

const SettingsScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        vatNumber: '',
        taxRate: 15,
        footerText: ''
    });

    useEffect(() => {
        if (context?.storeSettings) {
            setFormData({
                name: context.storeSettings.name,
                address: context.storeSettings.address,
                phone: context.storeSettings.phone,
                vatNumber: context.storeSettings.vatNumber || '',
                taxRate: context.storeSettings.taxRate,
                footerText: context.storeSettings.footerText || ''
            });
        }
    }, [context?.storeSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        context?.updateStoreSettings({
            ...formData,
            taxRate: Number(formData.taxRate)
        });
    };

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
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6">الإعدادات</h1>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">بيانات المتجر (للفواتير)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="سوبر ماركت البركة" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0500000000" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="الرياض، طريق الملك فهد" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الضريبي (اختياري)</label>
                        <input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="3000..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الضريبة %</label>
                        <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="15" />
                    </div>
                </div>

                <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-1">تذييل الفاتورة (رسالة شكر)</label>
                     <textarea name="footerText" value={formData.footerText} onChange={handleChange} rows={2} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="شكراً لتسوقكم معنا!"></textarea>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-primary/30">
                    حفظ الإعدادات
                </button>
            </form>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                 <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">إجراءات</h2>
                 
                 <div className="space-y-3">
                    <button 
                        type="button" 
                        onClick={context.logout} 
                        className="w-full flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        تسجيل الخروج
                    </button>

                    <button 
                        type="button" 
                        onClick={handleResetData}
                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                        حذف جميع البيانات (Format)
                    </button>
                 </div>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-8">
                الإصدار 1.3.0
            </div>
        </div>
    );
};

export default SettingsScreen;