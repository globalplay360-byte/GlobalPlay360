
const fs = require('fs');
let content = fs.readFileSync('src/components/profile/ProfileView.tsx', 'utf8');

content = content.replace(/user\.profileImage/g, 'user.photoURL');
content = content.replace(/user\.positions && user\.positions\.length > 0/g, 'user.position');
content = content.replace(/user\.positions\.map[\\s\\S]*?\\)\\)/g, '<Badge variant=\\'default\\'>{user.position}</Badge>');
content = content.replace(/user\.url/g, 'user.youtubeVideoUrl');
content = content.replace(/user\.socialConfig && \\(user\.socialConfig\.instagram \\|\\| user\.socialConfig\.twitter\\) &&/g, 'user.instagram &&');
content = content.replace(/user\.socialConfig\\.instagram/g, 'user.instagram');

fs.writeFileSync('src/components/profile/ProfileView.tsx', content);
