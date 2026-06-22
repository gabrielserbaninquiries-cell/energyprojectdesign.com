// V10.6 — i18next config for global EPD platform
// Supports 24 major world languages with browser auto-detection.
// User explicit request: "site-ul va avea traducere in toate limbile pamantului"
//
// Translations are kept SHORT for the language switcher initially — they cover
// the most visible UI strings (header nav, hero CTAs, common buttons). Each
// locale auto-falls back to RO if a key is missing.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Core lexicon — focuses on the strings users see first
const resources = {
  ro: { translation: {
    nav: { home: 'Acasă', services: 'Servicii', pricing: 'Tarife', investors: 'Investitori', contact: 'Contact', login: 'Autentificare', register: 'Creează cont' },
    hero: { tagline: 'Redesigning projects.', cta_gas: 'Începe proiect gaze', cta_pricing: 'Vezi tarifele', cta_investors: 'Investitori →' },
    common: { learn_more: 'Află mai multe', start: 'Începe', loading: 'Se încarcă...', save: 'Salvează', cancel: 'Anulează', delete: 'Șterge', download: 'Descarcă', upload: 'Încarcă' },
    misiune: { eyebrow: '// Misiunea EPD', title: 'Platforma nr. 1 în lume, multifuncțională', subtitle: 'Pentru toate tipurile de energie, infrastructuri, transport, construcții, retail, aviație, spațial — și multe altele.' },
  } },
  en: { translation: {
    nav: { home: 'Home', services: 'Services', pricing: 'Pricing', investors: 'Investors', contact: 'Contact', login: 'Sign in', register: 'Create account' },
    hero: { tagline: 'Redesigning projects.', cta_gas: 'Start gas project', cta_pricing: 'See pricing', cta_investors: 'Investors →' },
    common: { learn_more: 'Learn more', start: 'Start', loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', download: 'Download', upload: 'Upload' },
    misiune: { eyebrow: '// EPD Mission', title: 'World’s #1 multifunctional platform', subtitle: 'For every type of energy, infrastructure, transport, construction, retail, aviation, space — and many more.' },
  } },
  es: { translation: {
    nav: { home: 'Inicio', services: 'Servicios', pricing: 'Precios', investors: 'Inversores', contact: 'Contacto', login: 'Iniciar sesión', register: 'Crear cuenta' },
    hero: { tagline: 'Rediseñando proyectos.', cta_gas: 'Iniciar proyecto de gas', cta_pricing: 'Ver precios', cta_investors: 'Inversores →' },
    common: { learn_more: 'Más información', start: 'Empezar', loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', download: 'Descargar', upload: 'Subir' },
    misiune: { eyebrow: '// Misión EPD', title: 'La plataforma multifuncional Nº1 del mundo', subtitle: 'Para todo tipo de energía, infraestructura, transporte, construcción, retail, aviación, espacio — y mucho más.' },
  } },
  fr: { translation: {
    nav: { home: 'Accueil', services: 'Services', pricing: 'Tarifs', investors: 'Investisseurs', contact: 'Contact', login: 'Se connecter', register: 'Créer un compte' },
    hero: { tagline: 'Repenser les projets.', cta_gas: 'Démarrer projet gaz', cta_pricing: 'Voir les tarifs', cta_investors: 'Investisseurs →' },
    common: { learn_more: 'En savoir plus', start: 'Démarrer', loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', download: 'Télécharger', upload: 'Envoyer' },
    misiune: { eyebrow: '// Mission EPD', title: 'Plateforme multifonctionnelle n°1 mondiale', subtitle: 'Pour tous types d’énergie, infrastructure, transport, construction, commerce, aviation, spatial — et bien plus.' },
  } },
  de: { translation: {
    nav: { home: 'Start', services: 'Dienstleistungen', pricing: 'Preise', investors: 'Investoren', contact: 'Kontakt', login: 'Anmelden', register: 'Konto erstellen' },
    hero: { tagline: 'Projekte neu denken.', cta_gas: 'Gasprojekt starten', cta_pricing: 'Preise ansehen', cta_investors: 'Investoren →' },
    common: { learn_more: 'Mehr erfahren', start: 'Start', loading: 'Lädt...', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', download: 'Herunterladen', upload: 'Hochladen' },
    misiune: { eyebrow: '// EPD-Mission', title: 'Die weltweit führende Multifunktionsplattform', subtitle: 'Für alle Arten von Energie, Infrastruktur, Transport, Bau, Einzelhandel, Luftfahrt, Raumfahrt — und vieles mehr.' },
  } },
  it: { translation: {
    nav: { home: 'Home', services: 'Servizi', pricing: 'Prezzi', investors: 'Investitori', contact: 'Contatti', login: 'Accedi', register: 'Crea account' },
    hero: { tagline: 'Riprogettare i progetti.', cta_gas: 'Avvia progetto gas', cta_pricing: 'Vedi i prezzi', cta_investors: 'Investitori →' },
    common: { learn_more: 'Scopri di più', start: 'Inizia', loading: 'Caricamento...', save: 'Salva', cancel: 'Annulla', delete: 'Elimina', download: 'Scarica', upload: 'Carica' },
    misiune: { eyebrow: '// Missione EPD', title: 'La piattaforma multifunzionale n°1 al mondo', subtitle: 'Per ogni tipo di energia, infrastruttura, trasporto, costruzione, retail, aviazione, spazio — e molto altro.' },
  } },
  pt: { translation: {
    nav: { home: 'Início', services: 'Serviços', pricing: 'Preços', investors: 'Investidores', contact: 'Contato', login: 'Entrar', register: 'Criar conta' },
    hero: { tagline: 'Reinventando projetos.', cta_gas: 'Iniciar projeto de gás', cta_pricing: 'Ver preços', cta_investors: 'Investidores →' },
    common: { learn_more: 'Saiba mais', start: 'Começar', loading: 'Carregando...', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', download: 'Baixar', upload: 'Enviar' },
    misiune: { eyebrow: '// Missão EPD', title: 'Plataforma multifuncional nº 1 do mundo', subtitle: 'Para todo tipo de energia, infraestrutura, transporte, construção, varejo, aviação, espacial — e muito mais.' },
  } },
  nl: { translation: {
    nav: { home: 'Home', services: 'Diensten', pricing: 'Prijzen', investors: 'Investeerders', contact: 'Contact', login: 'Inloggen', register: 'Account aanmaken' },
    hero: { tagline: 'Projecten herontwerpen.', cta_gas: 'Gasproject starten', cta_pricing: 'Tarieven bekijken', cta_investors: 'Investeerders →' },
    common: { learn_more: 'Meer weten', start: 'Beginnen', loading: 'Laden...', save: 'Opslaan', cancel: 'Annuleren', delete: 'Verwijderen', download: 'Downloaden', upload: 'Uploaden' },
    misiune: { eyebrow: '// EPD-missie', title: 'Het beste multifunctionele platform ter wereld', subtitle: 'Voor elk type energie, infrastructuur, transport, bouw, retail, luchtvaart, ruimtevaart — en nog veel meer.' },
  } },
  pl: { translation: {
    nav: { home: 'Strona główna', services: 'Usługi', pricing: 'Cennik', investors: 'Inwestorzy', contact: 'Kontakt', login: 'Zaloguj się', register: 'Utwórz konto' },
    hero: { tagline: 'Przeprojektowujemy projekty.', cta_gas: 'Rozpocznij projekt gazowy', cta_pricing: 'Zobacz cennik', cta_investors: 'Inwestorzy →' },
    common: { learn_more: 'Dowiedz się więcej', start: 'Start', loading: 'Ładowanie...', save: 'Zapisz', cancel: 'Anuluj', delete: 'Usuń', download: 'Pobierz', upload: 'Prześlij' },
    misiune: { eyebrow: '// Misja EPD', title: 'Wielofunkcyjna platforma nr 1 na świecie', subtitle: 'Dla każdego rodzaju energii, infrastruktury, transportu, budownictwa, handlu, lotnictwa, kosmosu — i wielu innych.' },
  } },
  uk: { translation: {
    nav: { home: 'Головна', services: 'Послуги', pricing: 'Тарифи', investors: 'Інвестори', contact: 'Контакти', login: 'Увійти', register: 'Створити акаунт' },
    hero: { tagline: 'Переосмислюємо проєкти.', cta_gas: 'Розпочати газовий проєкт', cta_pricing: 'Переглянути тарифи', cta_investors: 'Інвестори →' },
    common: { learn_more: 'Дізнатися більше', start: 'Почати', loading: 'Завантаження...', save: 'Зберегти', cancel: 'Скасувати', delete: 'Видалити', download: 'Завантажити', upload: 'Завантажити' },
    misiune: { eyebrow: '// Місія EPD', title: 'Багатофункціональна платформа №1 у світі', subtitle: 'Для всіх видів енергії, інфраструктури, транспорту, будівництва, роздрібної торгівлі, авіації, космосу — і не тільки.' },
  } },
  ru: { translation: {
    nav: { home: 'Главная', services: 'Услуги', pricing: 'Тарифы', investors: 'Инвесторы', contact: 'Контакты', login: 'Войти', register: 'Создать аккаунт' },
    hero: { tagline: 'Переосмысливаем проекты.', cta_gas: 'Начать газовый проект', cta_pricing: 'Посмотреть тарифы', cta_investors: 'Инвесторы →' },
    common: { learn_more: 'Узнать больше', start: 'Начать', loading: 'Загрузка...', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', download: 'Скачать', upload: 'Загрузить' },
    misiune: { eyebrow: '// Миссия EPD', title: 'Многофункциональная платформа №1 в мире', subtitle: 'Для всех видов энергии, инфраструктуры, транспорта, строительства, ритейла, авиации, космоса — и многого другого.' },
  } },
  tr: { translation: {
    nav: { home: 'Ana sayfa', services: 'Hizmetler', pricing: 'Fiyatlandırma', investors: 'Yatırımcılar', contact: 'İletişim', login: 'Giriş yap', register: 'Hesap oluştur' },
    hero: { tagline: 'Projeleri yeniden tasarlıyoruz.', cta_gas: 'Gaz projesini başlat', cta_pricing: 'Fiyatları görüntüle', cta_investors: 'Yatırımcılar →' },
    common: { learn_more: 'Daha fazla bilgi', start: 'Başla', loading: 'Yükleniyor...', save: 'Kaydet', cancel: 'İptal', delete: 'Sil', download: 'İndir', upload: 'Yükle' },
    misiune: { eyebrow: '// EPD Misyonu', title: 'Dünyanın 1 numaralı çok fonksiyonlu platformu', subtitle: 'Her tür enerji, altyapı, ulaşım, inşaat, perakende, havacılık, uzay — ve çok daha fazlası için.' },
  } },
  ar: { translation: {
    nav: { home: 'الرئيسية', services: 'الخدمات', pricing: 'الأسعار', investors: 'المستثمرون', contact: 'اتصل بنا', login: 'تسجيل الدخول', register: 'إنشاء حساب' },
    hero: { tagline: 'إعادة تصميم المشاريع.', cta_gas: 'ابدأ مشروع الغاز', cta_pricing: 'عرض الأسعار', cta_investors: 'المستثمرون ←' },
    common: { learn_more: 'اعرف المزيد', start: 'ابدأ', loading: 'جارٍ التحميل...', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', download: 'تنزيل', upload: 'تحميل' },
    misiune: { eyebrow: '// مهمة EPD', title: 'منصة متعددة الوظائف الأولى في العالم', subtitle: 'لجميع أنواع الطاقة والبنية التحتية والنقل والبناء والتجزئة والطيران والفضاء — والمزيد.' },
  } },
  he: { translation: {
    nav: { home: 'בית', services: 'שירותים', pricing: 'תמחור', investors: 'משקיעים', contact: 'יצירת קשר', login: 'התחברות', register: 'צור חשבון' },
    hero: { tagline: 'מעצבים מחדש פרויקטים.', cta_gas: 'התחל פרויקט גז', cta_pricing: 'צפה במחירים', cta_investors: 'משקיעים ←' },
    common: { learn_more: 'למידע נוסף', start: 'התחל', loading: 'טוען...', save: 'שמור', cancel: 'בטל', delete: 'מחק', download: 'הורד', upload: 'העלה' },
    misiune: { eyebrow: '// משימת EPD', title: 'הפלטפורמה הרב-תכליתית מספר 1 בעולם', subtitle: 'לכל סוג של אנרגיה, תשתית, תחבורה, בנייה, קמעונאות, תעופה, חלל — ועוד הרבה.' },
  } },
  hi: { translation: {
    nav: { home: 'होम', services: 'सेवाएं', pricing: 'मूल्य निर्धारण', investors: 'निवेशक', contact: 'संपर्क', login: 'साइन इन', register: 'खाता बनाएं' },
    hero: { tagline: 'परियोजनाओं को पुनः डिज़ाइन करना।', cta_gas: 'गैस परियोजना शुरू करें', cta_pricing: 'मूल्य देखें', cta_investors: 'निवेशक →' },
    common: { learn_more: 'और जानें', start: 'शुरू करें', loading: 'लोड हो रहा है...', save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं', download: 'डाउनलोड', upload: 'अपलोड' },
    misiune: { eyebrow: '// EPD मिशन', title: 'दुनिया का नंबर 1 बहु-कार्यात्मक प्लेटफ़ॉर्म', subtitle: 'हर प्रकार की ऊर्जा, बुनियादी ढाँचा, परिवहन, निर्माण, खुदरा, विमानन, अंतरिक्ष — और बहुत कुछ के लिए।' },
  } },
  zh: { translation: {
    nav: { home: '首页', services: '服务', pricing: '定价', investors: '投资者', contact: '联系', login: '登录', register: '创建账户' },
    hero: { tagline: '重新设计项目。', cta_gas: '开始燃气项目', cta_pricing: '查看价格', cta_investors: '投资者 →' },
    common: { learn_more: '了解更多', start: '开始', loading: '加载中...', save: '保存', cancel: '取消', delete: '删除', download: '下载', upload: '上传' },
    misiune: { eyebrow: '// EPD 使命', title: '全球第一的多功能平台', subtitle: '面向所有类型的能源、基础设施、交通、建筑、零售、航空、太空 — 以及更多领域。' },
  } },
  ja: { translation: {
    nav: { home: 'ホーム', services: 'サービス', pricing: '料金', investors: '投資家', contact: 'お問い合わせ', login: 'ログイン', register: 'アカウント作成' },
    hero: { tagline: 'プロジェクトを再設計する。', cta_gas: 'ガスプロジェクトを開始', cta_pricing: '料金を見る', cta_investors: '投資家 →' },
    common: { learn_more: '詳細を見る', start: '開始', loading: '読み込み中...', save: '保存', cancel: 'キャンセル', delete: '削除', download: 'ダウンロード', upload: 'アップロード' },
    misiune: { eyebrow: '// EPD ミッション', title: '世界No.1の多機能プラットフォーム', subtitle: 'あらゆる種類のエネルギー、インフラ、輸送、建設、小売、航空、宇宙 — そしてもっと多くのために。' },
  } },
  ko: { translation: {
    nav: { home: '홈', services: '서비스', pricing: '요금제', investors: '투자자', contact: '문의', login: '로그인', register: '계정 생성' },
    hero: { tagline: '프로젝트 재설계.', cta_gas: '가스 프로젝트 시작', cta_pricing: '요금 보기', cta_investors: '투자자 →' },
    common: { learn_more: '자세히 보기', start: '시작', loading: '로딩 중...', save: '저장', cancel: '취소', delete: '삭제', download: '다운로드', upload: '업로드' },
    misiune: { eyebrow: '// EPD 미션', title: '세계 1위 다기능 플랫폼', subtitle: '모든 종류의 에너지, 인프라, 운송, 건설, 소매, 항공, 우주 — 그리고 더 많은 분야를 위해.' },
  } },
  vi: { translation: {
    nav: { home: 'Trang chủ', services: 'Dịch vụ', pricing: 'Bảng giá', investors: 'Nhà đầu tư', contact: 'Liên hệ', login: 'Đăng nhập', register: 'Tạo tài khoản' },
    hero: { tagline: 'Thiết kế lại các dự án.', cta_gas: 'Bắt đầu dự án khí', cta_pricing: 'Xem bảng giá', cta_investors: 'Nhà đầu tư →' },
    common: { learn_more: 'Tìm hiểu thêm', start: 'Bắt đầu', loading: 'Đang tải...', save: 'Lưu', cancel: 'Hủy', delete: 'Xóa', download: 'Tải xuống', upload: 'Tải lên' },
    misiune: { eyebrow: '// Sứ mệnh EPD', title: 'Nền tảng đa chức năng số 1 thế giới', subtitle: 'Cho mọi loại năng lượng, cơ sở hạ tầng, vận tải, xây dựng, bán lẻ, hàng không, vũ trụ — và nhiều hơn nữa.' },
  } },
  th: { translation: {
    nav: { home: 'หน้าแรก', services: 'บริการ', pricing: 'ราคา', investors: 'นักลงทุน', contact: 'ติดต่อ', login: 'เข้าสู่ระบบ', register: 'สร้างบัญชี' },
    hero: { tagline: 'ออกแบบโปรเจกต์ใหม่.', cta_gas: 'เริ่มโปรเจกต์ก๊าซ', cta_pricing: 'ดูราคา', cta_investors: 'นักลงทุน →' },
    common: { learn_more: 'เรียนรู้เพิ่มเติม', start: 'เริ่ม', loading: 'กำลังโหลด...', save: 'บันทึก', cancel: 'ยกเลิก', delete: 'ลบ', download: 'ดาวน์โหลด', upload: 'อัปโหลด' },
    misiune: { eyebrow: '// พันธกิจ EPD', title: 'แพลตฟอร์มอันดับ 1 ของโลก', subtitle: 'สำหรับพลังงาน โครงสร้างพื้นฐาน การขนส่ง การก่อสร้าง การค้าปลีก การบิน และอวกาศ ทุกประเภท — และอีกมากมาย.' },
  } },
  el: { translation: {
    nav: { home: 'Αρχική', services: 'Υπηρεσίες', pricing: 'Τιμολόγηση', investors: 'Επενδυτές', contact: 'Επικοινωνία', login: 'Σύνδεση', register: 'Δημιουργία λογαριασμού' },
    hero: { tagline: 'Επανασχεδιάζουμε έργα.', cta_gas: 'Έναρξη έργου αερίου', cta_pricing: 'Δείτε τιμές', cta_investors: 'Επενδυτές →' },
    common: { learn_more: 'Μάθετε περισσότερα', start: 'Έναρξη', loading: 'Φόρτωση...', save: 'Αποθήκευση', cancel: 'Ακύρωση', delete: 'Διαγραφή', download: 'Λήψη', upload: 'Μεταφόρτωση' },
    misiune: { eyebrow: '// Αποστολή EPD', title: 'Η Νο. 1 πολυλειτουργική πλατφόρμα στον κόσμο', subtitle: 'Για κάθε τύπο ενέργειας, υποδομής, μεταφορών, κατασκευών, λιανικής, αεροπορίας, διαστήματος — και πολλά άλλα.' },
  } },
  hu: { translation: {
    nav: { home: 'Főoldal', services: 'Szolgáltatások', pricing: 'Árazás', investors: 'Befektetők', contact: 'Kapcsolat', login: 'Bejelentkezés', register: 'Fiók létrehozása' },
    hero: { tagline: 'Újratervezzük a projekteket.', cta_gas: 'Gázprojekt indítása', cta_pricing: 'Árak megtekintése', cta_investors: 'Befektetők →' },
    common: { learn_more: 'Tudj meg többet', start: 'Indítás', loading: 'Betöltés...', save: 'Mentés', cancel: 'Mégse', delete: 'Törlés', download: 'Letöltés', upload: 'Feltöltés' },
    misiune: { eyebrow: '// EPD küldetés', title: 'A világ 1. számú multifunkciós platformja', subtitle: 'Mindenféle energiához, infrastruktúrához, közlekedéshez, építkezéshez, kiskereskedelemhez, repüléshez, űrkutatáshoz — és sok máshoz.' },
  } },
  cs: { translation: {
    nav: { home: 'Domů', services: 'Služby', pricing: 'Ceník', investors: 'Investoři', contact: 'Kontakt', login: 'Přihlásit', register: 'Vytvořit účet' },
    hero: { tagline: 'Předesignujeme projekty.', cta_gas: 'Začít plynový projekt', cta_pricing: 'Zobrazit ceny', cta_investors: 'Investoři →' },
    common: { learn_more: 'Více informací', start: 'Začít', loading: 'Načítání...', save: 'Uložit', cancel: 'Zrušit', delete: 'Smazat', download: 'Stáhnout', upload: 'Nahrát' },
    misiune: { eyebrow: '// Mise EPD', title: 'Multifunkční platforma č. 1 na světě', subtitle: 'Pro všechny druhy energie, infrastruktury, dopravy, stavebnictví, maloobchodu, letectví, vesmíru — a mnoho dalšího.' },
  } },
  bg: { translation: {
    nav: { home: 'Начало', services: 'Услуги', pricing: 'Цени', investors: 'Инвеститори', contact: 'Контакт', login: 'Вход', register: 'Създай акаунт' },
    hero: { tagline: 'Препроектираме проекти.', cta_gas: 'Започни газов проект', cta_pricing: 'Виж цените', cta_investors: 'Инвеститори →' },
    common: { learn_more: 'Научи повече', start: 'Начало', loading: 'Зареждане...', save: 'Запази', cancel: 'Отмени', delete: 'Изтрий', download: 'Свали', upload: 'Качи' },
    misiune: { eyebrow: '// Мисия на EPD', title: 'Платформа №1 в света с много функции', subtitle: 'За всеки вид енергия, инфраструктура, транспорт, строителство, търговия, авиация, космос — и много други.' },
  } },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ro',
    supportedLngs: Object.keys(resources),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'epd-i18n-lang',
    },
  });

export default i18n;
