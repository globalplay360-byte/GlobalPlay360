const fs = require('fs');
const path = require('path');

const locales = ['ca', 'es', 'en'];

const updates = {
  ca: {
    coverLetterPlaceholderPlayer: "Explica al club per què encaixes en aquesta posició i quines són les teves virtuts com a jugador/a...",
    coverLetterPlaceholderCoach: "Explica al club què pots aportar com a entrenador/a i per què ets la persona ideal per a aquest projecte esportiu..."
  },
  es: {
    coverLetterPlaceholderPlayer: "Explica al club por qué encajas en esta posición y cuáles son tus virtudes como jugador/a...",
    coverLetterPlaceholderCoach: "Explica al club qué puedes aportar como entrenador/a y por qué eres la persona ideal para este proyecto deportivo..."
  },
  en: {
    coverLetterPlaceholderPlayer: "Explain to the club why you fit this position and what your strengths as a player are...",
    coverLetterPlaceholderCoach: "Explain to the club what you can bring as a coach and why you are the ideal person for this sporting project..."
  }
};

locales.forEach(lang => {
  const p = path.join('src', 'locales', lang, 'common.json');
  if (fs.existsSync(p)) {
    let json = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!json.opportunityDetail) json.opportunityDetail = {};
    
    json.opportunityDetail.coverLetterPlaceholderPlayer = updates[lang].coverLetterPlaceholderPlayer;
    json.opportunityDetail.coverLetterPlaceholderCoach = updates[lang].coverLetterPlaceholderCoach;
    
    fs.writeFileSync(p, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log('Updated ' + lang + ' translations.');
  }
});
