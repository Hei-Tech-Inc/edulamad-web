import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type CreateAssessmentPayload = {
  courseOfferingId?: string;
  offeringId?: string;
  documentType: 'interim_assessment' | 'class_quiz' | 'class_test' | 'assignment' | 'final_exam';
  assessmentNumber?: number;
  assessmentType?: string;
  customLabel?: string;
  academicYear: string;
  file?: File | Blob;
  examSession?: string;
  title?: string;
  sourceType?: string;
  sourceUrl?: string;
  sourceNote?: string;
};

export const assessmentsApi = {
  upload: (dto: CreateAssessmentPayload) => {
    const form = new FormData();
    if (dto.file) form.append('file', dto.file);
    form.append('courseOfferingId', dto.courseOfferingId ?? dto.offeringId ?? '');
    form.append('documentType', dto.documentType);
    if (dto.assessmentNumber != null) {
      form.append('assessmentNumber', String(dto.assessmentNumber));
    }
    if (dto.assessmentType) form.append('assessmentType', dto.assessmentType);
    if (dto.customLabel) form.append('customLabel', dto.customLabel);
    form.append('academicYear', dto.academicYear);
    if (dto.examSession) form.append('examSession', dto.examSession);
    if (dto.title) form.append('title', dto.title);
    if (dto.sourceType) form.append('sourceType', dto.sourceType);
    if (dto.sourceUrl) form.append('sourceUrl', dto.sourceUrl);
    if (dto.sourceNote) form.append('sourceNote', dto.sourceNote);
    return apiClient.post(API.content.assessmentsUpload, form);
  },
  extractedContentUpload: (dto: unknown) =>
    apiClient.post(API.content.assessmentsExtractedContent, dto),
  getByCourse: (courseId: string, signal?: AbortSignal) =>
    apiClient.get(`/content/courses/${courseId}/assessments`, { signal }),
  getByOffering: (offeringId: string, signal?: AbortSignal) =>
    apiClient.get(`/content/offerings/${offeringId}/assessments`, { signal }),
};
