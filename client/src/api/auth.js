import { apiClient } from './client'

// 현재 로그인 세션 정보 조회
export async function fetchMe() {
    const { data } = await apiClient.get('/api/me');
    return data;
}

//로그아웃 처리 (서버 측 인증 쿠키 삭제 요청)
export async function logout() {
    await apiClient.post('/api/logout');
}