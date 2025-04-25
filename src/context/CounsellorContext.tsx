import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BaseCounsellor, getAllCounsellors } from '@/utils/experts';

interface CounsellorContextType {
  counsellors: BaseCounsellor[];
  loading: boolean;
  error: string | null;
  refreshCounsellors: () => Promise<void>;
}

const CounsellorContext = createContext<CounsellorContextType | undefined>(undefined);

export const CounsellorProvider = ({ children }: { children: ReactNode }) => {
  const [counsellors, setCounsellors] = useState<BaseCounsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCounsellors();
      setCounsellors(data);
    } catch (err) {
      setError('Failed to fetch counsellors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const refreshCounsellors = async () => {
    await fetchCounsellors();
  };

  return (
    <CounsellorContext.Provider value={{ counsellors, loading, error, refreshCounsellors }}>
      {children}
    </CounsellorContext.Provider>
  );
};

export const useCounsellorContext = () => {
  const context = useContext(CounsellorContext);
  if (context === undefined) {
    throw new Error('useCounsellorContext must be used within a CounsellorProvider');
  }
  return context;
}; 