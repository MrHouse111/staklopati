import { Inter } from 'next/font/google';
import './globals.css';
import AdBanner from '../components/AdBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Šta Klopati',
  description: 'Vodič kroz restorane u vašem gradu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        {/* Font Awesome ikone (OVO JE FALILO) */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      
      <body className={inter.className + ' pb-16'}>
        {children}
        
        {/* Donji baner samo */}
        <AdBanner />
      </body>
    </html>
  );
}