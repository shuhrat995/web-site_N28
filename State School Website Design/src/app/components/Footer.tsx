import { Link } from 'react-router-dom';
import { Clock, Facebook, GraduationCap, Instagram, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react';
import { useTranslation } from '@/translations';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/config';
import { getLocalizedSectionValue } from '@/translations/helpers';

export function Footer() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch(`${API_BASE_URL}/sections/footer?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || {}))
      .catch(() => {});
  }, []);

  const g = (key: string, fallback: string) => getLocalizedSectionValue(content, 'info', key, language, fallback);

  const quickLinks = [
    { path: '/', label: t.nav.home },
    { path: '/about', label: t.nav.about },
    { path: '/teachers', label: t.nav.teachers },
    { path: '/students', label: t.nav.students },
    { path: '/news', label: t.nav.news },
    { path: '/gallery', label: t.nav.gallery },
    { path: '/contact', label: t.nav.contact },
  ];

  const socialLinks = [
    { icon: Facebook, href: g('facebook', '#'), label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Instagram, href: g('instagram', '#'), label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Youtube, href: g('youtube', '#'), label: 'YouTube', color: 'hover:text-red-600' },
    { icon: Send, href: g('telegram', '#'), label: 'Telegram', color: 'hover:text-blue-500' },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2.5 rounded-xl">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">{t.footer.schoolLabel}</div>
                <div className="text-sm text-neutral-400">{t.footer.schoolSubLabel}</div>
              </div>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">{g('desc', t.footer.description)}</p>

            <div className="flex items-center gap-3">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center transition-all duration-300 hover:bg-neutral-700 ${social.color} hover:-translate-y-1`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-neutral-300 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full group-hover:bg-primary-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-secondary-500 rounded-full" />
              {t.footer.contactInfo}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-300">
                <MapPin className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white mb-1">{t.footer.address}</div>
                  <div className="text-sm">{g('address', t.footer.addressValue)}</div>
                </div>
              </li>
              <li className="flex items-start gap-3 text-neutral-300">
                <Phone className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white mb-1">{t.footer.phone}</div>
                  <a href={`tel:${g('phone', '+998712345678').replace(/[^\d+]/g, '')}`} className="text-sm hover:text-primary-400 transition-colors">
                    {g('phone', '+998 (71) 234-56-78')}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-neutral-300">
                <Mail className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white mb-1">{t.footer.email}</div>
                  <a href={`mailto:${g('email', 'info@school28.uz')}`} className="text-sm hover:text-primary-400 transition-colors">
                    {g('email', 'info@school28.uz')}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-accent-500 rounded-full" />
              {t.footer.workingHours}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent-400 mt-0.5 flex-shrink-0" />
                <div className="text-neutral-300 text-sm">
                  <div className="font-medium text-white mb-1">{g('hours', t.footer.monFri)}</div>
                  <div>{t.footer.saturday}</div>
                  <div className="mt-2 text-neutral-400">{t.footer.sunday}</div>
                </div>
              </li>
            </ul>

          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
            <p>© {currentYear} {t.footer.schoolLabel}. {t.footer.allRights}</p>
            <p>{t.footer.madeWith}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
