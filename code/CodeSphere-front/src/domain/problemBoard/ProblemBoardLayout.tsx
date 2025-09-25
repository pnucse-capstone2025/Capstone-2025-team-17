import { Outlet } from 'react-router-dom';
import Header from '../../share/components/ui/Header';
import { menuItems } from '../../share/constants/menuItems';

export default function ProblemBoardLayout() {
  // const menuItems: menuItemsType[] = [
  //   { name: '로그아웃', to: '/' },
  //   { name: '홈으로', to: '/home' },
  // ];

  return (
    <>
      <Header menuItems={menuItems} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
