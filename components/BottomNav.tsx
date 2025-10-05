
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { WorkoutIcon } from './icons/WorkoutIcon';
import { DietIcon } from './icons/DietIcon';
import { ProgressIcon } from './icons/ProgressIcon';
import { TargetIcon } from './icons/TargetIcon';
import type { AppView } from '../App';

interface BottomNavProps {
  activeTab: AppView;
  setView: (view: AppView) => void;
}

const navItems: { name: AppView; icon: React.FC<any> }[] = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'Workout', icon: WorkoutIcon },
  { name: 'Diet', icon: DietIcon },
  { name: 'Goals', icon: TargetIcon },
  { name: 'Progress', icon: ProgressIcon },
];

const NavItem: React.FC<{
  item: { name: AppView; icon: React.FC<any> };
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  const colorClass = isActive ? 'text-emerald-500' : 'text-gray-400';
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-1/5 transition-colors"
      aria-label={item.name}
    >
      <Icon className={`w-6 h-6 mb-1 ${colorClass}`} />
      <span className={`text-xs font-medium ${colorClass}`}>{item.name}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={activeTab === item.name}
            onClick={() => setView(item.name)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
