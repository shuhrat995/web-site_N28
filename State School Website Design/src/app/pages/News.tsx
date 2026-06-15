import { Calendar, Eye, FileText, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/translations';
import { motion } from 'motion/react';
import { pickLocalized } from '@/translations/helpers';
import { API_BASE_URL, API_ORIGIN } from '@/app/config';

interface NewsArticle {
  id: number;
  title: string;
  title_uzb?: string;
  title_ru?: string;
  title_en?: string;
  content_text: string;
  content_text_uzb?: string;
  content_text_ru?: string;
  content_text_en?: string;
  description: string;
  description_uzb?: string;
  description_ru?: string;
  description_en?: string;
  category: string;
  image_url: string;
  is_published: boolean;
  publish_date?: string;
  views?: number;
  created_at: string;
}

export function News() {
  const { t, language } = useTranslation();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(t.common.all);

  useEffect(() => {
    setSelectedCategory(t.common.all);
  }, [language, t.common.all]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/content?category=news&published=true&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNewsArticles(data.content || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'rus' ? 'ru-RU' : language === 'eng' ? 'en-US' : 'uz-UZ';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categories = [t.common.all, ...new Set(newsArticles.map(article => article.category))];
  const filteredArticles = selectedCategory === t.common.all
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">{t.news.loading}</div>
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-4">{t.news.title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-blue-100 max-w-3xl">{t.news.subtitle}</motion.p>
        </motion.div>
      </section>

      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="size-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">{t.news.filterByCategory}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-blue-50">
                <FileText className="size-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.news.noNews}</h2>
              <p className="text-gray-600">{t.news.noNewsDesc}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles.map(article => {
                const title = pickLocalized(article, 'title', language);
                const description = pickLocalized(article, 'description', language);
                const text = pickLocalized(article, 'content_text', language);

                return (
                  <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      {article.image_url && (
                        <div className="md:w-48 flex-shrink-0">
                          <div className="w-48 h-32 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={`${API_ORIGIN}${article.image_url}`}
                              alt={title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className={`flex-1 p-6 ${!article.image_url ? 'w-full' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <span className="w-fit text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                            {article.category}
                          </span>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="size-4" />
                            <span>{formatDate(article.publish_date || article.created_at)}</span>
                            <Eye className="size-4 ml-2" />
                            <span>{article.views || 0}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                        {description && <p className="text-gray-600 mb-3 font-medium">{description}</p>}
                        {text && <p className="text-gray-600 leading-relaxed">{text}</p>}
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
