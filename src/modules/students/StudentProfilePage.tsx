'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { apiClient } from '@/lib/axios';
import { Student, Course, Grade } from '@/types';
import { Card, Descriptions, Table, Typography, Space, Button, Tag } from 'antd';
import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

const { Title, Text } = Typography;

interface CourseWithGrade extends Course {
  grade?: string;
}

export function StudentProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: student, isLoading: loadingSt } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });

  const { data: grades = [], isLoading: loadingGr } = useQuery({
    queryKey: ['grades', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Grade[]>(`/grades?studentId=${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: courses = [], isLoading: loadingCo } = useQuery({
    queryKey: ['courses', student?.courses],
    queryFn: async () => {
      if (!student?.courses?.length) return [];
      const coursePromises = student.courses.map(courseId => courseService.getById(courseId));
      return await Promise.all(coursePromises);
    },
    enabled: !!student?.courses?.length,
  });

  const loading = loadingSt || loadingGr || loadingCo;

  if (loading) return <Card loading={true} className="mt-8 max-w-5xl mx-auto shadow-sm" bordered={false} />;

  if (!student) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <Title level={4}>Student not found</Title>
        <Link href="/students"><Button type="link">Go Back</Button></Link>
      </div>
    );
  }

  const coursesWithGrades: CourseWithGrade[] = courses.map(c => {
    const mg = grades.find(g => g.courseId === c.id);
    return { ...c, grade: mg?.grade || 'N/A' };
  });

  const columns = [
    { title: 'Course ID', dataIndex: 'id', key: 'id', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Course Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Grade', 
      dataIndex: 'grade', 
      key: 'grade',
      render: (grade: string) => (
        <Tag color={grade !== 'N/A' ? 'blue' : 'default'} className="rounded-full px-3">
          {grade}
        </Tag>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/students" className="text-gray-500 hover:text-blue-600 flex items-center mb-2">
        <ArrowLeftOutlined className="mr-2" /> Back to Students
      </Link>

      <Card bordered={false} className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Title level={2} style={{ margin: 0 }}>{student.name}</Title>
            <Space className="mt-2" size="large">
              <Text type="secondary">{student.email}</Text>
              <Tag color="blue">{student.year}</Tag>
            </Space>
          </div>
          <div className="text-right">
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Cumulative GPA</Text>
            <span className={`text-4xl font-bold ${student.GPA >= 3.5 ? 'text-green-600' : student.GPA >= 3.0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {student.GPA.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <Card title={<Space><BookOutlined className="text-blue-500" /> Enrolled Courses & Grades</Space>} bordered={false} className="shadow-sm">
        <Table 
          scroll={{ x: 'max-content' }}
          dataSource={coursesWithGrades}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
