import {BrowseRouter,Routes,Route} from "react-router-dom";

import Login from "./pages/Login";

function App() {

  return(
    <BrowseRouter>
    <Routes>
      <Route path="/"
      element={<Login/>}/>
      <Route path="home"
      element={<div>这是登录后的首页</div>}/>
      </Routes></BrowseRouter>
  )
}
export default App;
  