'use client';

import React, { useState } from 'react';
import { ChartWrapper } from '@/components/ChartWrapper';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { apiClient } from '@/lib/axios';
import { Student, Course, Grade } from '@/types';
import { exportToCSV } from '@/utils/csvExport';
import { Download, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, Select, Table, Typography, Button, Space, Row, Col, Tag, notification } from 'antd';
import { ApexOptions } from 'apexcharts';

const { Title, Text } = Typography;

interface CoursePerformance {
  courseTitle: string;
  studentName: string;
  grade: string;
}

export function ReportsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const { data: courses = [], isLoading: loadC } = useQuery({ queryKey: ['courses'], queryFn: courseService.getAll });
  const { data: students = [], isLoading: loadS } = useQuery({ queryKey: ['students'], queryFn: studentService.getAll });
  const { data: grades = [], isLoading: loadG } = useQuery({ 
    queryKey: ['grades'], 
    queryFn: async () => { const { data } = await apiClient.get<Grade[]>('/grades'); return data; }
  });

  const loading = loadC || loadS || loadG;

  const chartOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { 
      categories: courses.map(c => c.title),
      labels: {
        rotate: -45,
        style: { fontSize: '11px' },
        formatter: (value: any) => {
          if (typeof value === 'string' && value.length > 15) {
            return value.substring(0, 15) + '...';
          }
          return value as string;
        }
      }
    },
    colors: ['#1677ff'],
    title: { text: '', style: { fontSize: '16px', fontWeight: 600, color: '#374151', fontFamily: 'inherit' } },
    tooltip: {
      x: {
        formatter: (val: any, opts?: any) => {
          if (opts && opts.dataPointIndex !== undefined) {
            return courses[opts.dataPointIndex].title;
          }
          return typeof val === 'string' ? val : String(val);
        }
      }
    }
  };

  const chartSeries = [{ name: 'Enrollment Count', data: courses.map(c => c.enrollmentCount) }];

  const selectedCourseTopStudents = React.useMemo(() => {
    if (!selectedCourseId) return [];
    const courseGrades = grades.filter(g => g.courseId === selectedCourseId);
    
    // Sort logic (assuming A > B > C etc. Simplified mapping)
    const gradeWeight: Record<string, number> = { 'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
    courseGrades.sort((a, b) => (gradeWeight[b.grade] || 0) - (gradeWeight[a.grade] || 0));
    
    return courseGrades.map(g => {
      const st = students.find(s => s.id === g.studentId);
      const c = courses.find(co => co.id === g.courseId);
      return {
        courseTitle: c?.title || '',
        studentName: st?.name || 'Unknown',
        grade: g.grade
      } as CoursePerformance;
    });
  }, [selectedCourseId, grades, students, courses]);

  const handleExportStudents = () => {
    try {
      exportToCSV(students, 'all_students_report');
      notification.success({ message: 'Export initiated successfully' });
    } catch (err) {
      notification.error({ message: 'Failed to export CSV' });
    }
  };

  const handleExportTopStudents = () => {
    if (selectedCourseTopStudents.length === 0) return;
    try {
      exportToCSV(selectedCourseTopStudents, `top_students_${selectedCourseId}`);
      notification.success({ message: 'Export initiated successfully' });
    } catch {
      notification.error({ message: 'Failed to export CSV' });
    }
  };

  const columns = [
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName', render: (text: string) => <Text strong>{text}</Text> },
    { 
      title: 'Grade Achieved', 
      dataIndex: 'grade', 
      key: 'grade',
      render: (grade: string) => (
        <Tag color="green" style={{ borderRadius: '16px', fontWeight: 500 }}>{grade}</Tag>
      )
    }
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>Reports Module</Title>
          <Text type="secondary">Analytics, trends, and data exports.</Text>
        </div>
        <Button onClick={handleExportStudents} icon={<Download size={16} />} size="large">
          Export All Students
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm" loading={loading} title={
        <div className="flex items-center gap-2">
          <TrendingUp className="text-sky-500 h-5 w-5" />
          <span>Enrollment Overview</span>
        </div>
      }>
        {courses.length > 0 && <ChartWrapper options={chartOptions as any} series={chartSeries} type="area" height={320} />}
      </Card>

      <Card bordered={false} className="shadow-sm" loading={loading} title="Top Students per Course" extra={
        <Space>
          <Select
            placeholder="Select a Course..."
            style={{ width: 250 }}
            value={selectedCourseId || undefined}
            onChange={setSelectedCourseId}
            options={courses.map(c => ({ label: c.title, value: c.id }))}
          />
          <Button 
            type="primary" 
            icon={<Download size={16} />} 
            onClick={handleExportTopStudents}
            disabled={!selectedCourseId || selectedCourseTopStudents.length === 0}
          >
            Export Report
          </Button>
        </Space>
      }>
        {selectedCourseId ? (
          <Table 
            scroll={{ x: 'max-content' }}
            dataSource={selectedCourseTopStudents} 
            columns={columns} 
            rowKey={(record) => `${record.studentName}-${record.grade}`} 
            pagination={false}
            size="middle"
          />
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: '8px', color: '#888', marginTop: '16px' }}>
            Please select a course to view the top students.
          </div>
        )}
      </Card>
    </Space>
  );
}
