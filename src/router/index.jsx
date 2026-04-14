import {createBrowserRouter,Navigate} from"react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import user from "../pages/user"
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
        path:"/",
        element:<Navigate to="/Login" replace/>
    },
    {
        path:"/login",
        element:<Login/>
    },
    {
        path:"/Dashboard",
        element:(<AuthRoute><Dashboard/></AuthRoute>),
        children:[
            {
                path:"user",element:<user/>
            }
        ]

    }

])
export default router