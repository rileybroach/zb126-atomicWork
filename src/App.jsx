import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Key, Printer, RotateCcw, Award, LayoutList, Layers, Minus, Plus, Check, X
} from 'lucide-react';

const MODULES = [
  {
    id: 'g1', group: 'Group 1', name: 'Alkali Metals', element: 'Sodium (Na)', atomicNum: 11, mass: 23,
    neutralConfig: '1s2 2s2 2p6 3s1', ionConfig: '1s2 2s2 2p6', targetCharge: '+1', symbol: 'Na+',
    questions: [
      { id: 'g1_p', label: 'Protons', answer: '11' },
      { id: 'g1_n', label: 'Neutrons', answer: '12' },
      { id: 'g1_e', label: 'Electrons (Ion)', answer: '10' },
      { id: 'g1_c', label: 'Net Charge', answer: '+1' },
      { id: 'g1_s', label: 'Ion Symbol', answer: 'Na+' },
    ]
  },
  {
    id: 'g2', group: 'Group 2', name: 'Alkaline Earth Metals', element: 'Magnesium (Mg)', atomicNum: 12, mass: 24,
    neutralConfig: '1s2 2s2 2p6 3s2', ionConfig: '1s2 2s2 2p6', targetCharge: '+2', symbol: 'Mg2+',
    questions: [
      { id: 'g2_p', label: 'Protons', answer: '12' },
      { id: 'g2_n', label: 'Neutrons', answer: '12' },
      { id: 'g2_e', label: 'Electrons (Ion)', answer: '10' },
      { id: 'g2_c', label: 'Net Charge', answer: '+2' },
      { id: 'g2_s', label: 'Ion Symbol', answer: 'Mg2+' },
    ]
  },
  {
    id: 'g13', group: 'Group 13', name: 'Boron Group (Metals)', element: 'Aluminum (Al)', atomicNum: 13, mass: 27,
    neutralConfig: '1s2 2s2 2p6 3s2 3p1', ionConfig: '1s2 2s2 2p6', targetCharge: '+3', symbol: 'Al3+',
    questions: [
      { id: 'g13_p', label: 'Protons', answer: '13' },
      { id: 'g13_n', label: 'Neutrons', answer: '14' },
      { id: 'g13_e', label: 'Electrons (Ion)', answer: '10' },
      { id: 'g13_c', label: 'Net Charge', answer: '+3' },
      { id: 'g13_s', label: 'Ion Symbol', answer: 'Al3+' },
    ]
  },
  {
    id: 'tm', group: 'Group 4-12', name: 'Multivalent Transition Metals', element: 'Iron (Fe) -> Fe(III)', atomicNum: 26, mass: 56,
    neutralConfig: '[Ar] 4s2 3d6', ionConfig: '[Ar] 3d5', targetCharge: '+3', symbol: 'Fe3+',
    questions: [
      { id: 'tm_p', label: 'Protons', answer: '26' },
      { id: 'tm_n', label: 'Neutrons', answer: '30' },
      { id: 'tm_e', label: 'Electrons (Ion)', answer: '23' },
      { id: 'tm_c', label: 'Net Charge', answer: '+3' },
      { id: 'tm_s', label: 'Ion Symbol', answer: 'Fe3+' },
    ]
  },
  {
    id: 'g15', group: 'Group 15', name: 'Pnictogens', element: 'Phosphorus (P)', atomicNum: 15, mass: 31,
    neutralConfig: '1s2 2s2 2p6 3s2 3p3', ionConfig: '1s2 2s2 2p6 3s2 3p6', targetCharge: '-3', symbol: 'P3-',
    questions: [
      { id: 'g15_p', label: 'Protons', answer: '15' },
      { id: 'g15_n', label: 'Neutrons', answer: '16' },
      { id: 'g15_e', label: 'Electrons (Ion)', answer: '18' },
      { id: 'g15_c', label: 'Net Charge', answer: '-3' },
      { id: 'g15_s', label: 'Ion Symbol', answer: 'P3-' },
    ]
  },
  {
    id: 'g16', group: 'Group 16', name: 'Chalcogens', element: 'Sulfur (S)', atomicNum: 16, mass: 32,
    neutralConfig: '1s2 2s2 2p6 3s2 3p4', ionConfig: '1s2 2s2 2p6 3s2 3p6', targetCharge: '-2', symbol: 'S2-',
    questions: [
      { id: 'g16_p', label: 'Protons', answer: '16' },
      { id: 'g16_n', label: 'Neutrons', answer: '16' },
      { id: 'g16_e', label: 'Electrons (Ion)', answer: '18' },
      { id: 'g16_c', label: 'Net Charge', answer: '-2' },
      { id: 'g16_s', label: 'Ion Symbol', answer: 'S2-' },
    ]
  },
  {
    id: 'g17', group: 'Group 17', name: 'Halogens', element: 'Chlorine (Cl)', atomicNum: 17, mass: 35,
    neutralConfig: '1s2 2s2 2p6 3s2 3p5', ionConfig: '1s2 2s2 2p6 3s2 3p6', targetCharge: '-1', symbol: 'Cl-',
    questions: [
      { id: 'g17_p', label: 'Protons', answer: '17' },
      { id: 'g17_n', label: 'Neutrons', answer: '18' },
      { id: 'g17_e', label: 'Electrons (Ion)', answer: '18' },
      { id: 'g17_c', label: 'Net Charge', answer: '-1' },
      { id: 'g17_s', label: 'Ion Symbol', answer: 'Cl-' },
    ]
  }
];

const MAX_SCORE = MODULES.reduce((acc, m) => acc + m.questions.length + 1, 0); // +1 for the bohr model interactive electron count

function getShells(electrons) {
  let remaining = electrons;
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  const shells = [];
  for (let cap of capacities) {
    if (remaining <= 0) break;
    if (remaining > cap) {
      shells.push(cap);
      remaining -= cap;
    } else {
      shells.push(remaining);
      remaining = 0;
    }
  }
  return shells;
}

const BohrModel = ({ protons, neutralElectrons, currentElectrons, isInteractive = false, onAdd, onRemove }) => {
  const neutralShells = getShells(neutralElectrons);
  const currentShells = getShells(currentElectrons);
  const maxShells = Math.max(neutralShells.length, currentShells.length, 1);
  
  const size = 200;
  const center = size / 2;
  const baseRadius = 20;
  const radiusStep = 20;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Nucleus */}
          <circle cx={center} cy={center} r={12} className="fill-indigo-600" />
          <text x={center} y={center + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">+{protons}</text>

          {/* Shells */}
          {Array.from({ length: maxShells }).map((_, shellIdx) => {
            const r = baseRadius + (shellIdx * radiusStep);
            const isGhost = shellIdx >= currentShells.length;
            const eCount = currentShells[shellIdx] || 0;
            const neutralCount = neutralShells[shellIdx] || 0;
            
            return (
              <g key={`shell-${shellIdx}`}>
                <circle 
                  cx={center} cy={center} r={r} 
                  className={`fill-none ${isGhost ? 'stroke-slate-300 stroke-[1px] stroke-dasharray-4' : 'stroke-slate-400 stroke-[1.5px]'}`}
                  strokeDasharray={isGhost ? "4 4" : "none"}
                />
                
                {/* Electrons */}
                {!isGhost && Array.from({ length: eCount }).map((_, eIdx) => {
                  const angle = (2 * Math.PI / eCount) * eIdx - Math.PI/2;
                  const ex = center + r * Math.cos(angle);
                  const ey = center + r * Math.sin(angle);
                  const isGained = eCount > neutralCount && eIdx >= neutralCount;
                  
                  return (
                    <circle 
                      key={`e-${eIdx}`} cx={ex} cy={ey} r={3}
                      className={`${isGained ? 'fill-cyan-400' : 'fill-amber-400'} stroke-slate-900 stroke-[0.5px] transition-all`}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      
      {isInteractive && (
        <div className="flex items-center gap-3 mt-2 bg-slate-100 p-1 rounded-full border border-slate-200 print-hidden">
          <button onClick={onRemove} className="p-1 rounded-full bg-white shadow hover:bg-slate-50 text-slate-600"><Minus size={16}/></button>
          <span className="font-mono font-bold w-6 text-center text-slate-800">{currentElectrons}</span>
          <button onClick={onAdd} className="p-1 rounded-full bg-white shadow hover:bg-slate-50 text-slate-600"><Plus size={16}/></button>
        </div>
      )}
      {!isInteractive && (
        <div className="mt-2 text-sm font-medium text-slate-500">{neutralElectrons} e⁻ (Neutral)</div>
      )}
    </div>
  );
};


export default function App() {
  const [viewAll, setViewAll] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  
  // State
  const [studentInputs, setStudentInputs] = useState({});
  const [interactiveElectrons, setInteractiveElectrons] = useState({});
  
  // Initialize interactive electrons to neutral state on first load
  useEffect(() => {
    const initialElectrons = {};
    MODULES.forEach(m => { initialElectrons[m.id] = m.atomicNum; });
    setInteractiveElectrons(initialElectrons);
  }, []);

  const handleInput = (qId, val) => {
    setStudentInputs(prev => ({ ...prev, [qId]: val }));
  };

  const handleElectronChange = (modId, delta) => {
    setInteractiveElectrons(prev => ({
      ...prev,
      [modId]: Math.max(0, (prev[modId] || 0) + delta)
    }));
  };

  const calculateScore = () => {
    let score = 0;
    MODULES.forEach(m => {
      m.questions.forEach(q => {
        const studentAns = (studentInputs[q.id] || '').toString().trim().toLowerCase();
        const correctAns = q.answer.toString().trim().toLowerCase();
        if (studentAns === correctAns) score++;
      });
      // Interactive electron check
      const targetElectrons = m.questions.find(q => q.id.endsWith('_e'))?.answer;
      if (interactiveElectrons[m.id]?.toString() === targetElectrons) score++;
    });
    return score;
  };

  const currentScore = calculateScore();
  const scorePercent = Math.round((currentScore / MAX_SCORE) * 100) || 0;

  const renderModule = (mod) => {
    const targetE = parseInt(mod.questions.find(q => q.id.endsWith('_e'))?.answer || 0);
    const currentE = interactiveElectrons[mod.id] || mod.atomicNum;
    const isEcorect = currentE === targetE;

    return (
      <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 print-break-inside-avoid print-border-none">
        <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 print-m-0">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{mod.group}</div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">{mod.name}</h2>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-500">Target Element</div>
              <div className="font-bold text-slate-700">{mod.element}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 print-m-0">
          
          {/* Left: Bohr Models */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers size={18} className="text-blue-500"/> Shell Builder
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-around items-center gap-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-center">
                <BohrModel 
                  protons={mod.atomicNum} 
                  neutralElectrons={mod.atomicNum} 
                  currentElectrons={mod.atomicNum}
                />
                <div className="mt-2 font-medium text-slate-600">Neutral Atom</div>
              </div>
              
              <div className="text-center">
                <BohrModel 
                  protons={mod.atomicNum} 
                  neutralElectrons={mod.atomicNum} 
                  currentElectrons={currentE}
                  isInteractive={true}
                  onAdd={() => handleElectronChange(mod.id, 1)}
                  onRemove={() => handleElectronChange(mod.id, -1)}
                />
                <div className="mt-2 font-medium text-slate-600 flex items-center justify-center gap-2">
                  Ion Builder
                  {showKey && (
                    isEcorect ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data Table */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <LayoutList size={18} className="text-emerald-500"/> Subatomic Data
            </h3>
            
            <div className="space-y-3">
              {mod.questions.map(q => {
                const studentVal = studentInputs[q.id] || '';
                const isCorrect = studentVal.trim().toLowerCase() === q.answer.toLowerCase();
                
                return (
                  <div key={q.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="font-medium text-slate-700">{q.label}</span>
                    <div className="flex items-center gap-3">
                      {showKey ? (
                        <div className={`font-mono px-3 py-1.5 rounded bg-white border ${isCorrect ? 'border-green-400 text-green-700' : 'border-red-400 text-red-700'}`}>
                          {studentVal || '-'}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={studentVal}
                          onChange={(e) => handleInput(q.id, e.target.value)}
                          className="w-24 text-center font-mono px-3 py-1.5 rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="..."
                        />
                      )}
                      
                      {showKey && (
                        <div className="w-24 text-center font-mono text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded">
                          Key: {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg text-sm border border-indigo-100">
              <span className="font-bold">Neutral Config:</span> <span className="font-mono">{mod.neutralConfig}</span><br/>
              <span className="font-bold">Target Ion Config:</span> <span className="font-mono">{mod.ionConfig}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans text-slate-900">
      
      {/* HEADER & CONTROLS */}
      <div className="mb-8 print-hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileText className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Atomic & Ionic Structure Lab Worksheet</h1>
              <p className="text-sm text-slate-500">7 Periodic Group Modules • Bohr Shell Models • Ionization & Configurations</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setViewAll(!viewAll)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${viewAll ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <LayoutList size={16} /> {viewAll ? 'View Single Module' : 'View All 7 Modules'}
            </button>
            <button 
              onClick={() => setShowKey(!showKey)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${showKey ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Key size={16} /> Teacher Answer Key
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-sm"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button 
              onClick={() => {
                if(window.confirm('Reset all answers?')) {
                  setStudentInputs({});
                  const initialElectrons = {};
                  MODULES.forEach(m => { initialElectrons[m.id] = m.atomicNum; });
                  setInteractiveElectrons(initialElectrons);
                }
              }}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* WORKSHEET CONTENT */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 print-border-none print-shadow-none print-p-0">
        
        {/* Worksheet Header */}
        <div className="mb-8">
          <h4 className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-1">Chemistry Virtual Lab & Guided Inquiry Sheet</h4>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Periodic Trends in Ionization: Neutral Atoms vs. Ions</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <Award className="text-indigo-500 w-8 h-8" />
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Lab Score</div>
                <div className="text-2xl font-mono font-bold text-slate-800">{currentScore} / {MAX_SCORE} <span className="text-sm text-slate-500">({scorePercent}%)</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Name</label>
              <input type="text" placeholder="Enter full name..." className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
              <input type="text" placeholder="MM / DD / YYYY" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Period / Section</label>
              <input type="text" placeholder="e.g., Period 3 Honors Chem" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Module Navigator */}
        {!viewAll && (
          <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 print-hidden">
            <div className="flex justify-between items-center mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-2"><LayoutList size={16}/> Cycle Through Periodic Table Groups</span>
              <span>Module {activeModuleIdx + 1} of 7</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODULES.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModuleIdx(idx)}
                  className={`flex-1 min-w-[140px] p-3 text-left rounded-lg transition-all border ${activeModuleIdx === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'}`}
                >
                  <div className={`text-xs font-bold mb-1 ${activeModuleIdx === idx ? 'text-indigo-200' : 'text-slate-500'}`}>{m.group}</div>
                  <div className="font-bold text-sm truncate">{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modules Render */}
        <div>
          {viewAll ? MODULES.map(m => renderModule(m)) : renderModule(MODULES[activeModuleIdx])}
        </div>

      </div>
    </div>
  );
}
