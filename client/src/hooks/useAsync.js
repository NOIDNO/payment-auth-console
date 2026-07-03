import { useCallback, useEffect, useState } from 'react';

/**
 * 비동기 함수의 로딩/데이터/에러 상태를 관리하는 범용 훅
 *
 * @param {() => Promise<any>} asyncFn - 실행할 비동기 함수 (매 렌더마다 새로 안 만들어지게 useCallback으로 감싸서 넘길 것)
 * @param {Array} deps - 이 배열의 값이 바뀔 때마다 asyncFn을 재실행
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: () => void }}
 */

export function useAsync(asyncFn, deps=[]){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const run = useCallback(()=> {
        setLoading(true);
        setError(null);
        asyncFn()
            .then((result) => setData(result))
            .catch((err)=> setError(err))
            .finally(()=> setLoading(false))
    }, deps)

    useEffect(()=>{
        run();
    }, [run]);

    return { data, loading, error, refetch : run}
}