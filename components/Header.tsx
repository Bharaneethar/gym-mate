
import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import type { AppView } from '../App';
import { getProfile } from '../services/api';

interface HeaderProps {
  setView: (view: AppView) => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setView, onMenuClick }) => {
  const [name, setName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchHeaderProfile = async () => {
        const profile = await getProfile();
        setName(profile.name);
        if(profile.avatar_url) setAvatarUrl(profile.avatar_url);
    }
    fetchHeaderProfile();
  }, []);

  return (
    <header className="flex items-center justify-between py-4 px-4 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
      <button 
        className="flex items-center space-x-3 group"
        onClick={() => setView('Profile')}
        aria-label="View Profile"
      >
        <img
          src={avatarUrl || "https://picsum.photos/id/237/200/200"}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-emerald-400 transition-all"
        />
        <h1 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-600">Hi, {name}!</h1>
      </button>
      <button onClick={onMenuClick} className="text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Open menu">
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;
