import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { pickFirstHttpUrl } from '@/lib/api/pick-http-url';

export function urlFromSignedPayload(data: unknown): string | null {
  const rec = data && typeof data === 'object' ? data : null;
  return rec && typeof (rec as { url?: string }).url === 'string'
    ? (rec as { url: string }).url
    : typeof data === 'string'
      ? data
      : null;
}

export async function fetchFileSignedUrl(
  attachmentKey: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const path = API.files.signedUrl(encodeURIComponent(attachmentKey));
  const { data } = await apiClient.get<unknown>(path, { signal });
  return urlFromSignedPayload(data) || pickFirstHttpUrl(data);
}

export async function getQuestionSourceDocument(
  questionId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const { data } = await apiClient.get<unknown>(API.questions.sourceDocument(questionId), {
    signal,
  });
  return data;
}

export async function fetchQuestionSourceDocumentUrl(
  questionId: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const data = await getQuestionSourceDocument(questionId, signal);
  return urlFromSignedPayload(data) || pickFirstHttpUrl(data);
}
