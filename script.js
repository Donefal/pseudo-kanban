const Status = {
    Todo: "todo",
    WorkingOn: "workingOn",
    Done: "done"
};

// Array untuk penyimpanan tasks
let tasks = [];

// Reference ke element di DOM
const addButton = document.getElementById("addButton");
const input = document.getElementById("inputNewTask");
const deleteDoneButton = document.getElementById("done-delete");
const deleteAllButton = document.getElementById("all-task-delete");

// -------------------------------------------------------------------------------- 
// Persistance
// -------------------------------------------------------------------------------- 

// Load task dari local storage browser
function loadTasks() {
    const saved = localStorage.getItem("tasks");
    tasks = saved ? JSON.parse(saved) : [];
}

// Save task ke local storage browser
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render <task-card> untuk setiap kategori status
function render() {
    const todoCol = document.getElementById("todo-list");
    const workingOnCol = document.getElementById("working-on-list");
    const doneCol = document.getElementById("done-list");
    
    todoCol.innerHTML = "";
    workingOnCol.innerHTML = "";
    doneCol.innerHTML = "";

    tasks.forEach(task =>{
        const el = document.createElement("task-card");
        el.setAttribute("task-id", task.id);
        el.setAttribute("task-text", task.text);
        el.setAttribute("task-status", task.status);

        if(task.status === Status.Todo) todoCol.appendChild(el);
        else if(task.status === Status.WorkingOn) workingOnCol.appendChild(el);
        else if(task.status === Status.Done) doneCol.appendChild(el);
        else console.log("Invalid Append Action");
    });
}

// -------------------------------------------------------------------------------- 
// Operasi Task
// -------------------------------------------------------------------------------- 

function addTask(taskText) {
    if (!taskText.trim()) return;

    tasks.push(
        {
            id: Date.now(),
            text: taskText,
            status: Status.Todo
        }
    )

    saveTasks();
    render();
}

function moveLeft(taskID) {
    console.log("Move Left: ", taskID);
    const task = tasks.find(t => t.id === taskID);

    if(!task) {
        console.log("ERROR Move Left");
        return;
    }

    if(task.status === Status.WorkingOn) task.status = Status.Todo;
    else if (task.status === Status.Done) task.status = Status.WorkingOn;
    else console.log("Invalid action");
    
    saveTasks();
    render();
}

function moveRight(taskID) {
    console.log("Move Right: ", taskID);
    const task = tasks.find(t => t.id === taskID);

    if(!task) {
        console.log("ERROR Move Right");
        return;
    }


    if(task.status === Status.Todo) task.status = Status.WorkingOn;
    else if (task.status === Status.WorkingOn) task.status = Status.Done;
    else console.log("Invalid action");

    saveTasks();
    render();
}

function deleteTask(taskID) {
    tasks = tasks.filter(t => t.id !== Number(taskID));
    console.log("Delete Task: ", taskID);

    saveTasks();
    render();
}

function editTask(taskID, newValue) {
    console.log("Edit Task: ", taskID);
    const task = tasks.find(t => t.id === taskID);

    if(!task) {
        console.log("ERROR Edit Task");
        return;
    }

    task.text = newValue;

    saveTasks();
    render()
}

function deleteDone() {
    tasks = tasks.filter(t => t.status !== Status.Done);
    console.log("Delete DONE");

    saveTasks();
    render();
}

function deleteAllTask() {
    tasks = [];
    console.log("Delete ALL TASK");

    saveTasks();
    render();
}

// -------------------------------------------------------------------------------- 
// Custom Reusable Tag
// -------------------------------------------------------------------------------- 

/*
    Custom Task Card
    Attribute:
        - task-name: untuk nama tugas (ENUM Status: Todo, WorkingOn, Done)
        - task-id: untuk keperluan managemen data (dalam bentuk date.now)
*/
class TaskCard extends HTMLElement {
    connectedCallback(){
        const taskText = this.getAttribute("task-text");
        const taskID = Number(this.getAttribute("task-id")); // Dalam bentuk Date
        const taskStatus = this.getAttribute("task-status");

        // Menentukan warna aksen dari task card berdasarkan status
        let taskColor;
        if (taskStatus === Status.Todo) taskColor = "danger";
        else if (taskStatus === Status.WorkingOn) taskColor = "primary";
        else if (taskStatus === Status.Done) taskColor = "success";
        else {
            taskColor = "secondary";
            console.log("Invalid Status On creating Task Card");
        }

        this.innerHTML = `
        <div class="task card m-3">
            <div class="card-body">
                <div class="task-top d-flex justify-content-between mb-1">
                    <p class="fs-5" data-bs-toggle="modal" data-bs-target="#${taskID}-modal" data-bs-curr="${taskText}"> ${taskText} </p>
                    <button type="button" class="btn-close pe-1" aria-label="Close"></button>
                </div>

                <div class="task-bottom d-flex justify-content-end">
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-${taskColor} left-button">←</button>
                        <button type="button" class="btn btn-${taskColor} right-button">→</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="${taskID}-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5">Edit Task</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                        <div class="mb-3">
                            <textarea class="form-control input-edit"></textarea>
                        </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary save-task" data-bs-dismiss="modal">Save Task</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Click event listener untuk setiap button
        this.querySelector(".left-button").addEventListener("click", () => {
            moveLeft(taskID);
        });

        this.querySelector(".right-button").addEventListener("click", () => {
            moveRight(taskID);
        });

        this.querySelector(".btn-close").addEventListener("click", () => {
            deleteTask(taskID);
        });

        const taskModal = this.querySelector(".modal");
        taskModal.addEventListener("show.bs.modal", (event) => {
            const taskText = event.relatedTarget;
            const currentValue = taskText.getAttribute("data-bs-curr");

            const modalBodyInput = taskModal.querySelector(".input-edit")
            modalBodyInput.value = currentValue
        });

        const inputEdit = this.querySelector(".input-edit");
        this.querySelector(".save-task").addEventListener("click", () => {
            editTask(taskID, inputEdit.value);
        });
    }
}
customElements.define("task-card", TaskCard);

// -------------------------------------------------------------------------------- 
// Main Function
// -------------------------------------------------------------------------------- 

// Event listener untuk tombol add task
addButton.addEventListener("click", () => {
    addTask(input.value);
    console.log(input.value);
    input.value = "";
});

// Event listener untuk kolom input, bisa tekan enter untuk submit
input.addEventListener("keydown", (event) => {
    if(event === "Enter"){
        addTask(input.value);
        console.log(input.value);
        input.value = "";
    }
});

deleteDoneButton.addEventListener("click", () => {
    deleteDone();
});

deleteAllButton.addEventListener("click", () => {
    deleteAllTask();
});

loadTasks();
render();