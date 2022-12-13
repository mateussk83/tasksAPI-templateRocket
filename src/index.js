const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];


function modifyDescription(todos = [], id, title, deadline) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos[i].title = title
   todos[i].deadline = deadline
   return todos[i].id
  }
 }

return 123
}
function modifyState(todos = [], id) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos[i].type = "finished"
   return todos[i].id
  }
 }
 return 123
}
function deleteTodo(todos = [], id) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos.splice(todos[i], 1);
   return id
  }
 }
 return 123
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username);

  if(!user) {
   return response.status(400).json({error: "User not found!"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error:"UserName Already Exists!"})
  }


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
}
users.push(user);
return response.status(201).json(user);
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
 const { user } = request;

 return response.json(user.todos)
})

app.post("/todos", checksExistsUserAccount, (request, response) => {
 const { user } = request;

 const { title, deadline } = request.body;
 
 const todoOperation = {
  title,
  deadline,
  id: uuidv4(),
  created_at: new Date(),
  type: "In progress"
 }

  user.todos.push(todoOperation)

  return response.status(201).send();
})

app.put("/todos/:id", checksExistsUserAccount, (request, response) => { // falta essa parte
 const { user } = request;
 const { id } = request.params;
 const { title, deadline } = request.body;
 const idTodo = modifyDescription(user.todos,id,title,deadline)
 if(id != idTodo) {
  return response.status(400).json({error:"id not found!"}); 
 }
 return response.status(201).send();
})

app.put("/todos/:id/done",checksExistsUserAccount, (request, response) => {
 const { user } = request;
 const { id } = request.params;

 const idTodo = modifyState(user.todos, id)
 if(id != idTodo) {
  return response.status(400).json({error:"id not found!"}); 
 }
 return response.status(201).send();

} )

app.delete("/todos/:id",checksExistsUserAccount, (request, response) => {
 const { user } = request;
 const { id } = request.params;

 const todoId = deleteTodo(user.todos, id)
 if(todoId != id) {
  return response.status(400).json({error:"id not found!"}); 
 }

 return response.status(200).json(user.todos) 
})

app.listen(3333); 