import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TranslationProvider } from '@/translations';
import { Layout } from '@/app/components/Layout';
import { Home } from '@/app/pages/Home';
import { About } from '@/app/pages/About';
import { Teachers } from '@/app/pages/Teachers';
import { Students } from '@/app/pages/Students';
import { News } from '@/app/pages/News';
import { Gallery } from '@/app/pages/Gallery';
import { Contact } from '@/app/pages/Contact';
import { Admin } from '@/app/pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <TranslationProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/students" element={<Students />} />
            <Route path="/news" element={<News />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </TranslationProvider>
  );
}
