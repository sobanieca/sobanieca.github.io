import { Hono } from "hono";

const API_KEY = "391495ab-3540-47fd-b420-c654489a1a39";

const app = new Hono();

app.use("*", async (c, next) => {
  if (c.req.header("Authorization") !== `ApiKey ${API_KEY}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

const lists = new Map();
let listCounter = 0;
let todoCounter = 0;

// POST /lists
app.post("/lists", async (c) => {
  const { name } = await c.req.json();
  const id = String(++listCounter);
  lists.set(id, { id, name, todos: [] });
  return c.json({ id }, 201);
});

// POST /lists/:listId/todos
app.post("/lists/:listId/todos", async (c) => {
  const list = lists.get(c.req.param("listId"));
  if (!list) return c.json({ error: "List not found" }, 404);

  const items = await c.req.json();
  for (const item of items) {
    list.todos.push({
      id: String(++todoCounter),
      content: item.content,
      status: "pending",
    });
  }
  return c.body(null, 204);
});

// GET /lists/:listId/todos
app.get("/lists/:listId/todos", (c) => {
  const list = lists.get(c.req.param("listId"));
  if (!list) return c.json({ error: "List not found" }, 404);

  return c.json(
    list.todos.map(({ id, content, status }) => ({ id, content, status })),
  );
});

// PATCH /lists/:listId/todos/:id
app.patch("/lists/:listId/todos/:id", async (c) => {
  const list = lists.get(c.req.param("listId"));
  if (!list) return c.json({ error: "List not found" }, 404);

  const todo = list.todos.find((t) => t.id === c.req.param("id"));
  if (!todo) return c.json({ error: "Todo not found" }, 404);

  const { status } = await c.req.json();
  if (status === "completed" || status === "pending") {
    todo.status = status;
  }
  return c.json({ id: todo.id, content: todo.content, status: todo.status });
});

Deno.serve({ port: 3000 }, app.fetch);
