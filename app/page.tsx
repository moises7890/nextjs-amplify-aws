"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [editingTodo, setEditingTodo] = useState<Schema["Todo"]["type"] | null>(null);
  const [newContent, setNewContent] = useState<string>("");

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content") || "";
    if (content.trim()) {  // Verifica que el contenido no esté vacío
      client.models.Todo.create({
        content: content,
      });
    }
  }  

  function startEditing(todo: Schema["Todo"]["type"]) {
    setEditingTodo(todo);
    setNewContent(todo.content ?? ""); // Usa una cadena vacía si `content` es `null` o `undefined`
  }
  
  function saveTodo() {
    if (editingTodo) {
      client.models.Todo.update({
        id: editingTodo.id,
        content: newContent,
      }).then(() => {
        setEditingTodo(null);
        setNewContent("");
      });
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>My todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} onClick={() => startEditing(todo)}>
                {todo.content}
              </li>
            ))}
          </ul>
          <button onClick={signOut}>Cerrar sesión</button>

          {editingTodo && (
            <div className="modal">
              <h2>Edit Todo</h2>
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <button onClick={saveTodo}>Save</button>
              <button onClick={() => setEditingTodo(null)}>Cancel</button>
            </div>
          )}

          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
              Review next steps of this tutorial.
            </a>
          </div>
        </main>
      )}
    </Authenticator>
  );
}

