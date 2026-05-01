
const fs = require('fs');

['ca', 'es', 'en'].forEach(lang => {
  const path = './src/locales/' + lang + '/common.json';
  const file = fs.readFileSync(path, 'utf-8');
  const json = JSON.parse(file);
  
  const text = lang === 'en' ? 'Select...' : 'Selecciona...';
  
  if (!json.profile) json.profile = {};
  json.profile.selectCountry = text;
  json.profile.selectState = text;
  json.profile.selectCity = text;
  
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  console.log('Placeholders updated for ' + lang);
});

