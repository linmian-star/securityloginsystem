import {useState} from "react"
function User(){
    const[list,setList]=useState([
        {id:1,name:"张三",age:20},
        {id:2,name:"李四",age:22},
        {id:3,name:"王五",age:25}
    ])
    const handleDelete=(id)=>{
        const newList=List.filter(item=>item.id!==id)
        setList(newList)
    
    }
    return (
  <div>
    <h2>用户管理</h2>

    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>年龄</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        {
          list.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>
                <button onClick={() => handleDelete(item.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
)
    
}
export default User
