const listResponse = await jsonr("./create-list.http", {
  status: 201,
});

const listId = listResponse.body.id;

await jsonr("./create-todos.http", {
  inputVariables: { listId },
  status: 204,
});
