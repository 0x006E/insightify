import { MainNav } from '@/components/ui/main-nav';
import Sidenav, { NavItem } from '@/components/ui/sidenav';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const items: NavItem[] = [
    {
      title: 'Results',
      to: '/results',
    },
    {
      title: 'Settings',
      to: '/settings',
    },
    {
      title: 'Views',
      to: '/views',
    },
    {
      title: 'Staff Details',
      to: '/staff-details',
    },
    // {
    //   title: "Student's Details",
    //   to: '/student-details',
    // }
  ];
  return (
    <div className="h-screen overflow-hidden">
      <MainNav />
      <div className="flex h-full">
        <Sidenav items={items} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
