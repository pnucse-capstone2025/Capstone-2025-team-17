import Header from '@/share/components/ui/Header';
import { Outlet } from 'react-router-dom';
import { menuItems } from '../../share/constants/menuItems';

export default function RoadmapLayout() {
  return (
    <>
      <Header menuItems={menuItems} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
