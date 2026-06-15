import { Users, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useTranslation } from '@/translations';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/app/config';
import { getLocalizedSectionValue } from '@/translations/helpers';

export function Students() {
  const { t, language } = useTranslation();
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const defaultClasses = useMemo(
    () => [
      { grade: 1, students: 75, classesCount: 3 },
      { grade: 2, students: 80, classesCount: 3 },
      { grade: 3, students: 82, classesCount: 3 },
      { grade: 4, students: 78, classesCount: 3 },
      { grade: 5, students: 85, classesCount: 3 },
      { grade: 6, students: 90, classesCount: 4 },
      { grade: 7, students: 88, classesCount: 4 },
      { grade: 8, students: 72, classesCount: 3 },
      { grade: 9, students: 76, classesCount: 3 },
      { grade: 10, students: 68, classesCount: 3 },
      { grade: 11, students: 65, classesCount: 3 },
    ],
    []
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/sections/students?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || {}))
      .catch(() => {});
  }, []);

  const g = (section: string, key: string, fallback: string) =>
    getLocalizedSectionValue(content, section, key, language, fallback);

  const classes = useMemo(() => {
    try {
      const raw = g('classes', 'items_json', '');
      if (!raw) return defaultClasses;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultClasses;
      return parsed
        .filter((item) => item && item.grade)
        .map((item) => ({
          grade: Number(item.grade),
          students: Number(item.students || 0),
          classesCount: Number(item.classesCount || item.classes || 0),
        }));
    } catch {
      return defaultClasses;
    }
  }, [defaultClasses, content, language]);

  const achievementIcons = [Trophy, Trophy, Sparkles, BookOpen];
  const achievements = t.students.achievementsList.map((achievement, index) => ({
    ...achievement,
    icon: achievementIcons[index] || Trophy,
  }));

  const activities = t.students.activities;

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-4">{g('hero', 'title', t.students?.title || 'O\'quvchilar')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-blue-100 max-w-3xl">
            {g('hero', 'subtitle', t.students?.subtitle || 'O\'quvchilar hayoti, sinflar, yutuqlar va tadbirlar bilan tanishing.')}
          </motion.p>
        </motion.div>
      </section>

      {/* Classes overview */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="size-6 text-blue-700" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.students?.classes || 'Bizning Sinflar'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((classInfo) => (
              <div
                key={classInfo.grade}
                className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="text-2xl font-bold text-blue-700 mb-4">
                  {classInfo.grade}-{t.students.gradeSuffix}
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>{classInfo.students}</strong> {t.students?.studentsLabel || 'o\'quvchi'}</p>
                  <p><strong>{classInfo.classesCount}</strong> {t.students?.classesLabel || 'sinf'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-3 rounded-lg">
              <Trophy className="size-6 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.students?.achievements || 'Yaqingi Yutuqlar'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                    <achievement.icon className="size-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-green-600 font-semibold mb-2">{achievement.description}</p>
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student activities images */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
            {t.students?.activitiesTitle || 'O\'quvchilar Faoliyati'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <ImageWithFallback
                src={g('activities', 'group_image', 'https://images.unsplash.com/photo-1607586501844-9a7f11af251c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjaGlsZHJlbiUyMGFjdGl2aXRpZXN8ZW58MXx8fHwxNzY5OTI2OTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')}
                alt={t.students?.groupActivities || 'Guruh Faoliyati'}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-bold">{t.students?.groupActivities || 'Guruh Faoliyati'}</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <ImageWithFallback
                src={g('activities', 'sports_image', 'https://images.unsplash.com/photo-1528024719646-5360a944bd74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBzcG9ydHMlMjBmaWVsZHxlbnwxfHx8fDE3Njk5MjY5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')}
                alt={t.students?.sports || 'Sport'}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-bold">{t.students?.sports || 'Sport'}</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <ImageWithFallback
                src={g('activities', 'events_image', 'https://images.unsplash.com/photo-1759922378135-c68df8312190?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBldmVudCUyMGNlcmVtb255fGVufDF8fHx8MTc2OTkyNjkzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')}
                alt={t.students?.specialEvents || 'Maxsus Tadbirlar'}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-bold">{t.students?.specialEvents || 'Maxsus Tadbirlar'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extracurricular activities */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Sparkles className="size-6 text-blue-700" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t.students?.extracurricular || 'Darsdan Tashqari Faoliyat'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <h3 className="text-lg font-bold text-blue-700 mb-2">{activity.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                <p className="text-sm text-green-600 font-semibold">{activity.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t.students?.ctaTitle || 'O\'quvchilar Hayotida Qatnashing'}
          </h2>
          <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto">
            {t.students?.ctaDesc || 'O\'quvchilar o\'z qiziqishlariga mos klub va tadbirlarda qatnashishga rag\'batlantiriladi.'}
          </p>
        </div>
      </section>
    </div>
  );
}
