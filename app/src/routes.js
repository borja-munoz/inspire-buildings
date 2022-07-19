import { lazy } from 'react';
import ProtectedRoute from 'components/common/ProtectedRoute';
import DefaultView from 'components/common/DefaultView';
import { Navigate } from 'react-router-dom';

const Main = lazy(() => import(/* webpackPrefetch: true */ 'components/views/main/Main'));
const NotFound = lazy(() => import('components/views/NotFound'));
const Login = lazy(() => import('components/views/Login'));
const Buildings = lazy(() => import('components/views/Buildings.js'));
// [hygen] Import views

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DEFAULT: '/',
  NOT_FOUND: '/404',
  BUILDINGS: '/buildings',
  // [hygen] Add path routes
};

const routes = [
  {
    path: ROUTE_PATHS.DEFAULT,
    element: (
      <ProtectedRoute>
        <DefaultView>
          <Main />
        </DefaultView>
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to='/buildings' /> },
      { path: ROUTE_PATHS.BUILDINGS, element: <Buildings /> },
      // [hygen] Add routes
    ],
  },
  { path: ROUTE_PATHS.LOGIN, element: <Login /> },
  {
    path: '*',
    element: (
      <DefaultView>
        <NotFound />
      </DefaultView>
    ),
  },
];

export default routes;
