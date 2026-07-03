import { useCallback, useMemo } from 'react';
import { useAsync } from '../hooks/useAsync';
import { fetchPayments, fetchDailyStats } from '../api/payments';

const DashboardPage = () => {
  const fetchDashboardData = useCallback(
    () => Promise.all([fetchPayments(), fetchDailyStats()]),
    []
  );
  const { data, loading } = useAsync(fetchDashboardData, []);
  const [list, daily] = data ?? [[], []];

  // daily가 바뀔 때만 재계산 (리렌더마다 배열 다시 순회하지 않도록)
  const { totalSuccess, totalFail } = useMemo(() => {
    return {
      totalSuccess: daily.reduce((sum, d) => sum + d.성공, 0),
      totalFail: daily.reduce((sum, d) => sum + d.실패, 0),
    };
  }, [daily]);

  if (loading) return <p>불러오는 중…</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>대시보드</h1>
      <p style={{ color: '#6b7686' }}>최근 7일 성공 {totalSuccess}건 · 실패 {totalFail}건</p>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>최근 결제 요청</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #e3e7ee' }}>
            <th style={{ padding: 8 }}>인증번호</th>
            <th style={{ padding: 8 }}>가맹점</th>
            <th style={{ padding: 8 }}>금액</th>
            <th style={{ padding: 8 }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: 8 }}>{item.authNo}</td>
              <td style={{ padding: 8 }}>{item.merchant}</td>
              <td style={{ padding: 8 }}>{item.amount.toLocaleString()}원</td>
              <td style={{ padding: 8 }}>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardPage;