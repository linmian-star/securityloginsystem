import { getUsers, deleteUser } from '../../api/users';
import useFetch from '../../hooks/useFetch';

function User() {
  // useFetch 替代手写的 list/loading/useEffect 样板
  const { data: list, loading, refetch } = useFetch(getUsers, {
    initialData: [],
    transform: (res) => res.data.data,
  });

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      refetch();
    } catch (err) {
      console.error("删除失败", err);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h2>用户管理</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {
            list.map(item => (
              <tr key={item._id}>
                <td>{item._id}</td>
                <td>{item.username}</td>
                <td>{item.role}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(item._id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default User;
