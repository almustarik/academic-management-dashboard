'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Input, Select, Button, Typography, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { Student } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const { Title, Text } = Typography;

export function StudentListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll
  });

  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const matchSearch = student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchYear = yearFilter ? student.year === yearFilter : true;
      const matchCourse = courseFilter ? student.courses.includes(courseFilter) : true;
      return matchSearch && matchYear && matchCourse;
    });
  }, [students, debouncedSearchTerm, yearFilter, courseFilter]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrent(1);
  }, [debouncedSearchTerm, yearFilter, courseFilter]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <Space orientation="vertical" size={0}>
          <Link href={`/students/${record.id}`} className="font-medium text-blue-600 hover:text-blue-800">{text}</Link>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      )
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      filters: [
        { text: 'Freshman', value: 'Freshman' },
        { text: 'Sophomore', value: 'Sophomore' },
        { text: 'Junior', value: 'Junior' },
        { text: 'Senior', value: 'Senior' },
      ],
      onFilter: (value: boolean | React.Key, record: Student) => record.year === value,
    },
    {
      title: 'GPA',
      dataIndex: 'GPA',
      key: 'GPA',
      render: (gpa: number) => (
        <Text strong type={gpa >= 3.5 ? 'success' : gpa >= 3.0 ? 'warning' : 'danger'}>
          {gpa.toFixed(2)}
        </Text>
      ),
      sorter: (a: Student, b: Student) => a.GPA - b.GPA,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Student) => (
        <Link href={`/students/${record.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>Students</Title>
          <Text type="secondary">Manage and view all enrolled students.</Text>
        </div>
        <Link href="/students/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Student
          </Button>
        </Link>
      </div>

      <div style={{ padding: '16px' }} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          defaultValue=""
          style={{ width: 180 }}
          value={yearFilter}
          onChange={setYearFilter}
          options={[
            { value: '', label: 'All Years' },
            { value: 'Freshman', label: 'Freshman' },
            { value: 'Sophomore', label: 'Sophomore' },
            { value: 'Junior', label: 'Junior' },
            { value: 'Senior', label: 'Senior' },
          ]}
        />
        <Select
          defaultValue=""
          style={{ width: 220 }}
          value={courseFilter}
          onChange={setCourseFilter}
          options={[
            { value: '', label: 'All Courses' },
            ...courses.map(c => ({ value: c.id, label: c.title }))
          ]}
        />
      </div>

      <Table 
        scroll={{ x: 'max-content' }}
        dataSource={filteredStudents} 
        columns={columns} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{ 
          current, 
          pageSize, 
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
          }
        }}
        className="shadow-sm border border-gray-100 rounded-xl overflow-hidden"
      />
    </Space>
  );
}
