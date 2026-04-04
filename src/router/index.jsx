import {createBrowserRouter,Navigate} from"react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
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
        element:(<AuthRoute><Dashboard/></AuthRoute>)
    }

])
export default router