import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ReactQueryProvider } from "@/lib/reactQuery";
import { MainLayout } from "@/components/MainLayout";
import { ConfigProvider, App } from 'antd';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academic Management Dashboard",
  description: "Dashboard for managing students, courses, and faculty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <ReactQueryProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1677ff',
                  borderRadius: 8,
                  fontFamily: 'inherit',
                },
                components: {
                  Card: { paddingLG: 24 },
                  Table: { headerBg: '#f9fafb', headerColor: '#4b5563' }
                }
              }}
            >
              <App>
                <MainLayout>{children}</MainLayout>
              </App>
            </ConfigProvider>
          </AntdRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
