import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname or search params change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
