import TopBar from '@/components/common/TopBar';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import BottomNav from '@/components/common/BottomNav';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Navbar />
      <main className="flex-grow pt-24 pb-28 lg:pb-12">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
