import { Navigate,Outlet } from "react-router-dom";
import { STORAGE_KEYS } from "../constants/storageKeys";
function AuthRoute(){
    const token =localStorage.getItem(STORAGE_KEYS.TOKEN);
    if(!token){
        return<Navigate to="/login" replace/>
    }

    // 前端预检：token 过期或格式损坏就提前拦回登录页，不用等 API 返回 401
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        return <Navigate to="/login" replace/>;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return <Navigate to="/login" replace/>;
    }

    return <Outlet/>
}
export default AuthRoute;