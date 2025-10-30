
import React from 'react';
import { CashRegisterIcon, InventoryIcon, ReportsIcon, SuppliersIcon } from './Icons';

type Screen = 'sales' | 'inventory' | 'reports' | 'suppliers';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-primary-dark';
  const inactiveClasses = 'text-gray-500';

  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <div className="fixed bottom-0 right-0 left-0 bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.05)] h-16 flex justify-around items-center z-40">
      <NavItem
        label="المبيعات"
        icon={<CashRegisterIcon className="w-6 h-6" />}
        isActive={activeScreen === 'sales'}
        onClick={() => setActiveScreen('sales')}
      />
      <NavItem
        label="المخزون"
        icon={<InventoryIcon className="w-6 h-6" />}
        isActive={activeScreen === 'inventory'}
        onClick={() => setActiveScreen('inventory')}
      />
      <NavItem
        label="التقارير"
        icon={<ReportsIcon className="w-6 h-6" />}
        isActive={activeScreen === 'reports'}
        onClick={() => setActiveScreen('reports')}
      />
       <NavItem
        label="الموردين"
        icon={<SuppliersIcon className="w-6 h-6" />}
        isActive={activeScreen === 'suppliers'}
        onClick={() => setActiveScreen('suppliers')}
      />
    </div>
  );
};

export default BottomNav;
