import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReturnItem, VisualDefect, ItemType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateReturnBatch = async (level: number, count: number): Promise<ReturnItem[]> => {
  const modelId = "gemini-2.5-flash";
  
  // Difficulty increases the subtlety or probability of defects
  // Level 1: Very obvious defects.
  // Level 5: More subtle or mixed items.
  
  const prompt = `
    生成 ${count} 个电商退货商品数据，用于视觉找茬游戏。
    
    目标：玩家需要看图判断商品是否有瑕疵（Fraud）。
    
    规则：
    1. 物品类型 (itemType): clothing_top (上衣), clothing_dress (裙子), shoe (鞋), electronics (数码), bag (包)。
    2. 材质 (material): 例如 "100%纯棉", "真皮", "聚酯纤维", "ABS塑料"。
    3. 描述 (description): 商品的简短营销描述，例如 "复古风格的夏季连衣裙，透气舒适"。
    4. 瑕疵类型 (visualDefects): 
       - 'stain' (污渍 - 针对衣服/鞋)
       - 'tear' (破损/裂口 - 针对衣服/包)
       - 'broken_tag' (吊牌断裂/被拆 - 针对衣服)
       - 'missing_component' (配件缺失 - 针对数码/鞋)
       - 'broken_seal' (密封条损坏 - 针对数码)
       - 'none' (完好无损)
    5. 判定 (isFraud): 
       - 如果 visualDefects 包含 'none'，则 isFraud 为 false。
       - 如果 visualDefects 包含其他任何瑕疵，则 isFraud 为 true。
    6. 颜色 (color): 给出适合该商品的十六进制颜色代码 (例如 #FFB6C1)。
    7. 解释 (explanation): 一句简短的中文解释，用于判断后展示 (例如 "袖口有明显咖啡渍", "显卡防静电袋被撕开了", "吊牌完好，可以通过").

    请生成多样化的数据，混合正品和瑕疵品（大约 50% 概率欺诈）。
    如果是 'female' 类别，多生成 clothing_dress, bag。
    如果是 'male' 类别，多生成 electronics, shoe, clothing_top。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchSchema,
        temperature: 0.9,
      },
    });

    const data = JSON.parse(response.text || '[]') as any[];
    
    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      ...item
    }));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback data
    return [
      {
        id: crypto.randomUUID(),
        name: "真丝连衣裙",
        category: "female",
        itemType: "clothing_dress",
        material: "100% 桑蚕丝",
        description: "高端定制，触感丝滑，适合夏季晚宴穿着。",
        visualDefects: ["stain"],
        isFraud: true,
        color: "#FBCFE8",
        explanation: "裙摆处有一大块油渍。"
      },
      {
        id: crypto.randomUUID(),
        name: "无线游戏鼠标",
        category: "male",
        itemType: "electronics",
        material: "ABS工程塑料",
        description: "职业电竞级传感器，超长续航，人体工学设计。",
        visualDefects: ["none"],
        isFraud: false,
        color: "#1F2937",
        explanation: "密封条完好，未拆封。"
      },
      {
        id: crypto.randomUUID(),
        name: "限量球鞋",
        category: "male",
        itemType: "shoe",
        material: "合成革 + 网布",
        description: "联名限量款，透气减震，街头潮流必备。",
        visualDefects: ["missing_component"],
        isFraud: true,
        color: "#60A5FA",
        explanation: "鞋带扣配件缺失。"
      },
      {
        id: crypto.randomUUID(),
        name: "羊毛大衣",
        category: "female",
        itemType: "clothing_top",
        material: "80% 羊毛",
        description: "经典双排扣设计，保暖修身，冬季通勤首选。",
        visualDefects: ["broken_tag"],
        isFraud: true,
        color: "#D1D5DB",
        explanation: "防盗扣已经被暴力拆除。"
      }
    ];
  }
};