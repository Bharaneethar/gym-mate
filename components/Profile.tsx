
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import type { UserProfile } from '../types';
import { UserIcon } from './icons/UserIcon';

const ProfileTextInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; placeholder?: string }> = ({ label, value, onChange, name, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <input
                type="text"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={placeholder}
            />
        </div>
    </div>
);


const ProfileInput: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; unit?: string }> = ({ label, value, onChange, name, unit }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full pr-12 pl-4 py-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
            />
            {unit && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{unit}</span>
                </div>
            )}
        </div>
    </div>
);

const Profile: React.FC<{ onProfileUpdate: (profile: UserProfile) => void }> = ({ onProfileUpdate }) => {
    const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const data = await getUserProfile();
            setEditableProfile(data);
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!editableProfile) return;

        if (name in editableProfile.prs) {
            setEditableProfile({
                ...editableProfile,
                prs: { ...editableProfile.prs, [name]: Number(value) }
            });
        } else if (name === 'name' || name === 'avatar_url') {
            setEditableProfile({
                ...editableProfile,
                [name]: value
            });
        }
         else {
            setEditableProfile({
                ...editableProfile,
                [name]: Number(value)
            });
        }
    };

    const handleSave = async () => {
        if (!editableProfile) return;
        setIsSaving(true);
        const updatedProfile = await updateUserProfile(editableProfile);
        setEditableProfile(updatedProfile);
        onProfileUpdate(updatedProfile);
        setIsSaving(false);
        alert("Profile updated!");
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading profile...</div>;
    }

    if (!editableProfile) {
        return <div className="p-4 text-center">Could not load profile.</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <img src={editableProfile.avatar_url || "https://picsum.photos/id/237/200/200"} alt="User Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-200" />
                <h1 className="text-2xl font-bold text-gray-800">{editableProfile.name}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <UserIcon className="w-6 h-6 text-emerald-600" />
                    <span>Edit Your Profile</span>
                </h2>
                <ProfileTextInput label="Name" name="name" value={editableProfile.name} onChange={handleChange} placeholder="Your Name" />
                <ProfileTextInput label="Photo URL" name="avatar_url" value={editableProfile.avatar_url || ''} onChange={handleChange} placeholder="https://..." />
                <div className="grid grid-cols-2 gap-4">
                    <ProfileInput label="Height" name="height" value={editableProfile.height} onChange={handleChange} unit="cm" />
                    <ProfileInput label="Weight" name="weight" value={editableProfile.weight} onChange={handleChange} unit="kg" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Personal Records (1RM)</h2>
                <div className="space-y-4">
                     <ProfileInput label="Bench Press" name="bench" value={editableProfile.prs.bench} onChange={handleChange} unit="kg" />
                     <ProfileInput label="Squat" name="squat" value={editableProfile.prs.squat} onChange={handleChange} unit="kg" />
                     <ProfileInput label="Deadlift" name="deadlift" value={editableProfile.prs.deadlift} onChange={handleChange} unit="kg" />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
};

export default Profile;