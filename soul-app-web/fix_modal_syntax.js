import fs from 'fs';

let content = fs.readFileSync('src/components/UserProfileModal.tsx', 'utf8');
// Fix the escaping issue that bash heredoc caused \`\${...}\` -> `\${...}`
content = content.replace(/animate=\{\{ height: \['4px', \\\`\\\$\\{Math\.random\(\) \* 20 \+ 4\\}px\\\`, '4px'\] \}\}/,
"animate={{ height: ['4px', `${Math.random() * 20 + 4}px`, '4px'] }}");

fs.writeFileSync('src/components/UserProfileModal.tsx', content);
