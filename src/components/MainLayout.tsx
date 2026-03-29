'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Typography } from 'antd';
import { HomeOutlined, TeamOutlined, BookOutlined, BankOutlined, BarChartOutlined, MenuOutlined, SyncOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notification, Popconfirm } from 'antd';

const { Header, Sider, Content } = Layout;

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      notification.success({ message: 'Database reset to initial state successfully.' });
    }
  });

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Dashboard' },
    { key: '/students', icon: <TeamOutlined />, label: 'Students' },
    { key: '/courses', icon: <BookOutlined />, label: 'Courses' },
    { key: '/faculty', icon: <BankOutlined />, label: 'Faculty' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (!screens.md) {
      setDrawerVisible(false);
    }
  };

  const isMobile = !screens.md;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-center border-b border-gray-100" style={{ height: '64px', minHeight: '64px' }}>
        <Typography.Title level={4} style={{ margin: 0, color: '#1677ff' }}>
          {collapsed && !isMobile ? 'UD' : 'UniDash'}
        </Typography.Title>
      </div>
      <div className="flex-1 overflow-y-auto w-full">
        <Menu
          mode="inline"
          selectedKeys={[pathname === '/' ? '/' : `/${pathname.split('/')[1]}`]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, padding: '8px' }}
        />
      </div>
      <div className="p-4 border-t border-gray-100 bg-white w-full mt-auto flex justify-center">
        <Popconfirm title="Reset Database?" description="This will wipe all changes and restore mock data." onConfirm={() => resetMutation.mutate()} okText="Reset" cancelText="Cancel">
          <Button danger icon={<SyncOutlined />} loading={resetMutation.isPending}>
            {collapsed && !isMobile ? '' : 'Reset Data'}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={240}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          width={240}
          className="border-r border-gray-200 shadow-sm z-10"
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0 }}
        >
          {sidebarContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240), transition: 'all 0.2s' }}>
        {isMobile && (
          <Header className="px-4 flex items-center shadow-sm border-b border-gray-100" style={{ padding: 0, height: 64, backgroundColor: '#fff' }}>
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} className="ml-4 text-gray-600 text-lg" />
            <span className="text-xl font-bold text-blue-600 ml-4">UniDash</span>
          </Header>
        )}
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
