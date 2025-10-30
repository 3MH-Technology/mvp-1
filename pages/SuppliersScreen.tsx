
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../App';
import { Supplier } from '../types';
import Modal from '../components/Modal';

const SupplierForm: React.FC<{
    onSubmit: (supplier: Omit<Supplier, 'id'>, id?: string) => void;
    onClose: () => void;
    supplierToEdit?: Supplier | null;
}> = ({ onSubmit, onClose, supplierToEdit }) => {
    const [formData, setFormData] = useState({ name: '', phone: '' });

    useEffect(() => {
        if (supplierToEdit) {
            setFormData({ name: supplierToEdit.name, phone: supplierToEdit.phone });
        } else {
            setFormData({ name: '', phone: '' });
        }
    }, [supplierToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, supplierToEdit?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="اسم المورد" required className="w-full p-2 border rounded" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="رقم الهاتف" required className="w-full p-2 border rounded" />
            <div className="flex justify-end space-x-3 space-x-reverse">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">إلغاء</button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded">{supplierToEdit ? 'تحديث' : 'إضافة'}</button>
            </div>
        </form>
    );
};

const SuppliersScreen: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

    const handleFormSubmit = (supplierData: Omit<Supplier, 'id'>, id?: string) => {
        if (id) {
            context?.updateSupplier({ ...supplierToEdit!, ...supplierData });
        } else {
            context?.addSupplier(supplierData);
        }
        setModalOpen(false);
        setSupplierToEdit(null);
    };

    const handleEditClick = (supplier: Supplier) => {
        setSupplierToEdit(supplier);
        setModalOpen(true);
    };
    
    const handleAddNewClick = () => {
        setSupplierToEdit(null);
        setModalOpen(true);
    };

    if (!context) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">إدارة الموردين</h1>
                <button onClick={handleAddNewClick} className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                    + إضافة مورد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {context.suppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                            <p className="text-sm text-gray-600">{supplier.phone}</p>
                        </div>
                        <button onClick={() => handleEditClick(supplier)} className="font-medium text-primary hover:underline">
                            تعديل
                        </button>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setSupplierToEdit(null); }} title={supplierToEdit ? 'تعديل مورد' : 'إضافة مورد جديد'}>
                 <SupplierForm onSubmit={handleFormSubmit} onClose={() => { setModalOpen(false); setSupplierToEdit(null); }} supplierToEdit={supplierToEdit} />
            </Modal>
        </div>
    );
};

export default SuppliersScreen;
