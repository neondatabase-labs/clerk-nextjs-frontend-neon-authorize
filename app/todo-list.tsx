"use client";

import { Todo } from "@/app/schema";
import { TodosContext } from "@/app/todos-provider";
import { CSSProperties, useContext } from "react";

import { getDb } from "@/app/db";
import { useSession } from "@clerk/nextjs";

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  todoList: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    padding: "20px",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    margin: "8px 0",
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  todoText: {
    flex: 1,
    marginRight: "10px",
    fontSize: "16px",
    color: "#333",
  },
  buttonGroup: {
    display: "flex",
    gap: "6px",
  },
  button: {
    padding: "6px 10px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    background: "white",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666",
    padding: "20px",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666",
    padding: "20px",
  },
  pendingCount: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "15px",
    textAlign: "center" as const,
  },
} satisfies Record<string, CSSProperties>;

export function TodoList() {
  const { todos, setTodos } = useContext(TodosContext);
  const { session } = useSession();

  // if loading, just show basic message
  if (todos === null) {
    return <div style={styles.loading}>Loading...</div>;
  }

  async function checkOrUncheckTodoFormAction(formData: FormData) {
    const authToken = await session?.getToken();
    if (!authToken) {
      throw new Error("No auth token");
    }

    const id = formData.get("id");
    const isComplete = formData.get("isComplete");

    if (typeof id !== "string" || typeof isComplete !== "string") {
      throw new Error("Invalid form data");
    }

    if (todos === null) {
      throw new Error("Todos is null");
    }

    const isCompleteBool = isComplete === "true";

    const newTodo = (
      (await getDb(authToken)(
        `UPDATE todos SET is_complete = $1 WHERE id = $2 RETURNING *`,
        [!isCompleteBool, id],
      )) as Array<Todo>
    )[0];

    setTodos(
      todos.map((todo) => {
        // @ts-ignore
        if (todo.id === id) {
          return newTodo;
        }
        return todo;
      }),
    );
  }

  async function deleteTodoFormAction(formData: FormData) {
    const authToken = await session?.getToken();
    if (!authToken) {
      throw new Error("No auth token");
    }
    const id = formData.get("id");
    if (typeof id !== "string") {
      throw new Error("Invalid form data");
    }
    if (todos === null) {
      throw new Error("Todos is null");
    }
    await getDb(authToken)(`DELETE FROM todos WHERE id = $1`, [id]);
    // @ts-ignore
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // Calculate the number of pending todos
  // @ts-ignore
  const pendingTodos = todos.filter((todo) => !todo.is_complete).length;

  return (
    <div style={styles.container}>
      <div style={styles.todoList}>
        {/* Add the pending todos count */}
        <div style={styles.pendingCount}>
          {pendingTodos} todo{pendingTodos !== 1 ? "s" : ""} remaining
        </div>
        {todos.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todos.map((todo) => (
              <li key={todo.id} style={styles.todoItem}>
                <span
                  style={{
                    ...styles.todoText,
                    // @ts-ignore
                    textDecoration: todo.is_complete ? "line-through" : "none",
                  }}
                >
                  {todo.task}
                </span>
                <div style={styles.buttonGroup}>
                  <form action={checkOrUncheckTodoFormAction}>
                    <input
                      name="isComplete"
                      type="hidden"
                      // @ts-ignore
                      value={String(todo.is_complete)}
                    />
                    <input name="id" type="hidden" value={String(todo.id)} />
                    <button style={styles.button} type="submit">
                      {
                        // @ts-ignore
                        todo.is_complete ? "↩️" : "✅"
                      }
                    </button>
                  </form>
                  <form action={deleteTodoFormAction}>
                    <input name="id" type="hidden" value={String(todo.id)} />
                    <button style={styles.button} type="submit">
                      🗑️
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={styles.emptyMessage}>You don't have any todos!</div>
        )}
      </div>
    </div>
  );
}
