import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReturnItem, VisualDefect, ItemType } from "../types";

// Prevent crash if API key is missing or invalid (e.g. during build or offline).
// We use a fallback string so the SDK constructor doesn't throw immediately.
const apiKey = process.env.API_KEY || "OFFLINE_MODE";
const ai = new GoogleGenAI({ apiKey });

const itemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    category: { type: Type.STRING, enum: ['female', 'male'] },
    itemType: { type: Type.STRING, enum: ['clothing_top', 'clothing_dress', 'shoe', 'electronics', 'bag'] },
    material: { type: Type.STRING },
    description: { type: Type.STRING },
    visualDefects: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING, enum: ['stain', 'tear', 'broken_tag', 'missing_component', 'broken_seal', 'none'] } 
    },
    isFraud: { type: Type.BOOLEAN },
    color: { type: Type.STRING },
    explanation: { type: Type.STRING },
  },
  required: ['name', 'category', 'itemType', 'material', 'description', 'visualDefects', 'isFraud', 'color', 'explanation'],
};

const batchSchema: Schema = {
  type: Type.ARRAY,
  items: itemSchema,
};

// --- EXPANDED LOCAL GENERATOR ---
// High-performance procedural generation to minimize loading time
const generateFallbackItem = (index: number): any => {
  const templates = [
    // Clothing Top - Female
    { name: "纯棉T恤", category: "female", itemType: "clothing_top", material: "100%纯棉", desc: "亲肤透气，夏季百搭基础款。", color: "#FECACA" },
    { name: "牛仔外套", category: "female", itemType: "clothing_top", material: "丹宁布", desc: "复古水洗工艺，经典耐穿。", color: "#60A5FA" },
    { name: "羊毛开衫", category: "female", itemType: "clothing_top", material: "美利奴羊毛", desc: "温柔软糯，保暖舒适。", color: "#FDE68A" },
    { name: "真丝衬衫", category: "female", itemType: "clothing_top", material: "桑蚕丝", desc: "法式优雅，光泽感极佳。", color: "#E5E7EB" },
    
    // Clothing Top - Male
    { name: "运动卫衣", category: "male", itemType: "clothing_top", material: "聚酯纤维", desc: "吸湿排汗，运动必备。", color: "#1F2937" },
    { name: "商务衬衫", category: "male", itemType: "clothing_top", material: "长绒棉", desc: "免烫工艺，职场精英首选。", color: "#BFDBFE" },
    { name: "机能冲锋衣", category: "male", itemType: "clothing_top", material: "Gore-Tex", desc: "防风防水，应对极端天气。", color: "#059669" },

    // Dress
    { name: "碎花连衣裙", category: "female", itemType: "clothing_dress", material: "雪纺", desc: "清新田园风，适合度假。", color: "#FBCFE8" },
    { name: "晚礼服", category: "female", itemType: "clothing_dress", material: "丝绒", desc: "高贵典雅，年会吸睛神器。", color: "#818CF8" },
    { name: "吊带长裙", category: "female", itemType: "clothing_dress", material: "莫代尔", desc: "垂坠感好，显瘦设计。", color: "#F87171" },
    { name: "赫本风黑裙", category: "female", itemType: "clothing_dress", material: "醋酸面料", desc: "经典复古，永不过时。", color: "#111827" },

    // Shoe
    { name: "运动跑鞋", category: "male", itemType: "shoe", material: "透气网布", desc: "超轻缓震科技，助力奔跑。", color: "#3B82F6" },
    { name: "休闲板鞋", category: "male", itemType: "shoe", material: "合成革", desc: "街头潮流，简约百搭。", color: "#D1D5DB" },
    { name: "高跟鞋", category: "female", itemType: "shoe", material: "漆皮", desc: "7cm跟高，修饰腿型。", color: "#DC2626" },
    { name: "老爹鞋", category: "female", itemType: "shoe", material: "混合材质", desc: "复古厚底，增高显瘦。", color: "#FEF3C7" },

    // Electronics
    { name: "无线鼠标", category: "male", itemType: "electronics", material: "磨砂塑料", desc: "人体工学设计，静音按键。", color: "#374151" },
    { name: "蓝牙耳机", category: "male", itemType: "electronics", material: "亮面PC", desc: "主动降噪，沉浸式音质。", color: "#F3F4F6" },
    { name: "智能手机", category: "female", itemType: "electronics", material: "玻璃背板", desc: "超清影像系统，极速性能。", color: "#A78BFA" },
    { name: "笔记本电脑", category: "male", itemType: "electronics", material: "铝合金", desc: "轻薄便携，强劲续航12小时。", color: "#9CA3AF" },
    { name: "平板电脑", category: "female", itemType: "electronics", material: "再生铝", desc: "视网膜屏幕，生产力工具。", color: "#FCD34D" },
    { name: "智能手表", category: "male", itemType: "electronics", material: "氟橡胶", desc: "全天候心率监测，运动模式。", color: "#EF4444" },

    // Bag
    { name: "双肩背包", category: "male", itemType: "bag", material: "牛津布", desc: "大容量防泼水，通勤差旅必备。", color: "#4B5563" },
    { name: "手提托特包", category: "female", itemType: "bag", material: "荔枝纹牛皮", desc: "超大容量，简约大气。", color: "#D97706" },
    { name: "链条包", category: "female", itemType: "bag", material: "小羊皮", desc: "菱格纹设计，经典时尚。", color: "#1F2937" },
    { name: "运动腰包", category: "male", itemType: "bag", material: "尼龙", desc: "轻便贴身，解放双手。", color: "#10B981" },
  ];

  // Pick a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Determine if fraud (50% chance)
  const isFraud = Math.random() > 0.5;
  
  let selectedDefect: string;
  let explanation: string;

  if (!isFraud) {
    selectedDefect = 'none';
    const goodExplanations = [
      "商品完好，符合退货标准。",
      "检查无误，是全新正品。",
      "包装完整，不仅没有瑕疵还很香。",
      "吊牌齐全，未剪标。",
      "配件都在，功能正常。"
    ];
    explanation = goodExplanations[Math.floor(Math.random() * goodExplanations.length)];
  } else {
    // Select a valid defect for the item type
    let validDefects: string[] = [];
    if (['clothing_top', 'clothing_dress', 'bag'].includes(template.itemType)) {
      validDefects = ['stain', 'tear', 'broken_tag'];
    } else if (template.itemType === 'shoe') {
      validDefects = ['stain', 'missing_component', 'broken_tag'];
    } else { // electronics
      validDefects = ['broken_seal', 'missing_component', 'stain'];
    }
    
    selectedDefect = validDefects[Math.floor(Math.random() * validDefects.length)];
    
    // Generate context-aware explanation
    if (selectedDefect === 'stain') {
      const stains = ["领口有明显粉底渍。", "袖口沾到了咖啡渍。", "表面有不明油渍。", "底部有泥土痕迹。"];
      explanation = stains[Math.floor(Math.random() * stains.length)];
    }
    else if (selectedDefect === 'tear') {
      const tears = ["腋下连接处开线了。", "面料被划破了一道口子。", "底部有明显磨损破洞。", "拉链处撕裂。"];
      explanation = tears[Math.floor(Math.random() * tears.length)];
    }
    else if (selectedDefect === 'broken_tag') {
      const tags = ["防盗扣已被暴力拆除。", "吊牌是后挂上去的，没有原厂线。", "吊牌丢失。", "七天无理由退货必须吊牌完好。"];
      explanation = tags[Math.floor(Math.random() * tags.length)];
    }
    else if (selectedDefect === 'missing_component') {
      const missing = ["包装内缺少充电线。", "少了一只鞋带。", "说明书和保修卡丢失。", "关键配件缺失。"];
      explanation = missing[Math.floor(Math.random() * missing.length)];
    }
    else if (selectedDefect === 'broken_seal') {
      const seals = ["一次性封条已被撕开。", "密封贴有重复粘贴痕迹。", "盒子明显被打开过。", "防拆标破损。"];
      explanation = seals[Math.floor(Math.random() * seals.length)];
    }
    else {
      explanation = "商品存在严重瑕疵，不符合入库标准。";
    }
  }

  return {
    id: crypto.randomUUID(),
    name: template.name,
    category: template.category,
    itemType: template.itemType,
    material: template.material,
    description: template.desc,
    visualDefects: [selectedDefect],
    isFraud: isFraud,
    color: template.color,
    explanation: explanation
  };
};

export const generateReturnBatch = async (level: number, count: number): Promise<ReturnItem[]> => {
  const modelId = "gemini-2.5-flash";
  
  // 1. FAST PATH: Use local generator immediately for a portion of requests to reduce load times
  // If we just need data, use local generator. It's instant (<1ms).
  const localItems = Array.from({ length: count }).map((_, i) => generateFallbackItem(i));

  // 2. TIMEOUT RACE:
  // We try to fetch from Gemini to get "AI creativity", but we strictly cap the wait time at 800ms.
  // If API is slower than 800ms, we just return the local items to ensure a snappy UI.
  // This effectively solves the "loading too long" issue while keeping AI as a "progressive enhancement".
  
  const prompt = `
    生成 ${count} 个电商退货商品数据。
    严格从列表选择 name: "纯棉T恤", "牛仔外套", "碎花连衣裙", "晚礼服", "运动跑鞋", "休闲板鞋", "无线鼠标", "蓝牙耳机", "智能手机", "笔记本电脑", "双肩背包", "手提包"。
    属性: itemType (clothing_top/clothing_dress/shoe/electronics/bag), material, description, visualDefects (stain/tear/broken_tag/missing_component/broken_seal/none), isFraud (bool), color (hex), explanation.
    混合好坏品。JSON Array格式。
  `;

  const fetchPromise = ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchSchema,
        temperature: 0.9,
      },
    })
    .then(response => {
       const text = response.text || '[]';
       let data;
       try {
           data = JSON.parse(text);
       } catch {
           const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
           data = jsonMatch ? JSON.parse(jsonMatch[0] || jsonMatch[1]) : [];
       }
       return data.map((item: any) => ({ id: crypto.randomUUID(), ...item }));
    })
    .catch(e => {
        // This catch block will now capture the "Invalid API Key" error
        // and gracefully fallback to local data instead of crashing the app.
        console.warn("Gemini fetch failed (using fallback):", e);
        return localItems;
    });

  const timeoutPromise = new Promise<ReturnItem[]>((resolve) => {
    // 800ms Timeout. If API is faster, great. If not, we don't wait.
    setTimeout(() => {
        resolve(localItems);
    }, 800); 
  });

  // Race API vs Timeout
  return Promise.race([fetchPromise, timeoutPromise]);
};