
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Customer, DebtTransaction } from '../types';
import Modal from '../components/Modal';
import { SearchIcon, UserAddIcon } from '../components/Icons';

const RepayModal: React.FC<{ isOpen: boolean; onClose: () => void; customer: Customer; onRepay: (amount: number) => void }> = ({ isOpen, onClose, customer, onRepay }) => {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (val > 0) {
            onRepay(val);
            setAmount('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`سداد دين - ${customer.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg mb-4 text-center">
                    <p className="text-sm text-gray-500">إجمالي الدين الحالي</p>
                    <p className="text-2xl font-bold text-red-600">{customer.totalDebt.toFixed(2)} ر.س</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">مبلغ السداد</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-full p-3 border rounded-lg text-lg" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        max={customer.totalDebt}
                        required 
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">تأكيد السداد</button>
            </form>
        </Modal>
    );
};

const CustomerDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; customer: Customer }> = ({ isOpen, onClose, customer }) => {
    if (!isOpen) return null;

    const sortedTransactions = [...customer.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`سجل - ${customer.name}`}>
            <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-right">
                            <th className="p-3">التاريخ</th>
                            <th className="p-3">النوع</th>
                            <th className="p-3">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">لا توجد سجلات</td></tr>
                        ) : (
                            sortedTransactions.map(t => (
                                <tr key={t.id} className="border-b">
                                    <td className="p-3 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'DEBT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {t.type === 'DEBT' ? 'دين (شراء)' : 'سداد'}
                                        </span>
                                    </td>
                                    <td className="p-3 font-bold">{t.amount.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

const DebtScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [repayModalData, setRepayModalData] = useState<{isOpen: boolean, customer: Customer | null}>({isOpen: false, customer: null});
    const [detailsModalData, setDetailsModalData] = useState<{isOpen: boolean, customer: Customer | null}>({isOpen: false, customer: null});

    // Add Customer Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!context?.customers) return [];
        return context.customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.phone.includes(searchTerm)
        ).sort((a, b) => b.totalDebt - a.totalDebt); // Sort by highest debt
    }, [context?.customers, searchTerm]);

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        context?.addCustomer({ name: newName, phone: newPhone });
        setNewName('');
        setNewPhone('');
        setAddModalOpen(false);
    };

    if (!context) return <div>Loading...</div>;

    const totalDebts = context.customers.reduce((sum, c) => sum + c.totalDebt, 0);

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 text-center">
                <h2 className="text-gray-500 font-semibold mb-2">إجمالي الديون المستحقة</h2>
                <p className="text-4xl font-extrabold text-red-500">{totalDebts.toFixed(2)} ر.س</p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">دفتر الديون</h1>
                <button onClick={() => setAddModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white p-2 rounded-xl shadow-lg transition-transform active:scale-95">
                    <UserAddIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="بحث عن عميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                />
                <SearchIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div onClick={() => setDetailsModalData({isOpen: true, customer})} className="cursor-pointer flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-2">
                            <span className={`font-extrabold text-lg ${customer.totalDebt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {customer.totalDebt.toFixed(2)}
                            </span>
                            {customer.totalDebt > 0 && (
                                <button 
                                    onClick={() => setRepayModalData({isOpen: true, customer})}
                                    className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                >
                                    سداد
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredCustomers.length === 0 && (
                     <div className="text-center py-10 opacity-50">
                        <p className="text-lg">لا يوجد عملاء</p>
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="إضافة عميل جديد">
                <form onSubmit={handleAddCustomer} className="space-y-4">
                    <input type="text" placeholder="اسم العميل" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <input type="tel" placeholder="رقم الهاتف" value={newPhone} onChange={e => setNewPhone(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg">حفظ</button>
                </form>
            </Modal>

            {/* Repay Modal */}
            {repayModalData.customer && (
                <RepayModal 
                    isOpen={repayModalData.isOpen} 
                    onClose={() => setRepayModalData({isOpen: false, customer: null})} 
                    customer={repayModalData.customer}
                    onRepay={(amount) => context.repayDebt(repayModalData.customer!.id, amount)}
                />
            )}

             {/* Details Modal */}
             {detailsModalData.customer && (
                <CustomerDetailsModal 
                    isOpen={detailsModalData.isOpen} 
                    onClose={() => setDetailsModalData({isOpen: false, customer: null})} 
                    customer={detailsModalData.customer}
                />
            )}
        </div>
    );
};

export default DebtScreen;
