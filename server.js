//  things yuu need to do
// 1. error handling
// 2.rxjs
// 3. refactor the code
var admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
var serviceAccount = require("./keys/permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
//batchGET apicall
// list documents
// GET https://firestore.googleapis.com/v1beta1/{parent=projects/*/databases/*/documents/*/**}/{collectionId}
// get batch of documents
// POST https://firestore.googleapis.com/v1beta1/{database=projects/*/databases/*}/documents:batchGet
// delete single document
// https://firebase.google.com/docs/firestore/reference/rest/v1beta1/projects.databases.documents/delete
//create single document
// POST https://firestore.googleapis.com/v1beta1/{parent=projects/*/databases/*/documents/**}/{collectionId}
// update single document
// PATCH https://firestore.googleapis.com/v1beta1/{document.name=projects/*/databases/*/documents/*/**}

const app = express();
app.use(cors());
app.use(express.json());

async function getAccessToken() {
  const accessToken = await admin.credential
    .cert(serviceAccount)
    .getAccessToken();
  return accessToken.access_token;
}

const fetch = require("node-fetch");

let object = { id: 1, name: "high", status: "pending", priority: 1 };
let object2 = { id: 1, name: "low", status: "completed", priority: 1 };

function toFirestoreFields(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = { stringValue: value };
    } else if (typeof value === "number") {
      result[key] = { integerValue: value.toString() };
    } else if (typeof value === "boolean") {
      result[key] = { booleanValue: value };
    } else {
      result[key] = { nullValue: null };
    }
    if (key == "priority") {
      result[key] = { integerValue: parseInt(value) }; // Ensure priority is stored as integerValue
    }
  }
  return result;
}

async function addObject(obj) {
  const token = await getAccessToken();
  const documentID = obj.id;
  delete obj.id;
  const url = `https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents/todos?documentId=${documentID}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: toFirestoreFields(obj),
      }),
    });
    const data = await response.json();
    console.log("Firestore REST API response:", data);
    if (!response.ok) {
      throw new Error(`Error adding object: ${data.error.message}`);
    }
  } catch (error) {
    console.error("Error adding object:", error);
  }
}

async function getMultipleObjects() {
  const token = await getAccessToken();

  const url = `https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents:batchGet`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log("Firestore REST API response:", data);
  return data;
}
async function getAllObjects() {
  const token = await getAccessToken();
  // GET https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents/todos
  const url = `https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents/todos`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Firestore REST API response:", data);
    if (!response.ok) {
      throw new Error(`Error fetching objects: ${data.error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error fetching all objects:", error);
    throw error; // Re-throw the error for further handling
  }
}

async function printAllObjects() {
  const data = await getAllObjects();
  if (data.documents) {
    data.documents.forEach((doc) => {
      console.log(doc.fields);
    });
  } else {
    console.log("No documents found.");
  }
}

async function deleteObject(documentID) {
  const token = await getAccessToken();
  const url = `https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents/todos/${documentID}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Firestore REST API response:", data);
    //note for assem: if the object does not exist, the response will still be ok, but the data will be empty
    if (!response.ok) {
      throw new Error(`Error deleting object: ${data.error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error deleting object:", error);
    throw error;
  }
}
async function updateObject(objectID, newStatus) {
  const token = await getAccessToken();
  const url = `https://firestore.googleapis.com/v1beta1/projects/todo-ab144/databases/(default)/documents/todos/${objectID}?updateMask.fieldPaths=status`;
  //note for assem if the object does not exist, the response will still be ok and the data will inserted
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          status: { stringValue: newStatus },
        },
      }),
    });
    const data = await response.json();
    console.log("Firestore REST API response:", data);
    if (!response.ok) {
      throw new Error(`Error updating object: ${data.error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error updating object:", error);
    throw error; // Re-throw the error for further handling
  }
}

app.get("/todos", async (req, res) => {
  try {
    const data = await getAllObjects();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});
app.post("/todos", async (req, res) => {
  try {
    const obj = req.body;
    // console.log("Received object:", obj.todoItem);
    // console.log("received object type:", typeof obj.todoItem);
    // console.log("received object keys:", Object.keys(obj.todoItem));
    await addObject(obj.todoItem);
    res.status(201).json({ message: "Todo added successfully" });
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ error: "Failed to add todo" });
  }
});
app.delete("/todos/:id", async (req, res) => {
  try {
    const documentID = req.params.id;
    await deleteObject(documentID);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});
app.patch("/todos/:id", async (req, res) => {
  try {
    const objectID = req.params.id;
    const newStatus = req.body.status;
    await updateObject(objectID, newStatus);
    res.status(200).json({ message: "Todo updated successfully" });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Example usage
// addObject(object);
// updateObject("1", "completed");
// getMultipleObjects();
// getAllObjects();
// deleteObject("20");
