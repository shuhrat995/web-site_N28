import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from '@/translations';
import { pickLocalized } from '@/translations/helpers';
import { motion } from 'motion/react';
import { API_BASE_URL, API_ORIGIN } from '@/app/config';

interface Teacher {
  id: number;
  name: string;
  name_uzb?: string;
  name_ru?: string;
  name_en?: string;
  subject: string;
  subject_uzb?: string;
  subject_ru?: string;
  subject_en?: string;
  bio: string | null;
  bio_uzb?: string;
  bio_ru?: string;
  bio_en?: string;
  image_url: string | null;
  experience_years: number;
  is_active: boolean;
  created_at: string;
}

export function Teachers() {
  const { t, language } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers?active=true`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-4">{t.teachers.title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-blue-100 max-w-3xl">{t.teachers.subtitle}</motion.p>
        </motion.div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-blue-50">
                <GraduationCap className="size-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.teachers.noTeachers}</h2>
              <p className="text-gray-600">{t.teachers.noTeachersDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {teachers.map(teacher => {
                const name = pickLocalized(teacher, 'name', language);
                const subject = pickLocalized(teacher, 'subject', language);
                const bio = pickLocalized(teacher, 'bio', language);

                return (
                  <div key={teacher.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center border border-gray-100">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 mb-4 flex-shrink-0 ring-4 ring-blue-50 shadow-lg">
                      {teacher.image_url ? (
                        <img
                          src={`${API_ORIGIN}${teacher.image_url}`}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="size-16 text-blue-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center w-full">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 truncate w-full">{name}</h3>
                      <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm font-semibold mb-2">
                        {subject}
                      </div>
                      {bio && <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">{bio}</p>}
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                        <span>{teacher.experience_years} {t.teachers.yearsExp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
