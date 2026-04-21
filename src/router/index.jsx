import {createBrowserRouter,Navigate} from"react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import User from "../pages/User"
import MainLayout from "../layout/MainLayout"
const AuthRoute =({children})=>{
    const token=localStorage.getItem("token")
    if(!token){
        return<Navigate to="/Login" replace/>
    }
        return children
    }


const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/Login" replace />

    },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/dashboard", // 变成平级
    element: <AuthRoute><Dashboard /></AuthRoute>
  },
  {
    path: "/User", // 变成平级，不再是 dashboard 的子路由
    element: <User />
  }
])
export default router