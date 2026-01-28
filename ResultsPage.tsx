import React, { useState, useEffect } from 'react';
import { getAllResults } from './sheetsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserStats, Group } from './types';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Array<UserStats & { userGroup: Group; timestamp: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    const data = await getAllResults();
    setResults(data);
    setLoading(false);
  };

  // Calculate aggregated statistics
  const calculateAggregates = () => {
    if (results.length === 0) return null;

    const totalUsers = results.length;
    const avgBiasScore = results.reduce((sum, r) => sum + r.biasScore, 0) / totalUsers;
    const avgInGroupPoints = results.reduce((sum, r) => sum + r.inGroupAvgPoints, 0) / totalUsers;
    const avgOutGroupPoints = results.reduce((sum, r) => sum + r.outGroupAvgPoints, 0) / totalUsers;
    const avgInGroupRating = results.reduce((sum, r) => sum + r.inGroupAvgRating, 0) / totalUsers;
    const avgOutGroupRating = results.reduce((sum, r) => sum + r.outGroupAvgRating, 0) / totalUsers;

    // Count by group
    const overCount = results.filter(r => r.userGroup === Group.OVER).length;
    const underCount = results.filter(r => r.userGroup === Group.UNDER).length;

    return {
      totalUsers,
      avgBiasScore,
      avgInGroupPoints,
      avgOutGroupPoints,
      avgInGroupRating,
      avgOutGroupRating,
      overCount,
      underCount
    };
  };

  const stats = calculateAggregates();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!stats || results.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">אין נתונים עדיין</h1>
          <p className="text-slate-600">אף משתמש עדיין לא השלים את הניסוי</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const pointsChartData = [
    { name: 'נקודות לקבוצה שלי', value: stats.avgInGroupPoints },
    { name: 'נקודות לקבוצה השנייה', value: stats.avgOutGroupPoints }
  ];

  const ratingsChartData = [
    { name: 'דירוג לקבוצה שלי', value: stats.avgInGroupRating },
    { name: 'דירוג לקבוצה השנייה', value: stats.avgOutGroupRating }
  ];

  const biasDistribution = results.map((r, idx) => ({
    name: `משתמש ${idx + 1}`,
    bias: r.biasScore
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-4">תוצאות מצטברות</h1>
          <p className="text-xl text-slate-600">ניתוח נתוני כל המשתתפים בניסוי</p>
          <div className="mt-6 flex justify-center gap-8">
            <div className="bg-white px-8 py-4 rounded-2xl shadow-lg">
              <div className="text-4xl font-black text-indigo-600">{stats.totalUsers}</div>
              <div className="text-sm font-semibold text-slate-500">משתתפים</div>
            </div>
            <div className="bg-white px-8 py-4 rounded-2xl shadow-lg">
              <div className="text-4xl font-black text-indigo-600">{stats.avgBiasScore.toFixed(2)}</div>
              <div className="text-sm font-semibold text-slate-500">ציון הטיה ממוצע</div>
            </div>
          </div>
        </div>

        {/* Group Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">התפלגות קבוצות</h2>
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="text-5xl font-black text-indigo-600 mb-2">{stats.overCount}</div>
              <div className="text-sm font-semibold text-slate-600">{Group.OVER}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-purple-600 mb-2">{stats.underCount}</div>
              <div className="text-sm font-semibold text-slate-600">{Group.UNDER}</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Points Allocation */}
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">הקצאת נקודות ממוצעת</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pointsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ratings */}
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">דירוגים חברתיים ממוצעים</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bias Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">התפלגות ציוני הטיה של כל המשתתפים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={biasDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="bias" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-slate-500 mt-4">
            ציון חיובי = הטיה לטובת הקבוצה שלי | ציון שלילי = הטיה לטובת הקבוצה השנייה
          </p>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <button
            onClick={loadResults}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold"
          >
            רענן נתונים
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
