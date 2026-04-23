
const fs = require('fs');

const data = {
  ca: {
    'opportunityForm.fields.targetRoleLabel': 'Quin perfil busques?',
    'opportunityForm.targetRole.player': 'Jugador/a',
    'opportunityForm.targetRole.coach': 'Entrenador/a',
    'opportunityForm.targetRole.both': 'Tots dos',
    'opportunities.filters.allTargetRoles': 'Tots els perfils'
  },
  es: {
    'opportunityForm.fields.targetRoleLabel': '¿Qué perfil buscas?',
    'opportunityForm.targetRole.player': 'Jugador/a',
    'opportunityForm.targetRole.coach': 'Entrenador/a',
    'opportunityForm.targetRole.both': 'Ambos',
    'opportunities.filters.allTargetRoles': 'Todos los perfiles'
  },
  en: {
    'opportunityForm.fields.targetRoleLabel': 'What profile are you looking for?',
    'opportunityForm.targetRole.player': 'Player',
    'opportunityForm.targetRole.coach': 'Coach',
    'opportunityForm.targetRole.both': 'Both',
    'opportunities.filters.allTargetRoles': 'All profiles'
  }
};

['ca', 'es', 'en'].forEach(lang => {
  const path = './src/locales/' + lang + '/common.json';
  const file = fs.readFileSync(path, 'utf-8');
  const json = JSON.parse(file);
  
  if (!json.opportunityForm) json.opportunityForm = {};
  if (!json.opportunityForm.fields) json.opportunityForm.fields = {};
  if (!json.opportunityForm.targetRole) json.opportunityForm.targetRole = {};
  if (!json.opportunities.filters) json.opportunities.filters = {};
  
  json.opportunityForm.fields.targetRoleLabel = data[lang]['opportunityForm.fields.targetRoleLabel'];
  json.opportunityForm.targetRole.player = data[lang]['opportunityForm.targetRole.player'];
  json.opportunityForm.targetRole.coach = data[lang]['opportunityForm.targetRole.coach'];
  json.opportunityForm.targetRole.both = data[lang]['opportunityForm.targetRole.both'];
  json.opportunities.filters.allTargetRoles = data[lang]['opportunities.filters.allTargetRoles'];
  
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  console.log('updated ' + lang);
});

