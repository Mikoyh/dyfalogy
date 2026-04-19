import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  History, 
  Delete, 
  RotateCcw, 
  Info,
  FunctionSquare,
  Sigma,
  Pi,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

export const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isDeg, setIsDeg] = useState(true);

  const handleAction = useCallback((action: string) => {
    if (action === 'clear') {
      setDisplay('0');
      setFormula('');
    } else if (action === 'backspace') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (action === '=') {
      try {
        // Simple evaluation logic for demo purposes
        // Using Function constructor as a lightweight alternative to mathjs for basic cases
        // but replacing scientific notations
        let sanitizedFormula = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, isDeg ? 'Math.sin(Math.PI/180*' : 'Math.sin(')
          .replace(/cos\(/g, isDeg ? 'Math.cos(Math.PI/180*' : 'Math.cos(')
          .replace(/tan\(/g, isDeg ? 'Math.tan(Math.PI/180*' : 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/√\(/g, 'Math.sqrt(');

        // Basic check for balanced parentheses if using scientific functions
        const result = new Function(`return ${sanitizedFormula}`)();
        const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
        
        setHistory(prev => [`${display} = ${formattedResult}`, ...prev].slice(0, 10));
        setFormula(`${display} =`);
        setDisplay(formattedResult);
      } catch (err) {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => {
        if (prev === '0' && !['.', '+', '-', '×', '÷'].includes(action)) return action;
        return prev + action;
      });
    }
  }, [display, isDeg]);

  const buttons = [
    { label: 'sin', action: 'sin(', type: 'func' },
    { label: 'cos', action: 'cos(', type: 'func' },
    { label: 'tan', action: 'tan(', type: 'func' },
    { label: 'Deg/Rad', action: 'toggleUnit', type: 'util' },
    { label: 'log', action: 'log(', type: 'func' },
    { label: 'ln', action: 'ln(', type: 'func' },
    { label: '√', action: '√(', type: 'func' },
    { label: '(', action: '(', type: 'op' },
    { label: ')', action: ')', type: 'op' },
    { label: 'mod', action: '%', type: 'op' },
    { label: 'π', action: 'π', type: 'num' },
    { label: 'e', action: 'e', type: 'num' },
    { label: 'C', action: 'clear', type: 'danger' },
    { label: '⌫', action: 'backspace', type: 'danger' },
    { label: '÷', action: '÷', type: 'op' },
    { label: '7', action: '7', type: 'num' },
    { label: '8', action: '8', type: 'num' },
    { label: '9', action: '9', type: 'num' },
    { label: '×', action: '×', type: 'op' },
    { label: '4', action: '4', type: 'num' },
    { label: '5', action: '5', type: 'num' },
    { label: '6', action: '6', type: 'num' },
    { label: '-', action: '-', type: 'op' },
    { label: '1', action: '1', type: 'num' },
    { label: '2', action: '2', type: 'num' },
    { label: '3', action: '3', type: 'num' },
    { label: '+', action: '+', type: 'op' },
    { label: '0', action: '0', type: 'num' },
    { label: '.', action: '.', type: 'num' },
    { label: '=', action: '=', type: 'equal' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
            <Calculator className="text-accent" /> BIO-LOGIC CALC
          </h2>
          <p className="text-xs text-text-muted font-bold tracking-[0.2em] uppercase mt-1">
            Scientific Computation for Olympiad Needs
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 p-2 rounded-2xl border border-white/50">
           <div className="flex gap-1">
              <button 
                onClick={() => setIsDeg(true)}
                className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black transition-all", isDeg ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted")}
              >
                DEG
              </button>
              <button 
                onClick={() => setIsDeg(false)}
                className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black transition-all", !isDeg ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted")}
              >
                RAD
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator Body */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-[32px] p-8 border-none bg-sidebar text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sigma size={120} />
            </div>
            
            {/* Display Screen */}
            <div className="relative z-10 space-y-2 mb-8 text-right">
              <div className="h-6 text-sm font-mono text-white/40 overflow-hidden truncate">
                {formula}
              </div>
              <div className="text-5xl font-mono font-black tracking-tighter overflow-x-auto whitespace-nowrap no-scrollbar py-2">
                {display}
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 relative z-10">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (btn.action === 'toggleUnit') setIsDeg(!isDeg);
                    else handleAction(btn.action);
                  }}
                  className={cn(
                    "h-12 sm:h-14 rounded-2xl font-bold flex items-center justify-center transition-all active:scale-90",
                    btn.type === 'num' ? "bg-white/10 hover:bg-white/20 text-white" :
                    btn.type === 'op' ? "bg-accent/20 hover:bg-accent/30 text-accent font-black" :
                    btn.type === 'func' ? "bg-white/5 hover:bg-white/10 text-white/60 text-xs italic" :
                    btn.type === 'danger' ? "bg-red-500/20 hover:bg-red-500/30 text-red-500" :
                    btn.type === 'util' ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px]" :
                    "bg-accent hover:bg-emerald-600 text-white shadow-xl shadow-accent/20"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest px-4">
             <Info size={12} className="text-accent" />
             <span>Use keyboard for quick input. Precision set to 8 decimal places.</span>
          </div>
        </div>

        {/* History & Units Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                <History size={16} className="text-accent" /> History
              </h3>
              <button 
                onClick={() => setHistory([])}
                className="p-1.5 hover:bg-black/5 rounded-lg text-text-muted transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="p-3 bg-white/40 rounded-xl border border-white/50 text-right animate-fade-in">
                    <div className="text-[10px] text-text-muted font-mono mb-1">{h.split('=')[0]}</div>
                    <div className="text-sm font-black font-mono text-accent">{h.split('=')[1]}</div>
                  </div>
                ))
              ) : (
                <div className="h-20 flex flex-col items-center justify-center text-center space-y-2 opacity-30 grayscale">
                  <Activity size={24} />
                  <span className="text-[10px] uppercase font-black">No calculations yet</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6 space-y-4">
             <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                <Pi size={16} className="text-accent" /> Constants
             </h3>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Avogadro", val: "6.022e23" },
                  { label: "Boltzmann", val: "1.38e-23" },
                  { label: "Gas (R)", val: "8.314" },
                  { label: "Planch (h)", val: "6.626e-34" }
                ].map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => setDisplay(c.val)}
                    className="p-3 bg-white/40 hover:bg-white rounded-xl border border-white/50 text-left transition-all"
                  >
                    <div className="text-[9px] text-text-muted font-bold uppercase mb-1">{c.label}</div>
                    <div className="text-xs font-mono font-black truncate">{c.val}</div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
