import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/atoms/sonner';
import { LoadingScreen } from '@/components/organisms';
import { useGetMeQuery } from '@/store/api';
import { clearCredentials, selectIsAuthenticated, setCurrentUser } from '@/store/slices/authSlice';

function AuthBootstrap({ children }: { children: React.ReactNode }): React.ReactElement | null {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const {
    data: me,
    isError,
    isLoading,
    isFetching,
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isAuthenticated || isFetching || !me) return;
    dispatch(setCurrentUser(me));
  }, [dispatch, isAuthenticated, isFetching, me]);

  useEffect(() => {
    if (!isAuthenticated || !isError) return;
    dispatch(clearCredentials());
  }, [dispatch, isAuthenticated, isError]);

  if (isAuthenticated && (isLoading || isFetching)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
