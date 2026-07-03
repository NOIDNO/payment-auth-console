import axios from 'axios'

export const apiClient = axios.create({
    baseURL : 'http://localhost:4000',
    withCredentials: true, // 쿠키에 요청을 자동으로 실어보내라
});

//토큰 만료시 refresh, 성공하면 원래 요청 보내기
let isRefreshing = false;

/**
 * 응답 인터셉터: 401(액세스 토큰 만료) 발생 시 자동 재발급 후 원 요청 재시도
 * - refresh 자체가 실패하면 재로그인 필요 상태로 간주, 로그인 페이지로 이동
 * - _retry 플래그로 무한 재시도 방지
 */
apiClient.interceptors.response.use(
    (res) => res,
    async (error) =>{
        const originalRequest = error.config;

        // 토큰 에러인지? / 이미 재시도한 요청인지?(반복 안되게)
        if(error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }


        // refresh API 자체가 401난 거면(=refreshToken도 만료) 재시도 의미 없음
        if (originalRequest.url === '/api/refresh') {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            await apiClient.post('/api/refresh');
            return apiClient(originalRequest);
        } catch (error) {
            window.location.href = 'http://localhost:4000/login'
            return Promise.reject(refreshError)
        }

    }
)