import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type React from 'react';
import { clearCredentials, selectUser } from '@/store/slices/authSlice';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';

function UserMenu(): React.JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    void navigate('/login', { replace: true });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <Typography variant="caption" weight="semibold" className="text-gray-900">
          {user?.name || user?.email || 'User'}
        </Typography>
        <Typography variant="caption" className="text-xs text-gray-500">
          {user?.email}
        </Typography>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default UserMenu;
