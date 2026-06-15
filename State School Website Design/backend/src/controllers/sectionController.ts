import { Request, Response } from 'express';
import { db, saveDatabase, getNextId } from '../config/database.js';
import type { AuthRequest } from '../utils/auth.js';
import { recordAdminAction } from '../utils/activity.js';

// Get all content for a page
export async function getPageContent(req: Request, res: Response) {
  try {
    const { page } = req.params;
    const content = (db.section_content || []).filter(s => s.page === page);
    
    // Group by section
    const grouped: Record<string, Record<string, string>> = {};
    content.forEach(item => {
      if (!grouped[item.section]) grouped[item.section] = {};
      grouped[item.section][item.key] = item.value || '';
    });
    
    res.json({ content: grouped });
  } catch (error) {
    console.error('Get page content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update content
export async function updateContent(req: AuthRequest, res: Response) {
  try {
    const { page, section, key } = req.params;
    const { value } = req.body;

    if (!db.section_content) db.section_content = [];

    let item = db.section_content.find(
      s => s.page === page && s.section === section && s.key === key
    );

    if (item) {
      item.value = value;
      item.updated_at = new Date().toISOString();
    } else {
      db.section_content.push({
        id: getNextId('section_content'),
        page,
        section,
        key,
        value: value || '',
        updated_at: new Date().toISOString()
      });
    }
    
    saveDatabase();
    recordAdminAction(req.admin?.id || null, 'update', 'section', item?.id || null, `Updated ${page}.${section}.${key}`);
    res.json({ message: 'Updated' });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updatePageContent(req: AuthRequest, res: Response) {
  try {
    const { page } = req.params;
    const payload = req.body?.content || req.body || {};
    if (!db.section_content) db.section_content = [];

    Object.entries(payload).forEach(([section, values]) => {
      if (!values || typeof values !== 'object') return;
      Object.entries(values as Record<string, unknown>).forEach(([key, value]) => {
        let item = db.section_content.find(s => s.page === page && s.section === section && s.key === key);
        if (item) {
          item.value = String(value ?? '');
          item.updated_at = new Date().toISOString();
        } else {
          db.section_content.push({
            id: getNextId('section_content'),
            page,
            section,
            key,
            value: String(value ?? ''),
            updated_at: new Date().toISOString()
          });
        }
      });
    });

    recordAdminAction(req.admin?.id || null, 'update', 'page', null, `Updated ${page} page content`);
    saveDatabase();
    res.json({ message: 'Page content updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all pages content
export async function getAllPageContent(req: Request, res: Response) {
  try {
    const content = db.section_content || [];
    
    // Group by page and section
    const grouped: Record<string, Record<string, Record<string, string>>> = {};
    content.forEach(item => {
      if (!grouped[item.page]) grouped[item.page] = {};
      if (!grouped[item.page][item.section]) grouped[item.page][item.section] = {};
      grouped[item.page][item.section][item.key] = item.value || '';
    });
    
    res.json({ content: grouped });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// Seed default content
export function seedDefaultPageContent() {
  if (!db.section_content) db.section_content = [];

  const defaults = [
    // HOME
    { page: 'home', section: 'hero', key: 'title', value: '28-Maktab' },
    { page: 'home', section: 'hero', key: 'subtitle', value: '1-11 sinflar uchun sifatli ta\'lim muassasasi' },
    { page: 'home', section: 'hero', key: 'banner_image', value: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400' },
    { page: 'home', section: 'hero', key: 'primary_button', value: 'About Us' },
    { page: 'home', section: 'hero', key: 'secondary_button', value: 'Contact' },
    { page: 'home', section: 'hero', key: 'intro_video', value: '' },
    { page: 'home', section: 'announcements', key: 'main', value: 'New groups are now open for registration.' },
    { page: 'home', section: 'stats', key: 'students_num', value: '800+' },
    { page: 'home', section: 'stats', key: 'students_label', value: 'O\'quvchilar' },
    { page: 'home', section: 'stats', key: 'teachers_num', value: '50+' },
    { page: 'home', section: 'stats', key: 'teachers_label', value: 'O\'qituvchilar' },
    { page: 'home', section: 'stats', key: 'grades_num', value: '11' },
    { page: 'home', section: 'stats', key: 'grades_label', value: 'Sinflar' },
    { page: 'home', section: 'stats', key: 'years_num', value: '39' },
    { page: 'home', section: 'stats', key: 'years_label', value: 'Yillik tajriba' },
    { page: 'home', section: 'achievements', key: 'card1_value', value: '15+' },
    { page: 'home', section: 'achievements', key: 'card1_label', value: 'Respublika Olimpiadasida' },
    { page: 'home', section: 'achievements', key: 'card2_value', value: '95%' },
    { page: 'home', section: 'achievements', key: 'card2_label', value: 'O\'quvchilar o\'sishi' },
    { page: 'home', section: 'achievements', key: 'card3_value', value: '98%' },
    { page: 'home', section: 'achievements', key: 'card3_label', value: 'Ota-onalar mamnunligi' },
    { page: 'home', section: 'achievements', key: 'card4_value', value: 'Top 10' },
    { page: 'home', section: 'achievements', key: 'card4_label', value: 'Reytingdagi o\'rin' },
    { page: 'home', section: 'cta', key: 'title', value: 'Bizning Maktabga Xush Kelibsiz!' },
    { page: 'home', section: 'cta', key: 'desc', value: 'O\'quvchilarimizga eng yaxshi ta\'lim va tarbiya berish uchun intilamiz' },
    
    // ABOUT
    { page: 'about', section: 'hero', key: 'title', value: 'Biz Haqimizda' },
    { page: 'about', section: 'hero', key: 'subtitle', value: '28-maktab tarixi, missiyasi va jamoasi' },
    { page: 'about', section: 'history', key: 'title', value: 'Bizning Tarix' },
    { page: 'about', section: 'history', key: 'desc1', value: '1985-yilda tashkil etilgan. 1-11 sinflar uchun sifatli ta\'lim berib kelmoqda.' },
    { page: 'about', section: 'history', key: 'desc2', value: 'Minglab o\'quvchilarni tarbiyalagan, turli sohalarda muvaffaqiyatli bitiruvchilar.' },
    { page: 'about', section: 'history', key: 'desc3', value: 'Zamonaviy ta\'lim usullari va texnologiyalarni qo\'llaymiz.' },
    { page: 'about', section: 'history', key: 'image_url', value: 'https://images.unsplash.com/photo-1626402570254-3e3d1790e14f?w=800' },
    { page: 'about', section: 'mission', key: 'title', value: 'Missiya' },
    { page: 'about', section: 'mission', key: 'desc', value: 'O\'quvchilarni kelajakka tayyorlash - tanqidiy fikrlash, ijodkorlik va xarakter rivojlantirish.' },
    { page: 'about', section: 'vision', key: 'title', value: 'Vision' },
    { page: 'about', section: 'vision', key: 'desc', value: 'A modern educational center where every learner grows with confidence.' },
    { page: 'about', section: 'media', key: 'video_url', value: '' },
    { page: 'about', section: 'certificates', key: 'items', value: 'Licensed Education Center, STEM Excellence Award' },
    { page: 'about', section: 'values', key: 'title', value: 'Qadriyatlar' },
    { page: 'about', section: 'values', key: 'v1', value: 'Mukammallik: Yuqori standartlar' },
    { page: 'about', section: 'values', key: 'v2', value: 'Vijdonlilik: Halollik' },
    { page: 'about', section: 'values', key: 'v3', value: 'Hurmat: Hammaga ehtirom' },
    { page: 'about', section: 'values', key: 'v4', value: 'Innovatsiya: Yangi g\'oyalar' },
    
    // STUDENTS
    { page: 'students', section: 'hero', key: 'title', value: 'O\'quvchilar Hayoti' },
    { page: 'students', section: 'hero', key: 'subtitle', value: 'O\'quvchilar hayoti, sinflar, yutuqlar va tadbirlar' },
    { page: 'students', section: 'classes', key: 'items_json', value: '[{"grade":1,"students":75,"classesCount":3},{"grade":2,"students":80,"classesCount":3},{"grade":3,"students":82,"classesCount":3},{"grade":4,"students":78,"classesCount":3},{"grade":5,"students":85,"classesCount":3},{"grade":6,"students":90,"classesCount":4},{"grade":7,"students":88,"classesCount":4},{"grade":8,"students":72,"classesCount":3},{"grade":9,"students":76,"classesCount":3},{"grade":10,"students":68,"classesCount":3},{"grade":11,"students":65,"classesCount":3}]' },
    { page: 'students', section: 'activities', key: 'group_image', value: 'https://images.unsplash.com/photo-1607586501844-9a7f11af251c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjaGlsZHJlbiUyMGFjdGl2aXRpZXN8ZW58MXx8fHwxNzY5OTI2OTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { page: 'students', section: 'activities', key: 'sports_image', value: 'https://images.unsplash.com/photo-1528024719646-5360a944bd74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBzcG9ydHMlMjBmaWVsZHxlbnwxfHx8fDE3Njk5MjY5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { page: 'students', section: 'activities', key: 'events_image', value: 'https://images.unsplash.com/photo-1759922378135-c68df8312190?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBldmVudCUyMGNlcmVtb255fGVufDF8fHx8MTc2OTkyNjkzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    
    // CONTACT
    { page: 'contact', section: 'hero', key: 'title', value: 'Bog\'lanish' },
    { page: 'contact', section: 'hero', key: 'subtitle', value: 'Biz bilan bog\'laning' },
    { page: 'contact', section: 'info', key: 'address', value: 'Toshkent shahar' },
    { page: 'contact', section: 'info', key: 'phone', value: '+998 71 123 45 67' },
    { page: 'contact', section: 'info', key: 'email', value: 'info@school28.uz' },
    { page: 'contact', section: 'info', key: 'telegram', value: '@school28' },
    { page: 'contact', section: 'info', key: 'map', value: '' },
    { page: 'contact', section: 'info', key: 'hours', value: 'Monday - Saturday, 08:00 - 18:00' },
    
    // FOOTER
    { page: 'footer', section: 'info', key: 'address', value: 'Manzil: Toshkent shahar' },
    { page: 'footer', section: 'info', key: 'phone', value: 'Telefon: +998 71 123 45 67' },
    { page: 'footer', section: 'info', key: 'email', value: 'Email: info@school28.uz' },
    { page: 'footer', section: 'info', key: 'desc', value: '1985-yildan beri sifatli ta\'lim berib kelmoqdamiz.' },
    { page: 'footer', section: 'info', key: 'hours', value: 'Dushanba - Juma, 08:00 - 18:00' },
    { page: 'footer', section: 'info', key: 'facebook', value: '#' },
    { page: 'footer', section: 'info', key: 'instagram', value: '#' },
    { page: 'footer', section: 'info', key: 'youtube', value: '#' },
    { page: 'footer', section: 'info', key: 'telegram', value: '#' },
  ];
  
  defaults.forEach(d => {
    const existingIndex = db.section_content.findIndex(
      s => s.page === d.page && s.section === d.section && s.key === d.key
    );

    if (existingIndex === -1) {
      db.section_content.push({
        id: getNextId('section_content'),
        page: d.page,
        section: d.section,
        key: d.key,
        value: d.value,
        updated_at: new Date().toISOString()
      });
    } else {
      const item = db.section_content[existingIndex];
      if (!item.value || item.value === '') {
        item.value = d.value;
      }
    }
  });
  
  saveDatabase();
  console.log('✅ Default page content seeded');
}
