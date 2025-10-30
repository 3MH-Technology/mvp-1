import React, { useState } from 'react';
import { CashRegisterIcon } from '../components/Icons';

interface LoginScreenProps {
  onLogin: (password: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const loginSuccess = onLogin(password);
    if (!loginSuccess) {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <div className="inline-block p-3 bg-primary-light rounded-full mb-4">
                <CashRegisterIcon className="w-10 h-10 text-primary-dark" />
            </div>
          <h1 className="text-3xl font-bold text-gray-800">نظام محاسبة البقالة</h1>
          <p className="mt-2 text-gray-500">الرجاء إدخال كلمة المرور للمتابعة</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-lg text-center border-2 border-gray-200 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-300"
            >
              دخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
