import { useEffect, useState } from "react";
import { CanceledError } from "./services/api-client"
import userService, { User } from "./services/user-service";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const { request, cancel } = userService.getAll<User>();
    request
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if(err instanceof CanceledError) return;
        setError(err.message);
        setLoading(false);
      });
    return () => cancel();
  }, []);

  const onDelete = (user: User) => {
    const originalUsers = [...users];
    setUsers(users.filter((u) => u.id !== user.id));
    userService.delete(user.id).catch((err) => {
      setUsers(originalUsers);
      setError(err.message);
    });
  };
  const onUpdate = (user: User) => {
    const originalUsers = [...users];
    const updatedUser = { ...user, name: user.name + "!!!" };
    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    userService.update(updatedUser).catch((err) => {
      setUsers(originalUsers);
      setError(err.message);
    });
  };
  const addUser = () => {
    const originalUsers = [...users];
    const newUser = { id: 0, name: "Cosmin Moldovan" };
    setUsers([newUser, ...users]);
    userService.create(newUser)
      .then(({ data: savedUser }) => setUsers([savedUser, ...users]))
      .catch((err) => {
        setUsers(originalUsers);
        setError(err.message);
      });
  };

  return (
    <div className="App">
      <h3 className="text-center mb-5">Http Methods</h3>
      {loading && (
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
        </div>
      )}
      {error && <p className="text-danger text-center">{error}</p>}
      <button className="btn btn-primary mb-3" type="button" onClick={addUser}>
        Add User
      </button>
      <ul className="list-group">
        {users?.map((user) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center"
            key={user.id}
          >
            {user.name}
            <div>
              <button
                type="button"
                className="btn btn-outline-dark mx-4"
                onClick={() => onUpdate(user)}
              >
                Update
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => onDelete(user)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
