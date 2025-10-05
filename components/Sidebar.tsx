
import React from 'react';
import type { AppView } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { WorkoutIcon } from './icons/WorkoutIcon';
import { DietIcon } from './icons/DietIcon';
import { ProgressIcon } from './icons/ProgressIcon';
import { TargetIcon } from './icons/TargetIcon';
import { UserIcon } from './icons/UserIcon';
import { XIcon } from './icons/XIcon';
import { LogoutIcon } from './icons/LogoutIcon';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    setView: (view: AppView) => void;
    onLogout: () => void;
}

const navItems: { name: AppView; icon: React.FC<any> }[] = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'Workout', icon: WorkoutIcon },
  { name: 'Diet', icon: DietIcon },
  { name: 'Goals', icon: TargetIcon },
  { name: 'Progress', icon: ProgressIcon },
  { name: 'Profile', icon: UserIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, setView, onLogout }) => {

    const handleNavigation = (view: AppView) => {
        setView(view);
        onClose();
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black z-20 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside 
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            >
                <div>
                    <div className="p-4 flex justify-between items-center border-b">
                        <h2 className="text-xl font-bold text-emerald-600">GymMate</h2>
                         <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close menu">
                            <XIcon className="w-6 h-6 text-gray-600"/>
                        </button>
                    </div>
                    <nav className="p-4">
                        <ul>
                            {navItems.map(item => (
                                <li key={item.name}>
                                    <button 
                                        onClick={() => handleNavigation(item.name)}
                                        className="w-full flex items-center space-x-4 p-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                    >
                                        <item.icon className="w-6 h-6"/>
                                        <span className="font-semibold">{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                     <button 
                        onClick={onLogout}
                        className="w-full flex items-center space-x-4 p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogoutIcon className="w-6 h-6"/>
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
