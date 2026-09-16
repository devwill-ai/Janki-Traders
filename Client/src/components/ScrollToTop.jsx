import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that navigating to any route or updating search parameters
 * resets the scroll position to the top of the page.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Scroll window and root elements to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    if (document.documentElement) {
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }

    if (document.body) {
      document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }

    // Also reset any scrollable layout containers
    const scrollContainers = document.querySelectorAll('main, .overflow-y-auto');
    scrollContainers.forEach((container) => {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    });
  }, [pathname, search, hash]);

  return null;
};
