
import React, { useState, useEffect, useCallback } from 'react';
import { AppStep, Group, AllocationChoice, JudgmentScore, Character, UserStats } from './types';
import { generateCharacters, generateDebrief } from './geminiService';
import { saveUserResults } from './sheetsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [userGroup, setUserGroup] = useState<Group>(Group.NONE);
  const [allocations, setAllocations] = useState<AllocationChoice[]>([]);
  const [judgments, setJudgments] = useState<JudgmentScore[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [debriefText, setDebriefText] = useState<string>('');

  const [currentAllocationIdx, setCurrentAllocationIdx] = useState(0);
  const [currentJudgmentIdx, setCurrentJudgmentIdx] = useState(0);

  const allocationScenarios = [
    `חלק 100 נקודות מחקר בין ${Group.OVER} לבין ${Group.UNDER}.`,
    `הקצה בונוס של 50$ בין ${Group.OVER} אנונימי לבין ${Group.UNDER} אנונימי.`,
    `חלק 20 נקודות בונוס אקדמי בין עמית מהקבוצה של ${Group.OVER} לבין עמית מהקבוצה של ${Group.UNDER}.`,
    `חלק 10 אסימוני גישה בין שני אנשים משתי הקבוצות.`
  ];

  const startExperiment = () => {
    setStep(AppStep.ASSIGNMENT_TEST);
  };

  const completeAssignment = () => {
    const randomGroup = Math.random() > 0.5 ? Group.OVER : Group.UNDER;
    setUserGroup(randomGroup);
    setStep(AppStep.GROUP_REVEAL);
    setLoading(true);
    generateCharacters()
      .then(chars => {
        console.log('Characters loaded:', chars);
        setCharacters(chars);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading characters:', err);
        setLoading(false);
      });
  };

  const handleAllocation = (inGroup: number, outGroup: number) => {
    setAllocations(prev => [...prev, { inGroupAmount: inGroup, outGroupAmount: outGroup, scenario: allocationScenarios[currentAllocationIdx] }]);
    if (currentAllocationIdx < allocationScenarios.length - 1) {
      setCurrentAllocationIdx(prev => prev + 1);
    } else {
      setStep(AppStep.JUDGMENT_TASK);
    }
  };

  const handleJudgment = (rating: number) => {
    const char = characters[currentJudgmentIdx];
    if (!char) return;
    setJudgments(prev => [...prev, {
      characterName: char.name,
      characterGroup: char.group,
      rating,
      attribute: 'Trustworthiness'
    }]);

    if (currentJudgmentIdx < characters.length - 1) {
      setCurrentJudgmentIdx(prev => prev + 1);
    } else {
      finishExperiment();
    }
  };

  const calculateStats = useCallback((): UserStats => {
    const inGroupPoints = allocations.reduce((sum, a) => sum + a.inGroupAmount, 0);
    const outGroupPoints = allocations.reduce((sum, a) => sum + a.outGroupAmount, 0);
    const inGroupRatings = judgments.filter(j => j.characterGroup === userGroup);
    const outGroupRatings = judgments.filter(j => j.characterGroup !== userGroup);

    const avgInPoints = inGroupPoints / (allocations.length || 1);
    const avgOutPoints = outGroupPoints / (allocations.length || 1);
    const avgInRating = inGroupRatings.reduce((sum, r) => sum + r.rating, 0) / (inGroupRatings.length || 1);
    const avgOutRating = outGroupRatings.reduce((sum, r) => sum + r.rating, 0) / (outGroupRatings.length || 1);

    const pointBias = (avgInPoints - avgOutPoints) / 50; 
    const ratingBias = (avgInRating - avgOutRating) / 10;
    
    return {
      inGroupAvgPoints: avgInPoints,
      outGroupAvgPoints: avgOutPoints,
      inGroupAvgRating: avgInRating,
      outGroupAvgRating: avgOutRating,
      biasScore: (pointBias + ratingBias) / 2
    };
  }, [allocations, judgments, userGroup]);

  const finishExperiment = async () => {
    setStep(AppStep.RESULTS);
    setLoading(true);
    const stats = calculateStats();
    
    // Save to Firebase
    await saveUserResults(stats, userGroup);
    
    const debrief = await generateDebrief(stats, userGroup);
    setDebriefText(debrief);
    setLoading(false);
  };

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto text-center py-16 px-4">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">מעבדת תפיסה קוגניטיבית</h1>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        מחקר מדעי זה בוחן עיבוד נוירו-תפיסתי. נתחיל במבחן הערכת צפיפות נקודות כדי לסווג את הפרופיל הקוגניטיבי הספציפי שלך.
      </p>
      <button 
        onClick={startExperiment}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl"
      >
        התחל כיול
      </button>
    </div>
  );

  const renderAssignmentTest = () => (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">שלב 1: הערכת נקודות</h2>
      <p className="mb-8 text-slate-500 italic">הערך במהירות את הכמות בתיבות למטה כדי לכייל את המערכת.</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="bg-white h-32 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
             <div className="flex flex-wrap gap-1 p-4 justify-center">
                {Array.from({length: 20 + Math.floor(Math.random() * 15)}).map((_, i) => (
                   <div key={i} className="w-2 h-2 rounded-full bg-slate-300"></div>
                ))}
             </div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-slate-700 font-medium">איזה טווח הערכה משקף בצורה הטובה ביותר את התפיסה המיידית שלך?</p>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {['15-25', '26-35', '36-45', '46+'].map(range => (
          <button key={range} onClick={completeAssignment} className="px-6 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 font-semibold transition-all shadow-sm">{range}</button>
        ))}
      </div>
    </div>
  );

  const renderGroupReveal = () => (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h2 className="text-3xl font-bold mb-2">הכיול הצליח</h2>
      <p className="text-slate-500 mb-8">ניתוח המערכת הושלם. בהתבסס על ההטיה התפיסתית שלך:</p>
      <div className="inline-block py-8 px-16 rounded-3xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-900 border-b-4 border-indigo-500 shadow-2xl ring-4 ring-indigo-500 ring-opacity-10">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400 block mb-2">הפרופיל שלך</span>
        <span className="text-3xl font-black text-white">{userGroup}</span>
      </div>
      <p className="mb-10 text-slate-600 max-w-sm mx-auto">אתה חולק סגנון עיבוד קוגניטיבי מובחן עם <strong>{userGroup}ים</strong> אחרים. כעת נמשיך לשלב ההערכה החברתית.</p>
      <button 
        onClick={() => setStep(AppStep.ALLOCATION_TASK)}
        className="bg-indigo-600 text-white px-10 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold text-lg"
      >
        המשך כ-{userGroup}
      </button>
    </div>
  );

  const renderAllocationTask = () => (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-3">משימה 1: חלוקת משאבים</h2>
        <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8 flex items-center justify-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">?</div>
        <p className="text-slate-700 font-semibold leading-relaxed text-right">
          כחבר בקבוצת ה<span className="text-indigo-600 font-black underline decoration-indigo-300 underline-offset-4">{userGroup}</span>, 
          עליך להחליט כיצד לחלק משאבים בתרחיש הבא:
        </p>
      </div>

      <h3 className="text-2xl font-bold mb-8 text-slate-800 text-center px-4 leading-tight">
        {allocationScenarios[currentAllocationIdx]}
      </h3>
      
      <AllocationSlider 
        userGroup={userGroup}
        onAllocate={handleAllocation}
      />
      
      <div className="mt-12 flex justify-center space-x-3">
        {allocationScenarios.map((_, i) => (
          <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i === currentAllocationIdx ? 'bg-indigo-600 scale-110 shadow-sm' : 'bg-slate-200'}`}></div>
        ))}
      </div>
    </div>
  );

  const renderJudgmentTask = () => {
    console.log('renderJudgmentTask - loading:', loading, 'characters:', characters.length, 'currentIdx:', currentJudgmentIdx);
    
    // Safety check for empty characters array or loading state
    if (loading || characters.length === 0) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">טוען פרופילי נבדקים...</p>
            <p className="mt-2 text-xs text-slate-400">Debug: loading={loading ? 'true' : 'false'}, chars={characters.length}</p>
          </div>
        </div>
      );
    }

    const currentChar = characters[currentJudgmentIdx];
    if (!currentChar) return null;

    const isInGroup = currentChar.group === userGroup;

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-3">משימה 2: תפיסה חברתית</h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-slate-800 text-white p-4 rounded-xl mb-12 text-center text-sm font-bold shadow-lg flex items-center justify-center gap-2">
          <span className="opacity-50">הפרופיל שלך:</span>
          <span className="text-indigo-400 uppercase tracking-widest">{userGroup}</span>
        </div>

        <div className={`relative bg-white p-10 rounded-3xl shadow-2xl border transition-all duration-500 animate-in fade-in zoom-in-95 ${isInGroup ? 'border-indigo-400 ring-8 ring-indigo-50' : 'border-slate-100'}`}>
          {/* Group Membership Indicator Badge - Positioned Next to Avatar */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="relative">
              <div className={`rounded-3xl p-1 shadow-2xl transition-all duration-500 ${isInGroup ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <img src={currentChar.avatar} alt="Profile" className="w-40 h-40 rounded-[1.25rem] mx-auto object-cover border-4 border-white" />
              </div>
              {/* Corner Icon */}
              <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${isInGroup ? 'bg-indigo-600 text-white' : 'bg-slate-400 text-white'}`}>
                {isInGroup ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                )}
              </div>
            </div>

            <div className="text-right flex-1">
              <div className="mb-2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${isInGroup ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {isInGroup ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      חבר בקבוצה שלך ({currentChar.group})
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      חבר בקבוצה השנייה ({currentChar.group})
                    </>
                  )}
                </span>
              </div>
              <h4 className="text-4xl font-black text-slate-800">{currentChar.name}</h4>
              <div className={`h-1.5 w-24 mt-2 rounded-full ${isInGroup ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
            </div>
          </div>
          
          <div className="bg-slate-50 border-r-4 border-slate-200 p-6 rounded-xl mb-10">
            <p className="text-slate-600 text-right text-xl italic leading-relaxed font-light">
              "{currentChar.description}"
            </p>
          </div>
          
          <div className={`space-y-8 p-8 rounded-2xl border transition-colors ${isInGroup ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 shadow-inner'}`}>
            <p className="text-center font-bold text-slate-700 text-lg">כיצד היית מדרג את פוטנציאל המנהיגות הנתפס של אדם זה?</p>
            <div className="flex justify-between items-center gap-2 flex-row-reverse">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                <button 
                  key={rating}
                  onClick={() => handleJudgment(rating)}
                  className={`flex-1 h-14 rounded-xl font-black transition-all text-base border-2 ${isInGroup ? 'hover:bg-indigo-600 hover:text-white border-indigo-200 hover:border-indigo-600 text-indigo-700 bg-white' : 'hover:bg-slate-700 hover:text-white border-slate-200 hover:border-slate-700 text-slate-600 bg-white'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest flex-row-reverse">
              <span>פוטנציאל מינימלי</span>
              <span>פוטנציאל יוצא דופן</span>
            </div>
          </div>
          
          {isInGroup && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/5 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                שימוש במידע פנים: שיוך קבוצתי זהה
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const stats = calculateStats();
    const chartData = [
      { name: 'הקבוצה שלך', points: stats.inGroupAvgPoints, rating: stats.inGroupAvgRating * 10 },
      { name: 'הקבוצה השנייה', points: stats.outGroupAvgPoints, rating: stats.outGroupAvgRating * 10 },
    ];

    return (
      <div className="max-w-5xl mx-auto py-12 px-4 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">ממצאי המעבדה</h2>
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 rounded-full border border-indigo-100">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">פרופיל נבדק: {userGroup}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400 text-center">הטיית חלוקת נקודות</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="points" radius={[8, 8, 8, 8]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400 font-medium italic">השוואה של ממוצע נקודות שניתנו לחברי הקבוצה שלך לעומת הקבוצה השנייה.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400 text-center">הטיית יכולת חברתית</h4>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="rating" radius={[8, 8, 8, 8]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400 font-medium italic">אחוז מנורמל של ציוני דירוג חברתי לשתי הקבוצות.</p>
          </div>
        </div>

        <div className="bg-slate-900 border-t-8 border-indigo-500 p-10 rounded-[2rem] relative overflow-hidden shadow-2xl text-white text-right">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <h3 className="text-3xl font-black mb-8 tracking-tight">תיאוריה: פרדיגמת הקבוצה המינימלית</h3>
          {loading ? (
             <div className="space-y-6">
                <div className="h-5 bg-slate-800 rounded animate-pulse w-3/4"></div>
                <div className="h-5 bg-slate-800 rounded animate-pulse w-full"></div>
                <div className="h-5 bg-slate-800 rounded animate-pulse w-5/6"></div>
             </div>
          ) : (
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg font-light space-y-4">
              {debriefText}
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white border-2 border-slate-200 rounded-full text-slate-600 font-black hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm uppercase tracking-widest text-xs"
            >
              הפעל מחדש את הסימולציה
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans" dir="rtl">
      <nav className="border-b bg-white py-5 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">P</div>
           <span className="font-black text-slate-900 text-xl tracking-tighter">PerceptualLab</span>
        </div>
        
        {userGroup !== Group.NONE && step !== AppStep.RESULTS && (
          <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500">
             <div className="hidden sm:block text-right">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">סטטוס פעיל</div>
                <div className="text-sm font-black text-indigo-600 uppercase tracking-tighter">{userGroup}</div>
             </div>
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-inner ring-4 ring-indigo-50 border-2 border-white">
                <span className="text-sm font-black">{userGroup.charAt(0)}</span>
             </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto">
        {step === AppStep.INTRO && renderIntro()}
        {step === AppStep.ASSIGNMENT_TEST && renderAssignmentTest()}
        {step === AppStep.GROUP_REVEAL && renderGroupReveal()}
        {step === AppStep.ALLOCATION_TASK && renderAllocationTask()}
        {step === AppStep.JUDGMENT_TASK && renderJudgmentTask()}
        {step === AppStep.RESULTS && renderResults()}
      </main>
    </div>
  );
};

// Sub-components
const AllocationSlider: React.FC<{
  userGroup: Group,
  onAllocate: (inGroup: number, outGroup: number) => void
}> = ({ userGroup, onAllocate }) => {
  const [val, setVal] = useState(50);
  
  const inGroup = 100 - val;
  const outGroup = val;

  const otherGroup = userGroup === Group.OVER ? Group.UNDER : Group.OVER;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="flex justify-between mb-12 gap-6 items-stretch flex-row">
        {/* In-group (You) */}
        <div className={`text-center flex-1 p-8 rounded-3xl transition-all duration-300 border-4 ${val < 50 ? 'border-indigo-600 bg-indigo-50 shadow-2xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
           <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${val < 50 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>הקבוצה שלך</span>
           </div>
           <span className="block text-xs font-black uppercase text-slate-400 mb-1">{userGroup}</span>
           <div className="flex items-baseline justify-center gap-1">
              <span className="text-7xl font-black text-slate-800 tracking-tighter">{inGroup}</span>
              <span className="text-xs font-bold text-slate-400">נק'</span>
           </div>
        </div>
        
        <div className="flex items-center font-black text-slate-200 text-3xl">נגד</div>
        
        {/* Out-group */}
        <div className={`text-center flex-1 p-8 rounded-3xl transition-all duration-300 border-4 ${val > 50 ? 'border-indigo-600 bg-indigo-50 shadow-2xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
           <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${val > 50 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>הקבוצה השנייה</span>
           </div>
           <span className="block text-xs font-black uppercase text-slate-400 mb-1">{otherGroup}</span>
           <div className="flex items-baseline justify-center gap-1">
              <span className="text-7xl font-black text-slate-800 tracking-tighter">{outGroup}</span>
              <span className="text-xs font-bold text-slate-400">נק'</span>
           </div>
        </div>
      </div>

      <div className="px-6 mb-12 group">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(parseInt(e.target.value))}
          className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 ring-8 ring-slate-50 group-hover:ring-slate-100 transition-all"
        />
        <div className="flex justify-between mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 flex-row">
           <span className={val < 50 ? 'text-indigo-600' : ''}>עדיפות לקבוצה שלך</span>
           <span className={val === 50 ? 'text-slate-500' : ''}>איזון ניטרלי</span>
           <span className={val > 50 ? 'text-indigo-600' : ''}>עדיפות לקבוצה השנייה</span>
        </div>
      </div>

      <button 
        onClick={() => {
          onAllocate(inGroup, outGroup);
          setVal(50);
        }}
        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] text-lg uppercase tracking-widest"
      >
        שלח הערכה
      </button>
    </div>
  );
};

export default App;
