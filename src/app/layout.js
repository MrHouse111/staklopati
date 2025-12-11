import { Inter } from 'next/font/google'
import './globals.css'
import AdBanner from '../components/AdBanner';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ŠtaKlopati',
  description: 'AI jelovnik za tvoj grad',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Top ad banner */}
        <AdBanner />
        {children}
        {/* Bottom ad banner */}
        <AdBanner />
      </body>
    </html>
  )
}