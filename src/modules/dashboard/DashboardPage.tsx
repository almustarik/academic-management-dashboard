'use client';

import React from 'react';
import { Card, Col, Row, Statistic, Table, Typography } from 'antd';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { facultyService } from '@/services/facultyService';
import { ChartWrapper } from '@/components/ChartWrapper';
import { ApexOptions } from 'apexcharts';

const { Title, Text } = Typography;

export function DashboardPage() {
  const { data: students = [], isLoading: loadingSt } = useQuery({ queryKey: ['students'], queryFn: studentService.getAll });
  const { data: courses = [], isLoading: loadingCo } = useQuery({ queryKey: ['courses'], queryFn: courseService.getAll });
  const { data: faculty = [], isLoading: loadingFa } = useQuery({ queryKey: ['faculty'], queryFn: facultyService.getAll });

  const loading = loadingSt || loadingCo || loadingFa;

  const topStudents = React.useMemo(() => [...students].sort((a, b) => b.GPA - a.GPA).slice(0, 5), [students]);
  const popularCourses = React.useMemo(() => [...courses].sort((a, b) => b.enrollmentCount - a.enrollmentCount), [courses]);

  const studentCols = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { 
      title: 'GPA', 
      dataIndex: 'GPA', 
      key: 'GPA', 
      render: (gpa: number) => (
        <Text strong type={gpa >= 3.5 ? 'success' : gpa >= 3.0 ? 'warning' : 'danger'}>
          {gpa.toFixed(2)}
        </Text>
      ) 
    },
  ];

  const chartOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    xaxis: { 
      categories: popularCourses.map(c => c.title),
      labels: {
        rotate: -45,
        style: { fontSize: '11px' },
        formatter: (value) => {
          if (typeof value === 'string' && value.length > 15) {
            return value.substring(0, 15) + '...';
          }
          return value as string;
        }
      }
    },
    colors: ['#1677ff'],
    title: { text: 'Course Enrollment', style: { fontSize: '16px', fontWeight: 600, color: '#374151', fontFamily: 'inherit' } },
    tooltip: {
      x: {
        formatter: (val: any, opts?: any) => {
          if (opts && opts.dataPointIndex !== undefined) {
            return popularCourses[opts.dataPointIndex].title;
          }
          return typeof val === 'string' ? val : String(val);
        }
      }
    }
  };

  const chartSeries = [{ name: 'Enrollment Count', data: popularCourses.map(c => c.enrollmentCount) }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>Dashboard</Title>
        <Text type="secondary">Overview of academic metrics.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Students" value={students.length} prefix={<Users className="text-blue-500 mr-2" size={20} />} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Courses" value={courses.length} prefix={<BookOpen className="text-blue-500 mr-2" size={20} />} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Faculty" value={faculty.length} prefix={<GraduationCap className="text-blue-500 mr-2" size={20} />} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Top Students (By GPA)" bordered={false} className="shadow-sm h-full">
            <Table scroll={{ x: 'max-content' }} dataSource={topStudents} columns={studentCols} rowKey="id" pagination={false} loading={loading} size="middle" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm h-full" style={{ padding: 0 }}>
             {popularCourses.length > 0 && <ChartWrapper options={chartOptions} series={chartSeries} type="bar" height={320} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
