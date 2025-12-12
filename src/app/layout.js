import { Inter } from 'next/font/google';
import './globals.css';
import AdBanner from '../components/AdBanner';

// Configure Inter font subset
const inter = Inter({ subsets: ['latin'] });

// Updated metadata: remove "create.xyz" branding and set title/description for Šta Klopati
export const metadata = {
  title: 'Šta Klopati',
  description: 'Vodič kroz restorane u vašem gradu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        {/* Google AdSense script for monetization */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      {/* Add padding at bottom so content is not hidden behind the fixed banner */}
      <body className={inter.className + ' pb-16'}>
        {children}
        {/* Sticky banner for ads at the bottom of every page */}
        <AdBanner />
      </body>
    </html>
  );
}