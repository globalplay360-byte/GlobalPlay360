const fs = require('fs');

let file = fs.readFileSync('src/pages/dashboard/OpportunitiesPage.tsx', 'utf8');

// Title: font-semibold text-gray-100/90 tracking-tight => font-normal text-[#EAB308] tracking-tight
file = file.replace(
  'h3 className="text-[1.2rem] sm:text-[1.3rem] font-semibold text-gray-100/90 tracking-tight leading-snug line-clamp-2 flex-1 group-hover:text-gray-100 transition-colors duration-fast"',
  'h3 className="text-[1.2rem] sm:text-[1.3rem] font-normal text-[#EAB308] tracking-tight leading-snug line-clamp-2 flex-1 group-hover:text-[#EAB308]/90 transition-colors duration-fast"'
);

// Ver Detalle button: text-gray-200 bg-[#1F2937]/40 border border-[#1F2937] hover:bg-[#1F2937]/80 hover:border-[#374151]
file = file.replace(
  'className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium tracking-wide text-gray-200 bg-[#1F2937]/40 border border-[#1F2937] hover:bg-[#1F2937]/80 hover:border-[#374151] rounded-lg transition-all duration-fast active:scale-[0.98]"',
  'className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium tracking-wide text-[#EAB308] bg-[#1F2937]/40 border border-[#1F2937] hover:bg-[#EAB308]/10 hover:border-[#EAB308]/30 rounded-lg transition-all duration-fast active:scale-[0.98]"'
);

// React select size
file = file.replace(
  /color: '\#F3F4F6',\s*\n\s*cursor/g,
  "color: '#F3F4F6',\n    fontSize: '13.5px',\n    cursor"
);

file = file.replace(
  /singleValue: \(base: any\) => \(\{\n\s*\.\.\.base,\n\s*color: '\#F3F4F6',\n\s*\}\)/g,
  "singleValue: (base: any) => ({\n    ...base,\n    color: '#F3F4F6',\n    fontSize: '13.5px',\n  })"
);

file = file.replace(
  /placeholder: \(base: any\) => \(\{\n\s*\.\.\.base,\n\s*color: '\#9CA3AF',\n\s*\}\)/g,
  "placeholder: (base: any) => ({\n    ...base,\n    color: '#9CA3AF',\n    fontSize: '13.5px',\n  })"
);

file = file.replace(
  /input: \(base: any\) => \(\{\n\s*\.\.\.base,\n\s*color: '\#F3F4F6',\n\s*\}\)/g,
  "input: (base: any) => ({\n    ...base,\n    color: '#F3F4F6',\n    fontSize: '13.5px',\n  })"
);

fs.writeFileSync('src/pages/dashboard/OpportunitiesPage.tsx', file);
