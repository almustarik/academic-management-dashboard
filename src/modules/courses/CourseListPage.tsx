'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { facultyService } from '@/services/facultyService';
import { Table, Button, Typography, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Course } from '@/types';

const { Title, Text } = Typography;

export function CourseListPage() {
  const { data: courses = [], isLoading: loadingCo } = useQuery({ queryKey: ['courses'], queryFn: courseService.getAll });
  const { data: faculty = [], isLoading: loadingFa } = useQuery({ queryKey: ['faculty'], queryFn: facultyService.getAll });

  const loading = loadingCo || loadingFa;
  
  const mappedCourses = React.useMemo(() => courses.map(course => {
    const names = course.instructors.map(id => {
      const fac = faculty.find(f => f.id === id);
      return fac ? fac.name : 'Unknown';
    });
    return { ...course, instructorNames: names };
  }), [courses, faculty]);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (text: string) => <Text strong>{text}</Text> },
    { 
      title: 'Enrolled', 
      dataIndex: 'enrollmentCount', 
      key: 'enrollmentCount',
      render: (count: number) => <Tag color="blue" style={{ fontWeight: 600 }}>{count}</Tag>
    },
    { 
      title: 'Instructors', 
      key: 'instructors', 
      dataIndex: 'instructorNames',
      render: (names: string[]) => (
        <Space wrap>
          {names.map((name, i) => (
            <Tag key={i} color="default">{name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: unknown, record: Course) => (
        <Link href={`/courses/${record.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
      )
    }
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>Courses</Title>
          <Text type="secondary">Manage academic courses and assigned instructors.</Text>
        </div>
        <Link href="/courses/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Course
          </Button>
        </Link>
      </div>

      <Table 
        scroll={{ x: 'max-content' }}
        dataSource={mappedCourses} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        className="shadow-sm border border-gray-100 rounded-xl overflow-hidden"
        pagination={{ pageSize: 10 }}
      />
    </Space>
  );
}
