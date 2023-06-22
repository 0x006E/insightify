import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from './button';

export interface NavItem {
  icon?: React.ReactNode;
  title: string;
  to?: string;
}

function Sidenav(props: { items: NavItem[] }) {
  const { items } = props;
  return (
    <div className="py-2 w-56 shadow-sm border-r border-gray-200 h-full">
      {items.map((item, index) => (
        <NavLink to={item.to ?? '/'} key={index} className="flex items-center gap-2 p-2 text-bold">
          <Button variant={'link'} className="text-bold">
            {item.title}
          </Button>
        </NavLink>
      ))}
    </div>
  );
}

export default Sidenav;
