import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();



function App() {
    const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const [familyName, setFamilyName] = useState<string>('');

useEffect(() => {
  async function loadUserAttributes() {
    try {
      const attributes = await fetchUserAttributes();
      setFamilyName(attributes.family_name ?? '');
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  }

  loadUserAttributes();
}, []);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }


  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <h1>My Sequoia Camp Application</h1>
       {familyName && (
      <h2>Family: {familyName}</h2>
    )}
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
            <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
