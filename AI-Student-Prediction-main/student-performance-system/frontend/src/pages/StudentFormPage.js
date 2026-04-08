import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import StudentForm from '../components/forms/StudentForm';
import { getApiErrorMessage } from '../services/apiClient';
import studentService from '../services/studentService';
import { studentFormDefaults } from '../utils/studentFields';

const StudentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [initialValues, setInitialValues] = useState(studentFormDefaults);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (!isEditMode) {
      return undefined;
    }

    const loadStudent = async () => {
      setLoading(true);
      setError('');

      try {
        const student = await studentService.getStudent(id);
        if (isMounted) {
          setInitialValues(student);
        }
      } catch (error) {
        if (isMounted) {
          setError(getApiErrorMessage(error, 'Unable to load the student record.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      if (isEditMode) {
        await studentService.updateStudent(id, payload);
      } else {
        await studentService.createStudent(payload);
      }

      navigate('/students', { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to save the student record.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin Workflow</p>
          <h1>{isEditMode ? 'Edit Student Record' : 'Add Student Record'}</h1>
          <p className="page-copy">
            Store one student at a time using the existing prediction model input fields so the record can be edited,
            searched, and predicted later from the admin portal.
          </p>
        </div>
      </section>

      <Alert tone="error">{error}</Alert>

      <section className="panel">
        {loading ? (
          <Spinner label="Loading student details..." />
        ) : (
          <StudentForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel={isEditMode ? 'Save Changes' : 'Create Student'}
            submitting={submitting}
          />
        )}
      </section>
    </div>
  );
};

export default StudentFormPage;
