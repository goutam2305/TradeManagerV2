
import React from 'react';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuth: (email: string) => void;
  onSwitch: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuth, onSwitch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth('user@tradeflow.com');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-main bg-[radial-gradient(circle_at_2px_2px,#1e293b_1px,transparent_0)] bg-[size:40px_40px]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl">insights</span>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Trade<span className="text-primary">Flow</span></h1>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">PRECISION ANALYTICS FOR MODERN TRADERS</p>
        </div>

        <div className="bg-card-bg border border-border-ui rounded-2xl shadow-2xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-1">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-400 text-sm mb-8">
              {mode === 'login' ? 'Enter your credentials to access your dashboard' : 'Join 10,000+ traders optimizing their flow.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">person</span>
                    <input className="w-full bg-slate-900/50 border border-border-ui rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="John Doe" required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">mail</span>
                  <input type="email" className="w-full bg-slate-900/50 border border-border-ui rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="name@company.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && <a className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest" href="#">Forgot?</a>}
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">lock</span>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-900/50 border border-border-ui rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/10 uppercase tracking-widest">
                {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {mode === 'login' ? 'New to the platform?' : 'Already have an account?'}
            <button onClick={onSwitch} className="text-primary font-bold hover:underline underline-offset-4 ml-1">
              {mode === 'login' ? 'Create an account' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
