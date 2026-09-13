import { Navigate, Outlet } from 'react-router-dom'
import { getSession } from '../utils/customerAuth'

function PublicOnly() {
  if (getSession()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicOnly
