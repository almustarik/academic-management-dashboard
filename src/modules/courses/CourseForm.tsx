'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Select, Button, Card, Typography, Space, notification } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { facultyService } from '@/services/facultyService';
import Link from 'next/link';
import { Course } from '@/types';

const { Title } = Typography;

interface CourseFormPayload {
  title: string;
  instructors?: { instructorId: string }[];
}

export function CourseForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id);
  
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Queries
  const { data: faculty = [] } = useQuery({ queryKey: ['faculty'], queryFn: facultyService.getAll });
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && course) {
      form.setFieldsValue({
        title: course.title,
        instructors: course.instructors.map(fid => ({ instructorId: fid }))
      });
    }
  }, [isEdit, course, form]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      notification.success({ message: 'Course created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.push('/courses');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Course>) => courseService.update(id, data),
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({ queryKey: ['course', id] });
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previousCourse = queryClient.getQueryData(['course', id]) || {};
      queryClient.setQueryData(['course', id], { ...(previousCourse as object), ...newCourse });
      return { previousCourse };
    },
    onError: (err, newCourse, context) => {
      queryClient.setQueryData(['course', id], context?.previousCourse);
      notification.error({ message: 'Update failed, rolling back.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
    onSuccess: () => {
      notification.success({ message: 'Course updated successfully!' });
      router.push('/courses');
    }
  });

  const onFinish = (values: CourseFormPayload) => {
    const instructorIds = values.instructors ? values.instructors.map(i => i.instructorId) : [];
    if (isEdit) {
      updateMutation.mutate({ title: values.title, instructors: instructorIds });
    } else {
      createMutation.mutate({ title: values.title, instructors: instructorIds, enrollmentCount: 0 } as Omit<Course, 'id'>);
    }
  };

  if (isEdit && isLoading) return <Card loading={true} style={{ maxWidth: '768px', margin: '32px auto 0' }} bordered={false} />;

  return (
    <Space direction="vertical" size={24} style={{ width: '100%', maxWidth: '768px', margin: '0 auto', display: 'flex' }}>
      <Link href="/courses" className="text-gray-500 hover:text-blue-600 flex items-center mb-2">
        <ArrowLeftOutlined className="mr-2" /> Back to Courses
      </Link>

      <Card bordered={false} className="shadow-sm">
        <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>{isEdit ? 'Edit Course' : 'Create Course'}</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ instructors: [{ instructorId: undefined }] }}
        >
          <Form.Item name="title" label="Course Title" rules={[{ required: true, message: 'Please enter course title' }, { min: 3, message: 'Title too short' }]}>
            <Input placeholder="e.g. Advanced Calculus" size="large" />
          </Form.Item>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <div className="flex items-center justify-between mb-4">
              <Title level={4} style={{ margin: 0 }}>Assigned Instructors</Title>
            </div>

            <Form.List name="instructors">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <Form.Item {...restField} name={[name, 'instructorId']} rules={[{ required: true, message: 'Instructor is required' }]} className="mb-0">
                          <Select placeholder="Select instructor" options={faculty.map(f => ({ label: f.name, value: f.id }))} size="large" />
                        </Form.Item>
                      </div>
                      {fields.length > 1 && (
                        <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} style={{ marginTop: '4px' }} />
                      )}
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">
                      Add Instructor
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'Update Course' : 'Save Course'}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </Space>
  );
}
