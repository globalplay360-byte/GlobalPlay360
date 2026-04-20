const fs = require('fs');
const file = 'src/pages/dashboard/BillingPage.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/>Pla Premium</g, ">{t('billing.card.premiumPlan', 'Pla Premium')}<");
txt = txt.replace(/>Subscripció GlobalPlay360</g, ">{t('billing.card.globalPlaySub', 'Subscripció GlobalPlay360')}<");
txt = txt.replace(/>Facturació</g, ">{t('billing.card.billing', 'Facturació')}<"); 
txt = txt.replace(/>Gestionada per Stripe</g, ">{t('billing.card.managedByStripe', 'Gestionada per Stripe')}<");
txt = txt.replace(/>Gestionar subscripció</g, ">{t('billing.portal.title', 'Gestionar subscripció')}<");
txt = txt.replace(
  />\s*Cancel·la.*?Stripe\.\s*</g,
  ">{t('billing.portal.description', 'Cancel·la, actualitza el mètode de pagament o descarrega factures al portal segur de Stripe.')}<"
);
txt = txt.replace(/'Obrint portal\.\.\.'/g, "t('billing.portal.opening', 'Obrint portal...')");
txt = txt.replace(/>\s*Obrir portal de Stripe\s*</g, "\n              {t('billing.portal.button', 'Obrir portal de Stripe')}\n              <");
txt = txt.replace(
  />\s*Seràs redirigit a una pàgina segura allotjada per Stripe\. Un cop acabis, tornaràs aquí automàticament\.\s*</g,
  ">{t('billing.portal.redirectNotice', 'Seràs redirigit a una pàgina segura allotjada per Stripe. Un cop acabis, tornaràs aquí automàticament.')}<"
);

fs.writeFileSync(file, txt);
console.log('Finished missing strings in BillingPage');
