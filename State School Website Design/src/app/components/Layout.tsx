import { useLocation } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAdmin = location.pathname === '/maktab28-boshqaruv';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAdmin && <Header />}
      <main className="flex-1 pt-20">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
