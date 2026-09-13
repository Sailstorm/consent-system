import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSession } from '../utils/customerAuth'

function RequireAuth() {
  const session = getSession()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/welcome" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default RequireAuth
