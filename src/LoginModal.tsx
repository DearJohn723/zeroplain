import React, { useState } from 'react';
import { X, LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from './types';
import * as OpenCC from 'opencc-js';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onGoogleLogin: () => Promise<void>;
  onLocalAdminLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onGoogleLogin,
  onLocalAdminLogin
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = (enText: string, zhText: string) => {
    if (lang === 'tw') {
      return converter(zhText);
    }
    if (lang === 'zh') {
      return zhText;
    }
    return enText;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('localAdmin', 'true');
      onLocalAdminLogin();
      onClose();
    } else {
      setError(t(
        'Invalid username or password.',
        '無效的帳號或密碼。'
      ));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      
      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-cyber-gray border border-cyber-red/30 w-full max-w-md flex flex-col shadow-2xl p-8 cyber-border"
      >
        {/* Tech decorative corner lines */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-red" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-red" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-red" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-red" />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-display text-cyber-red uppercase tracking-widest flex items-center gap-2">
              <LogIn size={20} />
              {t('PORTAL LOGIN', '系統登入')}
            </h2>
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
              {t('AUTHORIZATION REQUIRED', '需要管理員授權')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-cyber-red transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-cyber-red/10 border border-cyber-red/30 p-3 mb-4 flex items-center gap-2 text-xs text-cyber-red font-mono">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">
              {t('USERNAME / EMAIL', '帳號 / 信箱')}
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 p-2.5 text-sm text-white focus:border-cyber-red outline-none transition-colors font-mono"
              placeholder={t('Enter username', '請輸入帳號')}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">
              {t('PASSWORD', '密碼')}
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 p-2.5 text-sm text-white focus:border-cyber-red outline-none transition-colors font-mono"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-cyber-red hover:bg-white text-black font-display font-bold text-xs uppercase tracking-[0.2em] transition-all"
          >
            {t('ACCESS CONTROL', '驗證登入')}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-cyber-gray text-[9px] uppercase tracking-widest text-white/30 font-mono">
            {t('OR', '或')}
          </span>
        </div>

        <button 
          onClick={() => {
            onGoogleLogin().then(() => onClose());
          }}
          className="w-full py-3 border border-white/10 hover:border-cyber-red text-white/80 hover:text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {t('SIGN IN WITH GOOGLE', '使用 GOOGLE 登入')}
        </button>
      </motion.div>
    </div>
  );
};
