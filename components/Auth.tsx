
import React, { useState } from 'react';
import { loginUser, signupUser } from '../services/api';

interface AuthProps {
    onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let response;
            if (isLogin) {
                response = await loginUser(email, password);
            } else {
                response = await signupUser(email, password);
            }

            if (response.success) {
                onLogin();
            } else {
                setError(response.error || 'An unknown error occurred.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to authenticate.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen p-6">
            <h1 className="text-4xl font-bold text-emerald-600 mb-2">GymMate</h1>
            <p className="text-gray-500 mb-8">Your Personal AI Fitness Coach</p>

            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-emerald-600 hover:text-emerald-500 ml-1">
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;