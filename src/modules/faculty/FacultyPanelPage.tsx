'use client';

import React, { useState } from 'react';
import { Form, Select, Button, Card, Typography, Row, Col, notification, Modal, Table, Space } from 'antd';
import { Users, BookOpen, UserPlus, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { facultyService } from '@/services/facultyService';
import { gradeService } from '@/services/gradeService';
import { ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface FacultyBulkActionPayload {
  courseId: string;
  studentIds?: string[];
  instructorIds?: string[];
}

export function FacultyPanelPage() {
  const [enrollForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [gradingCourse, setGradingCourse] = useState<string>('');
  const [gradeChanges, setGradeChanges] = useState<Record<string, { id?: string, grade: string }>>({});

  const { data: courses = [], isLoading: loadC } = useQuery({ queryKey: ['courses'], queryFn: courseService.getAll });
  const { data: students = [], isLoading: loadS } = useQuery({ queryKey: ['students'], queryFn: studentService.getAll });
  const { data: faculties = [], isLoading: loadF } = useQuery({ queryKey: ['faculty'], queryFn: facultyService.getAll });
  const { data: grades = [], isLoading: loadG } = useQuery({ 
    queryKey: ['grades', gradingCourse], 
    queryFn: () => gradingCourse ? gradeService.getByCourse(gradingCourse) : Promise.resolve([]),
    enabled: !!gradingCourse
  });

  const loading = loadC || loadS || loadF;

  // Mutations
  const enrollMutation = useMutation({
    mutationFn: async (data: FacultyBulkActionPayload) => {
      if (!data.studentIds) return;
      const selectedStudents = students.filter(s => data.studentIds!.includes(s.id));
      await Promise.all(selectedStudents.map(student => {
        const newCourses = Array.from(new Set([...student.courses, data.courseId]));
        return studentService.update(student.id, { courses: newCourses });
      }));

      const course = courses.find(c => c.id === data.courseId);
      if (course) {
        await courseService.update(course.id, { enrollmentCount: course.enrollmentCount + data.studentIds.length });
      }
    },
    onSuccess: (_, variables) => {
      notification.success({ message: `Successfully enrolled ${variables.studentIds?.length} students.` });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      enrollForm.resetFields();
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (data: FacultyBulkActionPayload) => {
      if (!data.instructorIds) return;
      const course = courses.find(c => c.id === data.courseId);
      if (course) {
        const newInstructors = Array.from(new Set([...course.instructors, ...data.instructorIds]));
        await courseService.update(data.courseId, { instructors: newInstructors });
      }
    },
    onSuccess: (_, variables) => {
      notification.success({ message: `Successfully assigned ${variables.instructorIds?.length} instructors.` });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      assignForm.resetFields();
    }
  });

  const gradeMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(gradeChanges).map(async ([studentId, data]) => {
        if (data.id) {
          return gradeService.update(data.id, { grade: data.grade });
        } else {
          return gradeService.create({ courseId: gradingCourse, studentId, grade: data.grade });
        }
      });
      await Promise.all(updates);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['grades', gradingCourse] });
      const previousGrades = queryClient.getQueryData(['grades', gradingCourse]);
      const newGrades = (previousGrades as any[] || []).map(g => {
        const change = gradeChanges[g.studentId];
        return change ? { ...g, grade: change.grade } : g;
      });
      queryClient.setQueryData(['grades', gradingCourse], newGrades);
      return { previousGrades };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['grades', gradingCourse], context?.previousGrades);
      notification.error({ message: 'Failed to update grades.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', gradingCourse] });
    },
    onSuccess: () => {
      notification.success({ message: 'Grades successfully updated.' });
      setGradeChanges({});
    }
  });

  const onBulkEnroll = (values: FacultyBulkActionPayload) => {
    confirm({
      title: 'Are you sure you want to bulk enroll these students?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action will instantly update student records.',
      onOk() { enrollMutation.mutate(values); },
    });
  };

  const onBulkAssign = (values: FacultyBulkActionPayload) => {
    assignMutation.mutate(values);
  };

  const gradingTableData = React.useMemo(() => {
    if (!gradingCourse) return [];
    return students.filter(s => s.courses.includes(gradingCourse)).map(s => {
      const existingGrade = grades.find(g => g.studentId === s.id);
      return {
        key: s.id,
        studentId: s.id,
        name: s.name,
        existingGradeId: existingGrade?.id,
        grade: gradeChanges[s.id]?.grade || existingGrade?.grade || '',
        isDirty: !!gradeChanges[s.id]
      };
    });
  }, [students, gradingCourse, grades, gradeChanges]);

  const handleGradeChange = (studentId: string, existingId: string | undefined, value: string) => {
    setGradeChanges(prev => ({
      ...prev,
      [studentId]: { id: existingId, grade: value }
    }));
  };

  const columns = [
    { title: 'Student Name', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { 
      title: 'Assign Grade', 
      key: 'grade',
      render: (_: unknown, record: { studentId: string; existingGradeId?: string; grade: string; isDirty: boolean }) => (
        <Select 
          style={{ width: 120 }} 
          value={record.grade || undefined}
          placeholder="Select Grade"
          onChange={(val) => handleGradeChange(record.studentId, record.existingGradeId, val)}
          options={['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(g => ({ label: g, value: g }))}
          className={record.isDirty ? 'border-blue-400' : ''}
        />
      )
    }
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>Faculty Operations</Title>
        <Text type="secondary">Manage bulk enrollments, instructor assignments, and grade students.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Bulk Enroll Students */}
        <Col xs={24} md={12}>
          <Card bordered={false} className="shadow-sm h-full" loading={loading} title={<div className="flex items-center gap-2"><Users className="text-blue-600 h-5 w-5" /><span>Bulk Enroll</span></div>}>
            <Form form={enrollForm} layout="vertical" onFinish={onBulkEnroll}>
              <Form.Item name="courseId" label="Select Course" rules={[{ required: true }]}>
                <Select placeholder="Choose a course" options={courses.map(c => ({ label: c.title, value: c.id }))} size="large" />
              </Form.Item>
              <Form.Item name="studentIds" label="Select Students" rules={[{ required: true, message: 'Please select at least one student' }]}>
                <Select mode="multiple" allowClear placeholder="Search students..." options={students.map(s => ({ label: `${s.name} (${s.year})`, value: s.id }))} size="large" filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                <Button type="primary" htmlType="submit" size="large" block icon={<UserPlus className="h-4 w-4 mr-1" />} loading={enrollMutation.isPending}>Execute Enrollment</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Bulk Assign Instructors */}
        <Col xs={24} md={12}>
          <Card bordered={false} className="shadow-sm h-full" loading={loading} title={<div className="flex items-center gap-2"><BookOpen className="text-green-600 h-5 w-5" /><span>Bulk Assign Instructors</span></div>}>
            <Form form={assignForm} layout="vertical" onFinish={onBulkAssign}>
              <Form.Item name="courseId" label="Select Course" rules={[{ required: true }]}>
                <Select placeholder="Choose a course" options={courses.map(c => ({ label: c.title, value: c.id }))} size="large" />
              </Form.Item>
              <Form.Item name="instructorIds" label="Select Faculty Members" rules={[{ required: true, message: 'Please select at least one instructor' }]}>
                <Select mode="multiple" allowClear placeholder="Search faculty..." options={faculties.map(f => ({ label: `${f.name} (${f.department})`, value: f.id }))} size="large" filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                <Button type="primary" htmlType="submit" size="large" block icon={<Save className="h-4 w-4 mr-1" />} loading={assignMutation.isPending}>Assign Instructors</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Grade Students Panel */}
        <Col xs={24}>
          <Card bordered={false} className="shadow-sm" loading={loading} title={<div className="flex items-center gap-2"><EditOutlined className="text-yellow-600 text-lg" /><span>Grade Students</span></div>}>
            <div className="mb-4 max-w-sm">
              <Text strong className="block mb-2">Select Course to Grade</Text>
              <Select 
                placeholder="Choose a course" 
                options={courses.map(c => ({ label: c.title, value: c.id }))} 
                size="large" 
                style={{ width: '100%' }}
                value={gradingCourse || undefined}
                onChange={setGradingCourse}
              />
            </div>

            {gradingCourse && (
              <>
                <Table 
                  scroll={{ x: 'max-content' }}
                  dataSource={gradingTableData} 
                  columns={columns} 
                  pagination={false} 
                  loading={loadG}
                  size="middle"
                  className="border border-gray-100 rounded-lg mb-4"
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => gradeMutation.mutate()} 
                    disabled={Object.keys(gradeChanges).length === 0}
                    loading={gradeMutation.isPending}
                  >
                    Save Grade Changes
                  </Button>
                </div>
              </>
            )}
            {!gradingCourse && (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: '8px', color: '#888', marginTop: '16px' }}>
                Please select a course to view enrolled students and edit their grades.
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
