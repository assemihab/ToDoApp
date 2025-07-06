let item = null;
let items = document.getElementsByClassName("item");
let completedbox = document.getElementById("completed-todos-box");
let pendingbox = document.getElementById("pending-todos-box");
let pendinglist = document.getElementById("pending-todos-list");
let completedlist = document.getElementById("completed-todos-list");
let id = 0;

let url = "http://localhost:3000/todos";
async function fetchTodos() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);

    let todomemory = data.documents.map((doc) => {
      return {
        id: doc.name.split("/").pop(),
        name: doc.fields.name.stringValue,
        status: doc.fields.status.stringValue,
        priority: parseInt(doc.fields.priority.integerValue),
      };
    });
    id = todomemory.length + 1;
    console.log(todomemory);
    return todomemory;
  } catch (error) {
    window.alert("Error fetching todos. Please try again later.");
    console.error("Error fetching todos:", error);
  }
}
async function addTodoToServer(todoItem) {
  try {
    console.log(todoItem);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todoItem,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Todo added successfully:", data);
  } catch (error) {
    window.alert(
      "Error adding todo. Please try again later when the server opens."
    );
    console.error("Error adding todo:", error);
    throw error;
  }
}
async function deleteFromServer(documentID) {
  try {
    const response = await fetch(`${url}/${documentID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Todo deleted successfully:", data);
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}
async function updateTodoStatus(documentID, newStatus) {
  try {
    if (typeof documentID === "integer") {
      documentID = documentID.toString();
    }
    const response = await fetch(`${url}/${documentID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Todo updated successfully:", data);
  } catch (error) {
    console.error("Error updating todo:", error);
  }
}

let todomemory = fetchTodos();
todomemory.then((todos) => {
  todos.forEach((item) => {
    addToHtml(item, pendinglist, completedlist);
  });
});

// let todomemory = [
//   { id: 1, name: "my first todo", status: "pending", priority: "1" },
//   { id: 2, name: "my second todo", status: "completed", priority: "2" },
//   { id: 3, name: "my third todo", status: "pending", priority: "1" },
//   { id: 4, name: "my fourth todo", status: "completed", priority: "2" },
// ];

function addDragtoItem(item) {
  item.setAttribute("draggable", "true");
  item.addEventListener("dragstart", function (e) {
    let selectedItem = e.target;
    completedlist.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    completedlist.addEventListener("drop", function (e) {
      console.log(selectedItem);
      console.log(typeof selectedItem);
      completedlist.appendChild(selectedItem);
      selectedItem.querySelector(".todo-checkbox").checked = true;
      // id = parseInt(selectedItem.id);
      id = selectedItem.id;
      updateTodoStatus(id, "completed");
      selectedItem = null;
    });
    pendinglist.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    pendinglist.addEventListener("drop", function (e) {
      console.log(selectedItem);
      console.log(typeof selectedItem);
      pendinglist.appendChild(selectedItem);
      selectedItem.querySelector(".todo-checkbox").checked = false;
      // id = parseInt(selectedItem.id);
      id = selectedItem.id;
      updateTodoStatus(id, "pending");
      selectedItem = null;
    });
  });
}

function addToHtml(item, pendingbox, completedbox) {
  let li = document.createElement("li");
  li.className = "item";
  li.id = item.id;
  li.innerHTML = `<input type="checkbox" class="todo-checkbox">
                      <p class="todo-text">${item.name}</p>
                      <button class="delete-btn btn btn-danger"><i class="bi bi-trash"></i></button>`;
  let deletebtn = li.querySelector(".delete-btn");
  deletebtn.addEventListener("click", async () => {
    await deleteFromServer(item.id);
    li.remove();
  });
  let checkbox = li.querySelector(".todo-checkbox");
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      completedbox.appendChild(li);
      item.status = "completed";
      updateTodoStatus(item.id, "completed");
    } else {
      pendingbox.appendChild(li);
      item.status = "pending";
      updateTodoStatus(item.id, "pending");
    }
  });
  addDragtoItem(li);
  if (item.status === "completed") {
    completedbox.appendChild(li);
    checkbox.checked = true;
  } else {
    pendingbox.appendChild(li);
  }
  return li;
}

// for (item of todomemory) {
//   addToHtml(item, pendinglist, completedlist);
// }

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

const addtodo = async (event) => {
  event.preventDefault();
  const todoItem = {};
  todoItem.id = id++;
  todoItem.name = document.getElementById("todo-input").value;
  todoItem.status = "pending";
  todoItem.priority = document.getElementById("priority-select").value;
  let li = addToHtml(todoItem, pendinglist, completedlist);
  addTodoToServer(todoItem)
    .then(() => {
      console.log("object added succesfully");
    })
    .catch((error) => {
      console.error("Error adding todo:", error);
      window.alert("Error adding todo2");
      li.remove();
    });

  // return false;
};

// cars.sort(function(a, b){return a.year - b.year});

async function sortTodos(statusbox) {
  let todomemory = await fetchTodos();
  if (statusbox === "pending") {
    pendinglist.innerHTML = "";
    itemstatus = "pending";
  } else if (statusbox === "completed") {
    completedlist.innerHTML = "";
    itemstatus = "completed";
  }
  try {
    let todos = Array.from(todomemory).filter(
      (item) => item.status === itemstatus
    );
  } catch (error) {
    console.error("Error filtering todos:", error);
    window.alert("list is empty ");

    return;
  }
  todos.sort((a, b) => a.priority - b.priority);

  todos.forEach((item) => addToHtml(item, pendinglist, completedlist));
}
