import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { getRouteByPath, getRouteById, RouteConfig } from '../routes/routes.config';

interface UseRoutingReturn {
  currentRoute: RouteConfig | undefined;
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  params: ReturnType<typeof useParams>;
  navigateToRoute: (routeId: string) => void;
  isActiveRoute: (routeId: string) => boolean;
  breadcrumbs: Array<{ label: string; path?: string }>;
}

export const useRouting = (): UseRoutingReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const currentRoute = useMemo(() => {
    return getRouteByPath(location.pathname);
  }, [location.pathname]);

  const navigateToRoute = (routeId: string) => {
    const route = getRouteById(routeId);
    if (route) {
      navigate(route.path);
    }
  };

  const isActiveRoute = (routeId: string) => {
    return currentRoute?.id === routeId;
  };

  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{ label: string; path?: string }> = [
      { label: 'Home', path: '/' },
    ];

    if (currentRoute) {
      crumbs.push({ label: currentRoute.section });
      crumbs.push({ label: currentRoute.label, path: currentRoute.path });
    }

    return crumbs;
  }, [currentRoute]);

  return {
    currentRoute,
    navigate,
    location,
    params,
    navigateToRoute,
    isActiveRoute,
    breadcrumbs,
  };
};