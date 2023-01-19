const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1: GET TODOS BY STATUS
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getTodoByStatus = `
            SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status LIKE "%${status}%" AND priority LIKE "%${priority}%"
            ORDER BY id;`;
  const dbResponse = await db.all(getTodoByStatus);
  response.send(dbResponse);
});

// API 2: GET TODOS BY TODO ID
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const getTodoByTodoId = `
              SELECT * FROM todo WHERE id = ${todoId}
              ;`;
  const dbResponse = await db.get(getTodoByTodoId);
  response.send(dbResponse);
});

//API 3: CREATE TODOS
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
        INSERT INTO todo (id,todo,priority,status)
        VALUES ( ${id},"${todo}","${priority}","${status}" );`;
  const dbResponse = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//APi 4: UPDATE TODO BY ID
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoByTodoId = `
            SELECT * FROM todo WHERE id = ${todoId}
            ;`;
  const previousTodo = await db.get(getTodoByTodoId);
  const {
    priority = previousTodo.priority,
    status = previousTodo.status,
    todo = previousTodo.todo,
  } = request.body;
  const updateTodoQuery = `
        UPDATE todo 
        SET 
            todo = '${todo}',
            status = '${status}',
            priority = '${priority}'
            
        WHERE id = ${todoId};`;
  const dbResponse = await db.run(updateTodoQuery);
  if (request.body.status !== undefined) {
    response.send("Status Updated");
  } else if (request.body.todo !== undefined) {
    response.send("Todo Updated");
  } else if (request.body.priority !== undefined) {
    response.send("Priority Updated");
  }
});

//API 5: DELETE TODO BY ID
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
            DELETE FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
