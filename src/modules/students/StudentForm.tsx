'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Select, Button, Card, Typography, Row, Col, Space, InputNumber, App } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Course, Grade } from '@/types';

const { Title } = Typography;

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  year: z.string().min(1, 'Year is required'),
  GPA: z.number().min(0, 'Min 0').max(4, 'Max 4'),
  grades: z.array(z.object({
    courseId: z.string().min(1, 'Course is required'),
    grade: z.string().min(1, 'Grade is required')
  })).optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { control, handleSubmit, reset } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', email: '', year: undefined, GPA: 0, grades: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'grades' });

  const { data: courses = [] } = useQuery<Course[]>({ queryKey: ['courses'], queryFn: courseService.getAll });
  
  const { data: student, isLoading: loadingSt } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id),
    enabled: isEdit,
  });

  const { data: existingGrades, isLoading: loadingGr } = useQuery({
    queryKey: ['grades', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Grade[]>(`/grades?studentId=${id}`);
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && student && existingGrades) {
      const mappedGrades = student.courses.map(courseId => {
        const matchingGrade = existingGrades.find((g: Grade) => g.courseId === courseId);
        return {
          courseId,
          grade: matchingGrade ? matchingGrade.grade : ''
        };
      });

      reset({
        name: student.name,
        email: student.email,
        year: student.year,
        GPA: student.GPA,
        grades: mappedGrades
      });
    }
  }, [isEdit, student, existingGrades, reset]);

  // True Optimistic Update implementations 
  const createMutation = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const payload = {
        name: data.name,
        email: data.email,
        year: data.year,
        GPA: data.GPA,
        courses: data.grades ? data.grades.map(g => g.courseId) : [],
      };
      
      const createdStudent = await studentService.create(payload);
      
      if (data.grades && data.grades.length > 0) {
        await Promise.all(data.grades.map(g => 
          apiClient.post('/grades', { studentId: createdStudent.id, courseId: g.courseId, grade: g.grade })
        ));
      }
      return createdStudent;
    },
    onSuccess: () => {
      notification.success({ title: 'Student created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      router.push('/students');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const payload = {
        name: data.name,
        email: data.email,
        year: data.year,
        GPA: data.GPA,
        courses: data.grades ? data.grades.map(g => g.courseId) : [],
      };
      
      await studentService.update(id, payload);

      if (data.grades) {
        const { data: currentGrades } = await apiClient.get<Grade[]>(`/grades?studentId=${id}`);
        
        const updates = data.grades.map(async (g) => {
          const existing = currentGrades.find(cg => cg.courseId === g.courseId);
          if (existing) {
            if (existing.grade !== g.grade) {
              return apiClient.patch(`/grades/${existing.id}`, { grade: g.grade });
            }
          } else {
            return apiClient.post(`/grades`, { studentId: id, courseId: g.courseId, grade: g.grade });
          }
        });

        const currentCourseIds = data.grades.map(g => g.courseId);
        const deletes = currentGrades
          .filter(cg => !currentCourseIds.includes(cg.courseId))
          .map(cg => apiClient.delete(`/grades/${cg.id}`));

        await Promise.all([...updates, ...deletes] as Promise<any>[]);
      }
    },
    onMutate: async (newStudentData) => {
      await queryClient.cancelQueries({ queryKey: ['student', id] });
      await queryClient.cancelQueries({ queryKey: ['students'] });
      await queryClient.cancelQueries({ queryKey: ['grades', id] });
      
      const previousStudent = queryClient.getQueryData(['student', id]) || {};
      
      const optimisticStudent = {
        ...previousStudent as object,
        ...newStudentData,
        courses: newStudentData.grades?.map(g => g.courseId) || []
      };

      queryClient.setQueryData(['student', id], optimisticStudent);
      
      notification.success({ title: 'Student updating...' });
      return { previousStudent };
    },
    onError: (err, newStudentData, context) => {
      notification.error({ title: 'Update failed, rolling back.' });
      queryClient.setQueryData(['student', id], context?.previousStudent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['grades', id] });
      router.push('/students');
    }
  });

  const onSubmit = (values: StudentFormValues) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoadingData = isEdit && (loadingSt || loadingGr);

  if (isLoadingData) return <Card loading={true} style={{ maxWidth: '768px', margin: '32px auto 0' }} />;

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%', maxWidth: '768px', margin: '0 auto', display: 'flex' }}>
      <Link href="/students" className="text-gray-500 hover:text-blue-600 flex items-center mb-2">
        <ArrowLeftOutlined className="mr-2" /> Back to Students
      </Link>

      <Card variant="borderless" className="shadow-sm">
        <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>{isEdit ? 'Edit Student' : 'Add New Student'}</Title>
        
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Controller name="name" control={control} render={({ field, fieldState }) => (
                <Form.Item label="Full Name" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}>
                  <Input {...field} placeholder="John Doe" size="large" />
                </Form.Item>
              )} />
            </Col>
            <Col xs={24} md={12}>
              <Controller name="email" control={control} render={({ field, fieldState }) => (
                <Form.Item label="Email Address" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}>
                  <Input {...field} placeholder="john@university.edu" size="large" />
                </Form.Item>
              )} />
            </Col>
            <Col xs={24} md={12}>
              <Controller name="year" control={control} render={({ field, fieldState }) => (
                <Form.Item label="Year" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}>
                  <Select {...field} placeholder="Select a year" size="large" options={['Freshman', 'Sophomore', 'Junior', 'Senior'].map(y => ({ label: y, value: y }))} />
                </Form.Item>
              )} />
            </Col>
            <Col xs={24} md={12}>
              <Controller name="GPA" control={control} render={({ field, fieldState }) => (
                <Form.Item label="Current GPA" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}>
                  <InputNumber {...field} min={0} max={4} step={0.1} size="large" style={{ width: '100%' }} />
                </Form.Item>
              )} />
            </Col>
          </Row>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <div className="flex items-center justify-between mb-4">
              <Title level={4} style={{ margin: 0 }}>Grades & Enrollment</Title>
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 relative" style={{ position: 'relative' }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Controller name={`grades.${index}.courseId`} control={control} render={({ field, fieldState }) => (
                      <Form.Item label="Course" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message} className="mb-0" style={{ width: '100%' }}>
                        <Select {...field} placeholder="Select course" options={courses.map(c => ({ label: c.title, value: c.id }))} style={{ width: '100%' }} size="large" className="w-full" />
                      </Form.Item>
                    )} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Controller name={`grades.${index}.grade`} control={control} render={({ field, fieldState }) => (
                      <Form.Item label="Grade" validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message} className="mb-0" style={{ width: '100%' }}>
                        <Select {...field} placeholder="Select grade" options={['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(g => ({ label: g, value: g }))} style={{ width: '100%' }} size="large" className="w-full" />
                      </Form.Item>
                    )} />
                  </Col>
                </Row>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(index)} />
                </div>
              </div>
            ))}
            
            <Form.Item>
              <Button type="dashed" onClick={() => append({ courseId: '', grade: '' })} block icon={<PlusOutlined />} size="large">
                Add Course Enrollment
              </Button>
            </Form.Item>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'Update Student' : 'Save Student'}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </Space>
  );
}
