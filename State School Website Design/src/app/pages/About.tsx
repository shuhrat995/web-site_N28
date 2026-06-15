import { useEffect, useState } from 'react';
import { Award, History, Target, Users } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useTranslation } from '@/translations';
import { getLocalizedSectionValue } from '@/translations/helpers';
import { motion } from 'motion/react';
import { API_BASE_URL, API_ORIGIN } from '@/app/config';
import aboutImageLocal from '@/assets/image.png';

interface PageContent {
  [section: string]: {
    [key: string]: string;
  };
}

interface StaffMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image_url?: string | null;
  order_num: number;
}

export function About() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState<PageContent>({});
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [contentRes, staffRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sections/about?t=${Date.now()}`),
        fetch(`${API_BASE_URL}/staff?active=true&t=${Date.now()}`),
      ]);
      const contentData = await contentRes.json();
      const staffData = await staffRes.json();
      setContent(contentData.content || {});
      setStaff(staffData.staff || []);
    } catch (e) {
      console.error('Failed to fetch about content:', e);
    } finally {
      setLoading(false);
    }
  };

  const g = (section: string, key: string, fallback: string) =>
    getLocalizedSectionValue(content, section, key, language, fallback);

  const getImageUrl = (url?: string | null) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_ORIGIN}${url}`;
  };

  const getInitials = (name: string) => name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-4">{g('hero', 'title', t.about.title)}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-blue-100 max-w-3xl">{g('hero', 'subtitle', t.about.subtitle)}</motion.p>
        </motion.div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <History className="size-6 text-blue-700" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {g('history', 'title', t.about.historyTitle)}
                </h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{g('history', 'desc1', t.about.historyDesc1)}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{g('history', 'desc2', t.about.historyDesc2)}</p>
              <p className="text-gray-600 leading-relaxed">{g('history', 'desc3', t.about.historyDesc3)}</p>
            </div>
            <div>
              <ImageWithFallback
                src={aboutImageLocal}
                alt={t.about.title}
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-700 p-3 rounded-lg">
                  <Target className="size-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{g('mission', 'title', t.about.missionTitle)}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{g('mission', 'desc', t.about.missionDesc)}</p>
            </div>
            <div className="bg-green-50 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Award className="size-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{g('values', 'title', t.about.valuesTitle)}</h2>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li><strong>{g('values', 'v1', t.about.value1)}</strong></li>
                <li><strong>{g('values', 'v2', t.about.value2)}</strong></li>
                <li><strong>{g('values', 'v3', t.about.value3)}</strong></li>
                <li><strong>{g('values', 'v4', t.about.value4)}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="size-6 text-blue-700" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.about.administration}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staff.map(member => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 h-28 w-28 overflow-hidden rounded-lg bg-blue-700 text-white shadow-md">
                  {member.image_url ? (
                    <img src={getImageUrl(member.image_url)} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-2">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t.about.numbers}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">800+</div><p className="text-blue-100">{t.home.students}</p></div>
            <div><div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">50+</div><p className="text-blue-100">{t.home.teachers}</p></div>
            <div><div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">11</div><p className="text-blue-100">{t.home.classes}</p></div>
            <div><div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">39</div><p className="text-blue-100">{t.home.experience}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
