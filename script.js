let items =document.getElementsByClassName("item");
let completedbox=document.getElementById("completed-todos-box");
let pendingbox=document.getElementById("pending-todos-box");
let pendinglist=document.getElementById("pending-todos-list");
let completedlist=document.getElementById("completed-todos-list");

let id=5;


let todomemory=[{id:1,name:"my first todo",status:"pending" ,priority:"1"}, {id:2,name:"my second todo",status:"completed" ,priority:"2"}, {id:3,name:"my third todo",status:"pending" ,priority:"1"}, {id:4,name:"my fourth todo",status:"completed" ,priority:"2"}];


function addDragtoItem(item) {
    item.setAttribute("draggable", "true");
    item.addEventListener("dragstart", function (e) {
        let selectedItem = e.target;
        completedlist.addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        completedlist.addEventListener("drop", function (e) {
            completedlist.appendChild(selectedItem);
            selectedItem.querySelector(".todo-checkbox").checked = true;
            id = parseInt(selectedItem.id);
            todomemory = todomemory.map(todo => {
                if (todo.id === id) {
                    todo.status = "completed";
                }
                return todo;
            });
            selectedItem = null;
        });
        pendinglist.addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        pendinglist.addEventListener("drop", function (e) {
            pendinglist.appendChild(selectedItem);
            selectedItem.querySelector(".todo-checkbox").checked = false;
            id = parseInt(selectedItem.id);
            todomemory = todomemory.map(todo => {
                if (todo.id === id) {
                    todo.status = "pending";
                }
                return todo;
            });
            selectedItem = null;
            
        });
    });
}
  
function addToHtml(item,pendingbox, completedbox) {
    let li = document.createElement("li");
    li.className = "item";
    li.id = item.id;
    li.innerHTML = `<input type="checkbox" class="todo-checkbox">
                      <p class="todo-text">${item.name}</p>
                      <button class="delete-btn btn btn-danger"><i class="bi bi-trash"></i></button>`;
    let deletebtn = li.querySelector(".delete-btn");
    deletebtn.addEventListener("click", function () {
        li.remove();
        todomemory = todomemory.filter(todo => todo.id !== item.id);
    });
    let checkbox = li.querySelector(".todo-checkbox");
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            completedbox.appendChild(li);
            item.status = "completed";
            todomemory = todomemory.map(todo => {
                if (todo.id === item.id) {
                    todo.status = "completed";
                }
                return todo;
            });

        } else {
            pendingbox.appendChild(li);
            item.status = "pending";
            todomemory = todomemory.map(todo => {
                if (todo.id === item.id) {
                    todo.status = "pending";
                }
                return todo;
            });
        }
    });
    addDragtoItem(li);
    if (item.status === "completed") {
        completedbox.appendChild(li);
        checkbox.checked = true;
    } else {
        pendingbox.appendChild(li);
    }
    
}


for(item of todomemory){
   addToHtml(item,pendinglist, completedlist);
}




const searchInput = document.getElementById("search-input");
searchInput.addEventListener("keyup", function () {
  searchTodos(searchInput.value.toLowerCase());
});
function searchTodos(filter) {
  const completeditemList = document.getElementById("completed-todos-list");
  const completeditemss = completeditemList.getElementsByTagName("li");
  const pendingitemList = document.getElementById("pending-todos-list");
  const pendingitemss = pendingitemList.getElementsByTagName("li");
  for (let i = 0; i < completeditemss.length; i++) {
    const itemText = completeditemss[i].textContent.toLowerCase();
    if (itemText.includes(filter)) {
      completeditemss[i].style.display = "flex";
    } else {
      completeditemss[i].style.display = "none";
    }
  }
  for (let i = 0; i < pendingitemss.length; i++) {
    const itemText = pendingitemss[i].textContent.toLowerCase();
    if (itemText.includes(filter)) {
      pendingitemss[i].style.display = "flex";
    } else {
      pendingitemss[i].style.display = "none";
    }
  }
}
function hideForm() {
  const addTodoCheckbox = document.getElementById("add-todo-checkbox");
  const addForm = document.querySelector(".add-form");
  addTodoCheckbox.checked = false;
}




 const addtodo=(event)=>{
  event.preventDefault();
  const todoItem={};
  todoItem.id = id++;
  todoItem.name=document.getElementById("todo-input").value;
  todoItem.status="pending";
  todoItem.priority=document.getElementById("priority-select").value;
  todomemory.push(todoItem);
  addToHtml(todoItem, pendinglist, completedlist);
  return false;
}


// cars.sort(function(a, b){return a.year - b.year});
const sorted = todomemory.toSorted(function(a, b){return a.priority - b.priority});
console.log(sorted);
function sortTodos(statusbox) {
  if (statusbox === "pending") {
    pendinglist.innerHTML = "";
    itemstatus = "pending"; 
  }
  else if (statusbox === "completed") {
    completedlist.innerHTML = "";
    itemstatus = "completed"; 
  } 
  
  let todos = Array.from(todomemory).filter(item => item.status === itemstatus) ;
  
  todos.sort((a, b) => a.priority - b.priority);
  
  
  todos.forEach(item => addToHtml(item, pendinglist, completedlist));
}