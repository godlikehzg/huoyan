import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LevelStats } from '../types';
import { RotateCcw, ArrowRight, Trophy, Share2, Sparkles, Star, Frown } from 'lucide-react';

interface LevelSummaryProps {
  stats: LevelStats;
  onNext: () => void;
  onRetry: () => void;
}

export const LevelSummary: React.FC<LevelSummaryProps> = ({ stats, onNext, onRetry }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const data = [
    { name: '正确判断', value: stats.correct, color: '#22c55e' },
    { name: '看走眼', value: stats.mistakes, color: '#ef4444' },
  ];

  // Logic: Need at least 50% correct to pass, or score > 0 depending on balance
  const isSuccess = stats.score > 0 && stats.correct >= stats.mistakes;
  const isHighScore = stats.score > 500; // Threshold for extra effects

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds animation
    const startScore = 0;
    const endScore = stats.score;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentScore = Math.floor(startScore + (endScore - startScore) * easeProgress);
      setDisplayScore(currentScore);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setShowParticles(true);
      }
    };

    window.requestAnimationFrame(step);
    
    // Robust check for Recharts dimensions
    // We poll until the container has actual width > 0 before rendering the chart
    const checkDimensions = () => {
      if (chartContainerRef.current && chartContainerRef.current.offsetWidth > 0) {
        setChartReady(true);
      } else {
        requestAnimationFrame(checkDimensions);
      }
    };

    // Start checking after a small delay to allow for initial layout paint
    const timer = setTimeout(checkDimensions, 50);

    return () => clearTimeout(timer);
  }, [stats.score]);

  const handleShare = () => {
    const text = `我在《妙手空空》第${stats.level}关中火眼金睛，得分${stats.score}！识破了${stats.correct}个奇葩退货！快来挑战！`;
    if (navigator.share) {
      navigator.share({
        title: '妙手空空：退货侦探',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => alert('战绩已复制到剪贴板！'));
    }
  };

  return (
    // Removed 'animate-in' classes to prevent layout thrashing that breaks Recharts
    <div className="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 text-center m-4">
      <div className="mb-6 relative">
        {/* Trophy / Icon Area */}
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${isSuccess ? 'bg-yellow-100 text-yellow-600 scale-100' : 'bg-red-100 text-red-600'}`}>
           {isSuccess ? (
             <Trophy className={`w-12 h-12 ${isHighScore ? 'animate-bounce' : ''}`} />
           ) : (
             <Frown className="w-12 h-12" />
           )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {isSuccess ? (isHighScore ? '神级鉴别师!' : '验收完成!') : '店铺倒闭!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isSuccess 
            ? `干得漂亮，老板！店铺保住了。` 
            : `收了太多垃圾退货，资金链断裂！`}
        </p>

        {/* Animated Score Display */}
        <div className="mt-6 mb-2 relative flex justify-center items-center">
          {/* Particles for High Score */}
          {isSuccess && showParticles && (
            <>
              <Sparkles className="absolute -left-4 top-0 text-yellow-400 w-6 h-6 animate-pulse" />
              <Star className="absolute -right-6 bottom-2 text-orange-400 w-5 h-5 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <Sparkles className="absolute right-10 -top-6 text-yellow-500 w-4 h-4 animate-ping" style={{ animationDuration: '2s' }} />
            </>
          )}

          <div className={`text-6xl font-black font-mono tracking-tighter transition-all duration-300 transform 
            ${isSuccess 
              ? 'bg-clip-text text-transparent bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 scale-110' 
              : 'text-gray-400'
            }
          `}>
            {displayScore}
          </div>
          <span className="text-sm font-normal text-slate-400 ml-2 mt-4">分</span>
        </div>
      </div>

      {/* Explicit height and ref for Recharts container */}
      <div 
        ref={chartContainerRef}
        className="w-full mb-6 h-[180px] min-h-[180px]"
        style={{ minWidth: '100px' }} // Ensure it has some width logic
      >
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Placeholder while chart is preparing
          <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center">
             <span className="text-gray-300 text-sm">生成报表中...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button 
          onClick={onRetry}
          className="flex items-center justify-center py-3 px-4 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 active:scale-95 text-sm transition-transform"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重玩本关
        </button>
        <button 
          onClick={onNext}
          className={`flex items-center justify-center py-3 px-4 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-blue-200 text-sm ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!isSuccess}
        >
          {isSuccess ? '下一关' : '未解锁'} <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
      
      <button 
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-green-50 text-green-600 font-bold flex items-center justify-center hover:bg-green-100 transition-colors active:scale-95"
      >
        <Share2 className="w-4 h-4 mr-2" />
        分享战绩
      </button>
    </div>
  );
};