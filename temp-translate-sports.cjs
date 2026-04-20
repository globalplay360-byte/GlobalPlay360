const fs = require('fs');
const glob = require('fs').readdirSync('src/components/profile/sports').filter(f => f.endsWith('.tsx') && f !== 'index.tsx');

const i18nImports = "import { useTranslation } from 'react-i18next';";

for (const file of glob) {
  const path = 'src/components/profile/sports/' + file;
  let text = fs.readFileSync(path, 'utf-8');
  
  if (!text.includes('useTranslation')) {
    text = text.replace(/import \{.*\} from '.*';/, match => i18nImports + '\n' + match);
  }
  
  if (!text.includes('const { t } = useTranslation();')) {
    text = text.replace(/export default function .*(\(.*Props\).* {)/, 'export default function $1\n  const { t } = useTranslation();');
  }

  // Common replacements
  text = text.replace(/>Detalls de [^<]*</g, match => `>{t('sports.details', '${match.slice(1, -1)}')}<`);
  text = text.replace(/label="Posició"/g, "label={t('profileEdit.fields.position', 'Posició')}");
  text = text.replace(/label="Cama bona"/g, "label={t('profileEdit.fields.preferredFoot', 'Cama bona')}");
  text = text.replace(/label="Mà bona"/g, "label={t('profileEdit.fields.preferredHand', 'Mà bona')}");
  text = text.replace(/label="Braç de joc"/g, "label={t('profileEdit.fields.playingHand', 'Braç de joc')}");
  text = text.replace(/label="Agafament de l'estic \(Hand\)"/g, "label={t('profileEdit.fields.stickHand', \"Agafament de l'estic (Hand)\")}");
  text = text.replace(/label="Revers \(Backhand\)"/g, "label={t('profileEdit.fields.backhandType', 'Revers (Backhand)')}");
  text = text.replace(/label="Envergadura \(Wingspan\)"/g, "label={t('profileEdit.fields.wingspan', 'Envergadura (Wingspan)')}");
  text = text.replace(/hint="En centímetres."/g, "hint={t('profileEdit.hints.centimeters', 'En centímetres.')}");
  text = text.replace(/label="Alçada en remat \(Spike Reach\)"/g, "label={t('profileEdit.fields.spikeReach', 'Alçada en remat (Spike Reach)')}");
  
  text = text.replace(/>Selecciona...</g, ">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}<");
  text = text.replace(/>Dreta</g, ">{t('profileEdit.fields.right', 'Dreta')}<");
  text = text.replace(/>Esquerra</g, ">{t('profileEdit.fields.left', 'Esquerra')}<");
  text = text.replace(/>Ambidextre</g, ">{t('profileEdit.fields.both', 'Ambidextre')}<");
  text = text.replace(/>Dretà</g, ">{t('profileEdit.fields.rightHanded', 'Dretà')}<");
  text = text.replace(/>Esquerrà</g, ">{t('profileEdit.fields.leftHanded', 'Esquerrà')}<");
  text = text.replace(/>A una mà</g, ">{t('profileEdit.fields.oneHanded', 'A una mà')}<");
  text = text.replace(/>A dues mans</g, ">{t('profileEdit.fields.twoHanded', 'A dues mans')}<");
  
  text = text.replace(/>\{p\}<\/option>/g, ">{t(`sports.positions.${p.toLowerCase().replace(/ /g, '')}`, p)}</option>");
  
  fs.writeFileSync(path, text);
}
console.log('Translated sports specific fields');
