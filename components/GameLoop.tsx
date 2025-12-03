import React, { useState, useEffect, useRef } from 'react';
import { ReturnItem, LevelStats, PowerUp, GameMode, VisualDefect, ItemType } from '../types';
import { generateReturnBatch } from '../services/geminiService';
import { LevelSummary } from './TrendChart';
import { Loader2, Eye, Timer, Check, X, Clock, Zap, Shirt, Footprints, Monitor, ShoppingBag, AlertCircle, ScanLine, Tag, Scissors, Droplets, ShieldAlert, PackageX, Info, Rotate3D, Move, ZoomIn } from 'lucide-react';
import { playSound } from '../utils/audio';

interface GameLoopProps {
  onExit: () => void;
}

// Sub-component to render the visual representation of the item
const ProductVisual: React.FC<{ item: ReturnItem; level: number }> = ({ item, level }) => {
  const getBaseIcon = () => {
    switch (item.itemType) {
      case 'clothing_dress':
      case 'clothing_top':
        return <Shirt className="w-full h-full text-current drop-shadow-sm" strokeWidth={1} />;
      case 'shoe':
        return <Footprints className="w-full h-full text-current drop-shadow-sm" strokeWidth={1} />;
      case 'electronics':
        return <Monitor className="w-full h-full text-current drop-shadow-sm" strokeWidth={1} />;
      case 'bag':
        return <ShoppingBag className="w-full h-full text-current drop-shadow-sm" strokeWidth={1} />;
      default:
        return <PackageX className="w-full h-full text-current drop-shadow-sm" strokeWidth={1} />;
    }
  };

  const defects = item.visualDefects;

  // Defect Positioning Configuration
  const getDefectStyle = (defect: VisualDefect): React.CSSProperties => {
    const baseStyle: React.CSSProperties = { position: 'absolute' };
    
    // Default positions if not specified
    let pos = { top: '50%', left: '50%' };

    switch (item.itemType) {
      case 'clothing_top':
      case 'clothing_dress':
        if (defect === 'stain') pos = { top: '40%', left: '35%' }; // Chest area
        if (defect === 'tear') pos = { top: '70%', left: '20%' }; // Bottom hem area
        if (defect === 'broken_tag') pos = { top: '5%', left: '80%' }; // Neck/Shoulder tag
        break;
      case 'shoe':
        if (defect === 'stain') pos = { top: '60%', left: '30%' }; // Toe area
        if (defect === 'tear') pos = { top: '40%', left: '60%' }; // Side/Upper
        if (defect === 'broken_tag') pos = { top: '10%', left: '70%' }; // Laces/Ankle
        if (defect === 'missing_component') pos = { top: '20%', left: '20%' }; // Missing decoration
        break;
      case 'electronics':
        if (defect === 'broken_seal') pos = { top: '45%', left: '85%' }; // Side of box/device
        if (defect === 'missing_component') pos = { top: '80%', left: '10%' }; // Accessory area
        if (defect === 'stain') pos = { top: '30%', left: '20%' }; // Screen smudge
        break;
      case 'bag':
        if (defect === 'stain') pos = { top: '60%', left: '30%' }; // Main body
        if (defect === 'tear') pos = { top: '75%', left: '65%' }; // Corner
        if (defect === 'broken_tag') pos = { top: '15%', left: '75%' }; // Handle tag
        if (defect === 'missing_component') pos = { top: '40%', left: '50%' }; // Missing charm/logo
        break;
      default:
        if (defect === 'stain') pos = { top: '50%', left: '50%' };
        if (defect === 'tear') pos = { top: '70%', left: '30%' };
        if (defect === 'broken_tag') pos = { top: '10%', left: '80%' };
    }

    // Add slight randomness to positions for variety so it doesn't look identical every time
    // We use a deterministic hash based on item ID so it stays consistent for the same item
    const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
    const jitterX = (seed % 10) - 5; // -5% to +5%
    const jitterY = ((seed * 2) % 10) - 5;

    return {
      ...baseStyle,
      top: `calc(${pos.top} + ${jitterY}%)`,
      left: `calc(${pos.left} + ${jitterX}%)`,
    };
  };

  // Generate random distractions based on level
  const distractions = React.useMemo(() => {
    if (level <= 3) return [];
    
    // Increase count slightly with level
    const count = Math.min(5, Math.floor(Math.random() * (level - 2)) + 1);
    
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      delay: `${Math.random() * 2}s`,
      // Randomly noise (black or white)
      color: Math.random() > 0.5 ? 'bg-white' : 'bg-slate-800'
    }));
  }, [item.id, level]);

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto transition-all duration-300 pointer-events-none select-none">
      {/* Base Item Color & Icon */}
      <div 
        className="w-full h-full rounded-3xl flex items-center justify-center p-8 shadow-inner transition-colors duration-300 relative overflow-hidden"
        style={{ backgroundColor: item.color + '40' }} 
      >
        <div style={{ color: item.color }} className="w-full h-full opacity-90">
            {getBaseIcon()}
        </div>
      </div>

      {/* Render Defects Layers with Specific Positioning */}
      {defects.includes('stain') && (
        <div 
          className="absolute w-8 h-8 md:w-12 md:h-12 bg-amber-700/50 rounded-full blur-sm animate-pulse z-10 flex items-center justify-center"
          style={getDefectStyle('stain')}
        >
          <Droplets className="w-3/4 h-3/4 text-amber-900 opacity-60" />
        </div>
      )}
      
      {defects.includes('tear') && (
        <div 
          className="absolute w-8 h-8 md:w-12 md:h-12 text-slate-800 z-10"
          style={getDefectStyle('tear')}
        >
          <Scissors className="w-full h-full rotate-45 opacity-80 drop-shadow-md" />
        </div>
      )}

      {defects.includes('broken_tag') && (
        <div 
          className="absolute bg-red-100 p-1.5 md:p-2 rounded-lg border-2 border-red-500 shadow-lg transform rotate-12 z-20"
          style={getDefectStyle('broken_tag')}
        >
           <Tag className="w-5 h-5 md:w-7 md:h-7 text-red-500 line-through decoration-red-900 decoration-4" />
        </div>
      )}

      {defects.includes('broken_seal') && (
        <div 
          className="absolute bg-yellow-100 p-1.5 md:p-2 rounded-full border-2 border-yellow-600 shadow-lg z-20"
          style={getDefectStyle('broken_seal')}
        >
           <ShieldAlert className="w-5 h-5 md:w-7 md:h-7 text-yellow-600" />
        </div>
      )}

      {defects.includes('missing_component') && (
        <div 
          className="absolute bg-slate-200/50 p-2 rounded-lg border-2 border-slate-400 border-dashed opacity-80 z-10"
          style={getDefectStyle('missing_component')}
        >
           <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
        </div>
      )}

      {/* Visual Distractions (Noise) for higher levels */}
      {distractions.map(d => (
        <div 
          key={d.id}
          className={`absolute w-1.5 h-1.5 rounded-full opacity-40 animate-ping pointer-events-none ${d.color}`}
          style={{ 
            top: d.top, 
            left: d.left, 
            animationDuration: '0.8s', 
            animationDelay: d.delay 
          }}
        />
      ))}
    </div>
  );
};

// New Component for 3D Inspection
const InteractiveInspector: React.FC<{ item: ReturnItem; level: number }> = ({ item, level }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)), // Limit X rotation to avoid flipping
      y: prev.y + deltaX * 0.5
    }));
    
    startPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => setIsDragging(false);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = handleEnd;
  const handleMouseLeave = handleEnd;

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchEnd = handleEnd;

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(0.6, Math.min(1.5, prev - e.deltaY * 0.001)));
  };

  return (
    <div 
      className="w-full h-80 bg-slate-100 rounded-2xl overflow-hidden cursor-move relative flex items-center justify-center border-inner shadow-inner"
      style={{ perspective: '1000px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
       <div className="absolute top-3 left-3 z-10 text-[10px] md:text-xs text-slate-500 font-medium bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm pointer-events-none select-none">
          <Rotate3D className="w-3 h-3 md:w-4 md:h-4" /> 拖拽旋转 
          <span className="w-px h-3 bg-slate-300 mx-1"></span>
          <ZoomIn className="w-3 h-3 md:w-4 md:h-4" /> 滚轮缩放
       </div>

       {/* Reset Button */}
       <button 
         onClick={(e) => { e.stopPropagation(); setRotation({x:0, y:0}); setScale(1); }}
         className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 active:scale-95 text-slate-500"
         title="重置视图"
       >
         <Rotate3D className="w-4 h-4" />
       </button>

       <div 
         className="transition-transform duration-100 ease-out"
         style={{ 
           transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
           transformStyle: 'preserve-3d',
         }}
       >
         {/* Enhance "3D" feel with a card container */}
         <div className="bg-white rounded-3xl p-2 shadow-2xl relative backface-hidden" 
              style={{ transform: 'translateZ(0)' }} // Hardware accel hint
         >
            <ProductVisual item={item} level={level} />
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/40 to-transparent pointer-events-none mix-blend-overlay"></div>
         </div>
       </div>
    </div>
  );
};

export const GameLoop: React.FC<GameLoopProps> = ({ onExit }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [scoreSnapshot, setScoreSnapshot] = useState(0);
  
  // Queue Management
  const [itemQueue, setItemQueue] = useState<ReturnItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ReturnItem | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60); // Increased to 60s
  const [gameState, setGameState] = useState<GameMode>(GameMode.PLAYING);
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Feedback UI
  const [lastJudgment, setLastJudgment] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: 'fire_eyes', name: '透视眼', icon: <Eye className="w-4 h-4" />, cost: 0, count: 3 },
    { id: 'time_freeze', name: '时间暂停', icon: <Clock className="w-4 h-4" />, cost: 0, count: 1 },
  ]);

  const [scoreAnimation, setScoreAnimation] = useState(false);
  const prevScoreRef = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  // Initial Load
  useEffect(() => {
    startLevel(level);
  }, [level]);

  // Infinite Queue Fetching
  useEffect(() => {
    if (itemQueue.length < 5 && !fetchingRef.current && gameState === GameMode.PLAYING) {
      fetchMoreItems();
    }
  }, [itemQueue.length, gameState]);

  const fetchMoreItems = async () => {
    fetchingRef.current = true;
    const newItems = await generateReturnBatch(level, 5);
    setItemQueue(prev => [...prev, ...newItems]);
    fetchingRef.current = false;
  };

  // Assign current item from queue if null
  useEffect(() => {
    if (!currentItem && itemQueue.length > 0) {
      const next = itemQueue[0];
      setCurrentItem(next);
      setItemQueue(prev => prev.slice(1));
    } else if (!currentItem && !loading && itemQueue.length === 0) {
      // Emergency fetch if queue is empty
      fetchMoreItems().then(() => {
         // It will auto-fill next render
      });
    }
  }, [currentItem, itemQueue, loading]);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      setScoreAnimation(true);
      const timer = setTimeout(() => setScoreAnimation(false), 500);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  const startLevel = async (lvl: number) => {
    setLoading(true);
    setGameState(GameMode.PLAYING);
    setScoreSnapshot(score);
    setTimeLeft(60);
    setCorrectCount(0);
    setMistakeCount(0);
    setStreak(0);
    setMaxStreak(0);
    setLastJudgment(null);
    setShowExplanation(null);
    setShowDetails(false);
    setItemQueue([]);
    setCurrentItem(null);

    // Initial Batch
    const initialItems = await generateReturnBatch(lvl, 8);
    setItemQueue(initialItems.slice(1));
    setCurrentItem(initialItems[0]);
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (gameState === GameMode.PLAYING && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, loading]);

  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSound('timeout');
    setGameState(GameMode.SUMMARY);
  };

  const handleDecision = (decision: 'reject' | 'accept') => {
    if (!currentItem || showExplanation) return; // Prevent double click during feedback

    setShowDetails(false); // Close details if open
    const isFraud = currentItem.isFraud;
    const playerThinksFraud = decision === 'reject';
    const isCorrect = isFraud === playerThinksFraud;

    if (isCorrect) {
      playSound('success');
      setScore(s => s + 100 + (streak * 10)); // Streak bonus
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak >= 5) {
            playSound('combo');
        }
        setMaxStreak(m => Math.max(m, newStreak));
        return newStreak;
      });
      setCorrectCount(c => c + 1);
      setLastJudgment('correct');
    } else {
      playSound('failure');
      setScore(s => Math.max(0, s - 50));
      setStreak(0);
      setMistakeCount(m => m + 1);
      setLastJudgment('wrong');
    }

    // Show Explanation briefly then move to next
    setShowExplanation(currentItem.explanation);

    // Auto advance after short delay
    setTimeout(() => {
      setShowExplanation(null);
      setLastJudgment(null);
      setCurrentItem(null); // This triggers the useEffect to pop from queue
    }, 1200); // 1.2s delay to read explanation
  };

  const handlePowerUp = (type: string) => {
    if (gameState !== GameMode.PLAYING || showExplanation) return;

    setPowerUps(prev => prev.map(p => {
      if (p.id === type && p.count > 0) {
        playSound('powerup');
        if (type === 'fire_eyes' && currentItem) {
          // Reveal the answer visually
          const hint = currentItem.isFraud ? "发现瑕疵！" : "完美无瑕！";
          setShowExplanation(hint); // Just show hint text, don't auto-advance yet
          // Don't auto-advance, let user click
          setTimeout(() => setShowExplanation(null), 1000);
        } else if (type === 'time_freeze') {
          setTimeLeft(t => t + 15);
        }
        return { ...p, count: p.count - 1 };
      }
      return p;
    }));
  };

  const handleCardClick = () => {
    if (gameState !== GameMode.PLAYING || showExplanation || !currentItem) return;
    playSound('scan');
    setShowDetails(true);
  };

  const handleNextLevel = () => {
    setLevel(l => l + 1);
  };

  const handleRetryLevel = () => {
    setScore(scoreSnapshot);
    startLevel(level);
  };

  if (loading || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <p className="text-lg animate-pulse">正在提取商品影像...</p>
      </div>
    );
  }

  if (gameState === GameMode.SUMMARY) {
    return (
      <LevelSummary 
        stats={{
          level,
          score,
          correct: correctCount,
          mistakes: mistakeCount,
          timeRemaining: 0,
          streak: maxStreak
        }}
        onNext={handleNextLevel}
        onRetry={handleRetryLevel}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col pb-6 pt-2 relative overflow-hidden bg-slate-100">
      
      {/* Top HUD */}
      <div className="px-4 py-2 flex justify-between items-center bg-white shadow-sm z-20">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-bold uppercase">得分</span>
          <span className={`text-2xl font-black text-blue-600 leading-none transition-transform duration-200 ${scoreAnimation ? 'scale-125 text-blue-500' : ''}`}>
             {score}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl font-bold border-2 ${timeLeft < 10 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-white text-slate-700 border-slate-100'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>

        <button onClick={onExit} className="p-2 text-slate-400 bg-slate-50 rounded-full">
           <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center relative p-4">
        
        {/* Streak Indicator */}
        {streak > 1 && (
          <div className="absolute top-4 font-black text-yellow-500 text-lg animate-bounce z-10 drop-shadow-md">
            {streak} 连对! 🔥
          </div>
        )}
        
        {/* Combo Message Animation (Flashy text) */}
        {streak >= 5 && streak % 5 === 0 && !showExplanation && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
             <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 animate-ping">
                COMBO!
             </div>
          </div>
        )}

        {/* Card Container - Clickable for details */}
        <div 
          onClick={handleCardClick}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 relative flex flex-col items-center min-h-[400px] justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
        >
          {/* Detail Hint Overlay (On Hover) */}
          <div className="absolute top-4 right-4 bg-slate-100 rounded-full p-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Info className="w-5 h-5" />
          </div>

          {/* Category Badge - Always Visible */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
             {currentItem.category === 'female' ? (
                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-200 shadow-sm">
                  女装
                </span>
             ) : (
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">
                  男装
                </span>
             )}
          </div>

          {/* Interactive Visual */}
          <div className="w-full flex-grow flex items-center justify-center my-4">
             <InteractiveInspector item={currentItem} level={level} />
          </div>

          {/* Item Name */}
          <div className="text-center z-20">
             <h3 className="text-xl font-black text-slate-800 mb-1">{currentItem.name}</h3>
             <p className="text-xs text-slate-400 font-mono">ID: {currentItem.id.slice(0, 8)}</p>
          </div>
          
          {/* Explanation Overlay (Result) */}
          {showExplanation && (
            <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm transition-all duration-300 ${lastJudgment === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
               <div className={`p-6 rounded-2xl shadow-2xl transform scale-110 border-4 ${lastJudgment === 'correct' ? 'bg-white border-green-500' : 'bg-white border-red-500'}`}>
                  <div className={`text-4xl mb-2 flex justify-center ${lastJudgment === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                    {lastJudgment === 'correct' ? <Check className="w-16 h-16" /> : <X className="w-16 h-16" />}
                  </div>
                  <p className="font-bold text-center text-slate-800 max-w-[200px]">
                    {showExplanation}
                  </p>
               </div>
            </div>
          )}

        </div>

        {/* Action Bar */}
        <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleDecision('accept')}
            disabled={!!showExplanation}
            className="group relative flex items-center justify-center py-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center font-black text-lg text-slate-700 group-hover:text-green-700">
               <Check className="w-6 h-6 mr-2" />
               通过
            </span>
          </button>

          <button 
            onClick={() => handleDecision('reject')}
            disabled={!!showExplanation}
            className="group relative flex items-center justify-center py-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center font-black text-lg text-slate-700 group-hover:text-red-700">
               <X className="w-6 h-6 mr-2" />
               拒收
            </span>
          </button>
        </div>

        {/* Power Ups */}
        <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3">
          {powerUps.map(p => (
            <button
              key={p.id}
              onClick={() => handlePowerUp(p.id)}
              disabled={p.count === 0 || !!showExplanation}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-95
                ${p.count > 0 
                  ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md text-slate-700' 
                  : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed opacity-60'
                }`}
            >
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-full ${p.count > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                    {p.icon}
                 </div>
                 <div className="text-left">
                    <span className="block font-bold text-sm">{p.name}</span>
                    <span className="text-[10px] text-slate-400">剩余: {p.count}</span>
                 </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetails && currentItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black text-slate-800">商品详情</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">材质</div>
                  <div className="text-slate-800 font-medium">{currentItem.material}</div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">描述</div>
                  <div className="text-slate-800 font-medium">{currentItem.description}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">检验提示</div>
                   <div className="text-slate-600 text-sm">
                      {currentItem.itemType === 'shoe' || currentItem.itemType === 'electronics' 
                         ? '重点检查：密封条是否完整，配件是否齐全。' 
                         : '重点检查：是否有污渍、破损或吊牌被拆。'
                      }
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setShowDetails(false)}
                className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
              >
                继续检查
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};