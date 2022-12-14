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
function checkExistsTodo(user, idTodo) {
  return user.todos.find(todo => todo.id === idTodo);
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

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists! Try another username'})
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

 return response.json(user.todos).status(200)
})

app.post("/todos", checksExistsUserAccount, (request, response) => {
 const { user } = request;

 const { title, deadline } = request.body;
 
 const todoOperation = {
  title,
  deadline,
  id: uuidv4(),
  created_at: new Date(),
  done: false
 }

  user.todos.push(todoOperation)

  return response.status(201).send();
})

app.put("/todos/:id", checksExistsUserAccount, (request, response) => { // falta essa parte
 const { user } = request;
 const { id } = request.params;
 const { title, deadline } = request.body;

 const todo = checkExistsTodo(user, id);

 if (!todo) {
   return response.status(404).json({ error: 'TODO not found'});
 }

 todo.title = title;
 todo.deadline = new Date(deadline);

 return response.status(201).send();
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = checkExistsTodo(user, id);

  if (!todo) {
    return response.status(404).json({ error: 'TODO not found'});
  }

  todo.done = true;
  
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'TODO not found'});
  }

  user.todos.splice(todoIndex, 1);
  
  return response.status(204).json();
});

module.exports = app;

app.listen(3333); 