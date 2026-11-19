import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAccessStatus, redeemAccessCode } from '../lib/accessApi';

export function useAccess() {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setHasAccess(false);
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    setError('');
    try {
      const status = await fetchAccessStatus();
      setHasAccess(status.hasAccess);
      setIsAdmin(status.isAdmin);
    } catch (err) {
      setHasAccess(false);
      setIsAdmin(false);
      setError(err instanceof Error ? err.message : 'Could not check access.');
    } finally {
      setChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const redeem = useCallback(async (code: string) => {
    setError('');
    await redeemAccessCode(code);
    setHasAccess(true);
  }, []);

  return {
    checking: authLoading || checking,
    hasAccess,
    isAdmin,
    error,
    setError,
    refresh,
    redeem,
  };
}
