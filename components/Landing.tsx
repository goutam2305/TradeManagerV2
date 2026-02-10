
import React from 'react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-background-main selection:bg-primary/30">
      <header className="fixed top-0 w-full z-50 bg-background-main/80 backdrop-blur-md border-b border-border-ui">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">insights</span>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Trade<span className="text-primary">Flow</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#">Features</a>
            <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#">Pricing</a>
            <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-white hover:text-primary transition-colors px-4">Sign In</button>
            <button onClick={onStart} className="bg-primary hover:bg-primary/90 text-background-main text-sm font-bold px-6 py-2.5 rounded-lg transition-all transform hover:scale-105">
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Analytics Now Live
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight mb-6">
              Master Your <span className="text-primary">Trading Flow</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium mb-10 leading-relaxed">
              The ultimate edge for modern traders. Track every execution, analyze performance with institutional-grade metrics, and master your psychological game in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={onStart} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background-main px-10 py-4 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all">
                Get Started for Free
              </button>
              <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-xl font-black text-lg border border-border-ui transition-all">
                View Live Demo
              </button>
            </div>
          </div>
          
          <div className="mt-20 max-w-6xl mx-auto px-6 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full"></div>
            <div className="bg-card-bg border border-border-ui rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <div className="h-12 border-b border-border-ui bg-background-main/50 flex items-center justify-between px-6">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/50"></div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboard Preview</div>
                <div className="w-12"></div>
              </div>
              <div className="p-6 bg-background-main">
                <img src="https://picsum.photos/1200/600" className="rounded-lg opacity-80" alt="Dashboard Preview" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-main">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-card-bg border border-border-ui rounded-2xl hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Every trade is calculated instantly. Get precise metrics on your expectancy and recovery steps.</p>
              </div>
              <div className="group p-8 bg-card-bg border border-border-ui rounded-2xl hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Session Manager</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Optimize your recovery logic. Stay disciplined with automated trade size calculation.</p>
              </div>
              <div className="group p-8 bg-card-bg border border-border-ui rounded-2xl hover:border-danger/50 transition-all">
                <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-danger text-2xl">calculate</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Risk Calculator</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Institutional-grade risk management. Never hit your stop loss limit blindly again.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-ui py-12 bg-background-main">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">insights</span>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Trade<span className="text-primary">Flow</span></h1>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            © 2024 TradeFlow Analytics Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
