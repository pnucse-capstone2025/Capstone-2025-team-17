import { Outlet } from 'react-router-dom';
import Header from '../../share/components/ui/Header';
import { menuItems } from '../../share/constants/menuItems';

export default function HomeLayout() {
  return (
    <>
      <Header menuItems={menuItems} />
      <main className="w-100%">
        <Outlet />
      </main>
    </>
  );
}
