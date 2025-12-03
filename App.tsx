import React, { useState } from 'react';
import { GameLoop } from './components/GameLoop';
import { ArrowRight, AlertCircle, ShoppingBag, Smartphone, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Game View
  if (isPlaying) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <GameLoop onExit={() => setIsPlaying(false)} />
      </div>
    );
  }

  // Dashboard / Menu
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-800 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-md w-full flex-grow flex flex-col justify-center">
        {/* Header */}
        <header className="mb-8 text-center mt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6 transform -rotate-6">
            <span className="text-4xl">🕵️‍♂️</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">妙手空空</h1>
          <h2 className="text-xl text-slate-600 font-bold bg-white px-4 py-1 rounded-full inline-block shadow-sm">视觉鉴别挑战</h2>
        </header>

        {/* Story Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-6 relative overflow-hidden">
          {/* Decorative Blob */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-4 flex items-center text-slate-900">
              <Eye className="w-5 h-5 mr-2 text-blue-500" />
              游戏规则：眼疾手快
            </h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed text-justify">
              新模式上线！不再看文字，全靠<span className="text-blue-600 font-bold">火眼金睛</span>。
              <br/>
              屏幕上会不断出现退货商品，你需要在 <strong>60秒</strong> 内根据<strong>图片外观</strong>快速判断：
              <br/>
              ✅ <strong>完好无损</strong> -> 点击通过
              <br/>
              ❌ <strong>发现瑕疵</strong> -> 点击拒收
            </p>
            
            <div className="space-y-3">
              <div className="bg-pink-50 p-3 rounded-xl border border-pink-100 flex items-start">
                <div className="mr-3 bg-white w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full shadow-sm text-pink-500">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-sm">常见瑕疵：衣物</span>
                  <span className="text-xs text-slate-500 leading-tight block mt-1">
                    注意观察是否有 <span className="text-red-500 font-bold">污渍</span>、<span className="text-red-500 font-bold">吊牌断裂</span> 或破洞。
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start">
                <div className="mr-3 bg-white w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full shadow-sm text-blue-500">
                  <Smartphone size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-sm">常见瑕疵：数码/鞋</span>
                  <span className="text-xs text-slate-500 leading-tight block mt-1">
                    注意 <span className="text-yellow-600 font-bold">密封条破损</span> 或 <span className="text-yellow-600 font-bold">配件缺失</span> (会有虚线框提示)。
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-auto mb-6">
           <button 
              onClick={() => setIsPlaying(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center group"
            >
              开始挑战 (60s)
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-slate-400 text-xs mt-4">
              基于 Google Gemini 生成实时图像 • 纯属虚构
            </p>
        </div>
      </div>
    </div>
  );
};

export default App;
