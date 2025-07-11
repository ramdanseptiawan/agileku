import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mindshift Learning - Transform Your Learning Experience",
  description: "Innovative learning management system powered by Shinkai. Transform your education through interactive courses, assessments, and personalized learning paths.",
  keywords: "learning management system, online education, courses, LMS, Mindshift Learning, Shinkai",
  authors: [{ name: "Mindshift Learning Team" }],
  creator: "Shinkai",
  publisher: "Mindshift Learning",
  robots: "index, follow",
  openGraph: {
    title: "Mindshift Learning - Transform Your Learning Experience",
    description: "Innovative learning management system powered by Shinkai. Transform your education through interactive courses, assessments, and personalized learning paths.",
    url: "https://mindshiftlearning.id",
    siteName: "Mindshift Learning",
    images: [
      {
        url: "/mindshift.png",
        width: 1200,
        height: 630,
        alt: "Mindshift Learning Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindshift Learning - Transform Your Learning Experience",
    description: "Innovative learning management system powered by Shinkai.",
    images: ["/mindshift.png"],
  },
  icons: {
    icon: "/mindshift.png",
    shortcut: "/mindshift.png",
    apple: "/mindshift.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
