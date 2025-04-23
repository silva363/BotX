/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { GlobalProvider } from '@/components/store/authContext';
import Providers from './providers/providers';
import AuthMiddleware from './providers/authMiddleware';
import LoadingPage from '@/components/loadingPage/loadingPage';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <div className='container-page'>
          <div className='container-page-content'>
            <Suspense fallback={
              <LoadingPage></LoadingPage>
            }>
              <GlobalProvider >
                <Providers>
                  <ToastContainer autoClose={3000} />
                  <AuthMiddleware>{children}</AuthMiddleware>
                </Providers>
              </GlobalProvider>
            </Suspense>
          </div>
        </div>
      </body>
    </html >
  );
}
