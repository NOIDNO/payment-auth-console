import { apiClient } from './client';

/**
 * 인증내역 리스트 조회
 * @param {object} filters
 * @param {string} [filters.status] - 상태 필터
 * @param {string} [filters.method] - 인증방식 필터
 * @param {string} [filters.q] - 가맹점/고객명 검색어
 * @returns {Promise<Array>}
 */
export async function fetchPayments() {
  const { data } = await apiClient.get('/api/payments');
  return data;
}

export async function fetchDailyStats() {
  const { data } = await apiClient.get('/api/dailyStats');
  return data;
}