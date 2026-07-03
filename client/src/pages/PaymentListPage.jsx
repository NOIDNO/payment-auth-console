import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { fetchPaymentList } from '../api/payments';

const STATUS_OPTIONS = ['전체', '성공', '실패', '진행중', '만료'];
const PAGE_SIZE = 5;

const PaymentListPage = () =>{

    //전체 리스트는 한 번만
    const { data: list, loading } = useAsync(fetchPaymentList, []);

    const [statusFilter, setStatusFilter] = useState('전체');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);

    //필터링된 리스트 계산 - list, statusFileter, keyword 중 하나라도 바뀔 때만 재계산
    const fileterList = useMemo(()=>{
        if(!list) return [];


    })

return (
    <div>
      <h1 style={{ marginTop: 0 }}>결제내역 조회</h1>

      
    </div>
  );
};

export default PaymentListPage;