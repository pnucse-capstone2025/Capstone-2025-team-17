import { Outlet } from 'react-router-dom';
import Header from '../../share/components/ui/Header';
import { menuItems } from '../../share/constants/menuItems';

export default function MyProblemsLayout() {
  return (
    <>
      <Header menuItems={menuItems} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
