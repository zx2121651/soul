import fs from 'fs';
let content = fs.readFileSync('src/pages/MePage.tsx', 'utf8');

const nameTagsRepl = `
        <div className="mt-4">
          <h2 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
            自己 (Me)
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest italic shadow-sm transform -skew-x-6">VIP</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-[#8E5E99]/20 text-[#D7BDE2] px-2 py-1 rounded-md font-medium border border-[#8E5E99]/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D7BDE2]"></div>
              INTJ 建筑师
            </span>
            <span className="flex items-center gap-1 bg-[#4A8F85]/20 text-[#A3E4D7] px-2 py-1 rounded-md font-medium border border-[#4A8F85]/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A3E4D7]"></div>
              引力签: 艺术控
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md">
              ♀ 22岁 · 杭州
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1">
              🎮 蒸汽平台 1k+h
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-3 leading-relaxed">宇宙很大，生活更大。探索中... ✨</p>
        </div>
`;

content = content.replace(/<div className="mt-4">\s*<h2[\s\S]*?<\/p>\s*<\/div>/, nameTagsRepl);

content = content.replace(/<div className="aspect-square bg-\[#1c1e2b\] relative overflow-hidden">/g, `<div className="aspect-square bg-[#1c1e2b] relative overflow-hidden group cursor-pointer">`);
content = content.replace(/className="w-full h-full object-cover"/g, 'className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"');
content = content.replace(/border border-dashed border-white\/20/g, 'border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition-colors active:scale-95');
content = content.replace(/"今天天气真好，去西湖边喝了咖啡。"/g, '&quot;今天天气真好，去西湖边喝了咖啡。&quot;');

fs.writeFileSync('src/pages/MePage.tsx', content);
