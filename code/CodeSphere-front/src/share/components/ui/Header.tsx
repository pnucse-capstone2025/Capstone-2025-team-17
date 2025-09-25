import LoginDialog from '@/share/components/LoginDialog';
import { Button } from '@/share/components/ui/Button';
import { menuItemsType } from '@/share/constants/menuItems';
import { useAuthStore } from '@/share/store/authStore';
import { Code2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface HeaderProps {
  menuItems: menuItemsType[];
}

export default function Header({ menuItems }: HeaderProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);

  const goHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const onOpenChange = (show: boolean) => {
    setOpen(show);
  };

  return (
    <>
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Button
                className="flex h-10 cursor-pointer items-center space-x-2"
                variant="ghost"
                onClick={goHome}
              >
                <Code2
                  className="h-12 text-blue-600"
                  style={{ width: 'fit-content', height: '100%' }}
                />
                <span className="text-xl font-bold text-gray-900">
                  CodeSphere
                </span>
              </Button>
              <nav className="hidden space-x-6 md:flex">
                {menuItems.map((menuItem) => (
                  <NavLink
                    key={menuItem.to}
                    to={menuItem.to}
                    className={({ isActive }) =>
                      `flex cursor-pointer rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white hover:bg-gray-700 hover:!text-white'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`
                    }
                  >
                    {menuItem.icon}
                    {menuItem.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button variant="outline" onClick={handleLogout}>
                  로그아웃
                </Button>
              ) : (
                <Button variant="outline" onClick={() => onOpenChange(true)}>
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginDialog open={open} onOpenChange={onOpenChange} />
    </>
  );
}
