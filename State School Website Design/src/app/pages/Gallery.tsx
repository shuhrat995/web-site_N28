import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Filter } from 'lucide-react';
import { useTranslation } from '@/translations';
import { pickLocalized } from '@/translations/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { API_BASE_URL, API_ORIGIN } from '@/app/config';

interface GalleryItem {
  id: number;
  title: string;
  title_uzb?: string;
  title_ru?: string;
  title_en?: string;
  category: string;
  image_url: string;
  video_url?: string;
  media_type?: 'image' | 'video';
  album?: string;
  description: string;
  created_at: string;
}

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, language } = useTranslation();

  useEffect(() => {
    setActiveCategory(t.common.all);
  }, [language, t.common.all]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/content?category=gallery&published=true&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const withImages = (data.content || []).filter((item: any) => item.image_url || item.video_url);
      setGalleryItems(withImages);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [t.common.all, ...new Set(galleryItems.map(item => item.album || item.category))];

  const filteredItems =
    activeCategory === t.common.all || !activeCategory
      ? galleryItems
      : galleryItems.filter((item) => (item.album || item.category) === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Page header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageIcon className="w-12 h-12 mb-4" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">{t.gallery.title || 'Galereya'}</h1>
            <p className="text-lg text-white/90 max-w-3xl">
              {t.gallery.subtitle || 'Maktabimizdagi chiroyli lahzalarni ko\'ring'}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Category filter */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="py-8 bg-white sticky top-0 z-40 shadow-lg"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">{t.gallery.category}</span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, staggerChildren: 0.05 }}
            className="flex flex-wrap gap-3"
          >
            {categories.map((category, i) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 px-4"
      >
        <div className="container mx-auto">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <ImageIcon className="w-20 h-20 text-blue-300 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-800 mb-2">{t.gallery.noImages}</h2>
              <p className="text-gray-600 text-lg">{t.gallery.noImagesDesc}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer"
                  onClick={() => {
                    setSelectedImage(`${API_ORIGIN}${item.image_url}`);
                    toast.success(t.gallery.zoomToast);
                  }}
                >
                  <motion.div
                    className="w-full aspect-square overflow-hidden bg-gradient-to-br from-blue-200 to-indigo-200"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.media_type === 'video' && item.video_url ? (
                      <video src={item.video_url.startsWith('/uploads') ? `${API_ORIGIN}${item.video_url}` : item.video_url} className="w-full h-full object-cover" muted controls />
                    ) : (
                      <img
                        src={`${API_ORIGIN}${item.image_url}`}
                        alt={pickLocalized(item, 'title', language)}
                        className="w-full h-full object-cover transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
                  >
                    <div>
                      <h3 className="text-white font-black text-lg mb-2">{pickLocalized(item, 'title', language)}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {item.album || item.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Zoom indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Image modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 bg-white rounded-full p-3 hover:bg-gray-100 transition-colors shadow-xl"
              aria-label={t.gallery.close}
            >
              <X className="w-6 h-6 text-gray-800" />
            </motion.button>
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              src={selectedImage}
              alt={t.gallery.title}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
