# API Endpoints

All endpoints require the `Authorization: ApiKey ****` header. Requests without
a valid key receive `401 Unauthorized`.

## POST /lists

Create a new list.

**Request body:**

```json
{ "name": "Shopping" }
```

**Response:** `201 Created`

```json
{ "id": "1" }
```

## POST /lists/{listId}/todos

Add todos to a list.

**Request body:**

```json
[
  { "content": "Buy milk" },
  { "content": "Buy eggs" }
]
```

**Response:** `204 No Content`

## GET /lists/{listId}/todos

Get all todos for a list.

**Response:** `200 OK`

```json
[
  { "id": "1", "content": "Buy milk", "status": "pending" },
  { "id": "2", "content": "Buy eggs", "status": "completed" }
]
```

## PATCH /lists/{listId}/todos/{id}

Update a todo's status.

**Request body:**

```json
{ "status": "completed" }
```

**Response:** `200 OK`

```json
{ "id": "1", "content": "Buy milk", "status": "completed" }
```
