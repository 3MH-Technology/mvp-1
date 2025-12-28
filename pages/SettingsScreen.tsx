
import React, { useState, useContext } from 'react';
import { DataContext } from '../App';
import { LogoutIcon, TrashIcon, SettingsIcon } from '../components/Icons';

const SettingsScreen: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const { storeSettings, updateStoreSettings, resetAllData, logout } = context;

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        updateStoreSettings({
            name: fd.get('name') as string,
            address: fd.get('address') as string,
            phone: fd.get('phone') as string,
            vatNumber: fd.get('vatNumber') as string,
            taxRate: parseFloat(fd.get('taxRate') as string),
            footerText: fd.get('footerText') as string,
            autoPrint: fd.get('autoPrint') === 'on'
        });
        context.showToast('تم حفظ الإعدادات');
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-black text-gray-800">إعدادات النظام</h1>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">اسم المتجر</label>
                    <input name="name" defaultValue={storeSettings.name} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 mr-2">العنوان</label>
                        <input name="address" defaultValue={storeSettings.address} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 mr-2">رقم التواصل</label>
                        <input name="phone" defaultValue={storeSettings.phone} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 mr-2">الرقم الضريبي</label>
                        <input name="vatNumber" defaultValue={storeSettings.vatNumber} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 mr-2">نسبة الضريبة (%)</label>
                        <input name="taxRate" type="number" defaultValue={storeSettings.taxRate} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رسالة أسفل الفاتورة</label>
                    <textarea name="footerText" defaultValue={storeSettings.footerText} className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary" rows={2} />
                </div>
                
                <label className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl cursor-pointer">
                    <input type="checkbox" name="autoPrint" defaultChecked={storeSettings.autoPrint} className="w-5 h-5 rounded border-primary text-primary focus:ring-primary" />
                    <span className="font-bold text-primary-dark">طباعة الفاتورة تلقائياً بعد البيع</span>
                </label>

                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">حفظ جميع التغييرات</button>
            </form>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-800 mb-2">إجراءات إضافية</h3>
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold">
                    <LogoutIcon className="w-5 h-5" /> تسجيل الخروج
                </button>
                <button onClick={() => { if(confirm('⚠️ هل أنت متأكد؟ سيتم مسح كل شيء!')) resetAllData(); }} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold">
                    <TrashIcon className="w-5 h-5" /> تصفير بيانات النظام (Format)
                </button>
            </div>
            
            <p className="text-center text-gray-400 text-[10px]">نظام محاسبة البقالة الذكي - الإصدار 2.0.0</p>
        </div>
    );
};

export default SettingsScreen;
