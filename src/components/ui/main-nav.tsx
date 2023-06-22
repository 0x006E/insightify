import { ReactComponent as Logo } from '@/assets/logo.svg';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';

export function MainNav() {
  //   const pathname = useLocation().pathname;
  return (
    <div className="mr-4 flex p-4 border-b border-gray-200">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <Logo className="h-8" />
      </Link>
      <nav className="flex items-center justify-end w-full space-x-3 text-sm font-medium">
        {/* <Button variant={'secondary'} className="flex gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden md:block">Import existing</span>
        </Button> */}
        <Button
          className="flex gap-2"
          onClick={() => {
            indexedDB.deleteDatabase('/wheels');
            window.location.reload();
          }}
        >
          <RefreshCcw className="w-4 h-4" />

          <span className="hidden md:block">Clear Cache</span>
        </Button>
      </nav>
    </div>
  );
}
