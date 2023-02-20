const toggleBtn = document.querySelector(".toggle-mode-icons");
const toggleDarkMode = document.querySelector(".dark-mode-icon");
const toggleLightMode = document.querySelector(".light-mode-icon");
const html = document.documentElement;
const toDoInputEl = document.querySelector("input[type='text']");
const listEl = document.querySelector("ul");
const itemsleftEl = document.querySelector(".items-left");
const checkBtn = "check-btn";
const unCheckBtn = "uncheck-btn";
const toDoCompleted = "completed";
const clearCompletedEl = document.querySelector(".clear-completed");
const filterCompletedBtn = document.querySelector(".items-filter-completed");
const filterActiveBtn = document.querySelector(".items-filter-active");
const filterAllBtn = document.querySelector(".items-filter-all");
const allfilterBtns = document.querySelector(".items-filter").children;

//dark-light mode
toggleBtn.addEventListener("click", function () {
  toggleDarkMode.classList.toggle("active");
  toggleLightMode.classList.toggle("active");

  if (html.dataset.mode === "light-mode") {
    html.dataset.mode = "dark-mode";
  } else {
    html.dataset.mode = "light-mode";
  }
});

//check input value
toDoInputEl.addEventListener("keyup", function () {
  toDoInputEl.value = toDoInputEl.value.replace(/[^A-zÀ-ÿ0-9\s]/g, "");
});

//local storare

let storegedList, id;
let storegedData = localStorage.getItem("todo-array");

if (storegedData) {
  storegedList = JSON.parse(storegedData);
  id = storegedList.length;
  showStoredData(storegedList);
} else {
  storegedList = [];
  id = 0;
}

itemsLeftCount();

function showStoredData(array) {
  array.forEach((item) => {
    addItem(item.name, item.id, item.done, item.trash);
  });
}

//add item function
function addItem(toDo, id, done, trash) {
  if (trash) return;

  const toDoDone = done ? checkBtn : unCheckBtn;
  const toDoCheck = done ? toDoCompleted : "";
  const item = `<li class="${toDoCheck}" status="li" draggable="true"><i id="${id}" class="fa-solid fa-check btn ${toDoDone}" status="checkbox"></i><p>${toDo}</p><i id="${id}" class="fa-solid fa-xmark fa-lg delete-icon" status="delete"></i></li>`;

  listEl.insertAdjacentHTML("beforeend", item);
}

// create il when enter is pressed
document.addEventListener("keyup", (e) => {
  const toDo = toDoInputEl.value;
  if (e.key === "Enter" && toDo) {
    addItem(toDo, id, false, false);
    storegedList.push({
      name: toDo,
      id: id,
      done: false,
      trash: false,
    });

    localStorage.setItem("todo-array", JSON.stringify(storegedList));
    id++;

    toDoInputEl.value = "";
    itemsLeftCount();
  }
});

//clicks inside ul
listEl.addEventListener("click", (e) => {
  if (e.target.tagName === "p" || e.target.tagName === "ul") {
    return;
  }

  const toDoItem = e.target;
  const toDoItemParent = toDoItem.parentNode;
  const toDoItemStatus = toDoItem.attributes.status.value;

  if (toDoItemStatus === "checkbox") {
    toDoItem.classList.toggle(checkBtn);
    toDoItem.classList.toggle(unCheckBtn);
    toDoItemParent.classList.toggle(toDoCompleted);
    storegedList[toDoItem.id].done = storegedList[toDoItem.id].done
      ? false
      : true;
  } else if (toDoItemStatus === "delete") {
    toDoItemParent.remove();
    storegedList[toDoItem.id].trash = true;
    itemsleftEl.textContent = `${storegedList.length} items left`;
  }

  localStorage.setItem("todo-array", JSON.stringify(storegedList));
  itemsLeftCount();
});

//filters

filterActiveBtn.addEventListener("click", function () {
  const filterActive = storegedList.filter(function (item) {
    return item.done === false && item.trash === false;
  });
  filterRemove();
  filterActiveBtn.classList.add("filter-selected");
  showStoredData(filterActive);
});

filterCompletedBtn.addEventListener("click", function () {
  const filterCompleted = storegedList.filter(function (item) {
    return item.done === true && item.trash === false;
  });
  filterRemove();
  filterCompletedBtn.classList.add("filter-selected");
  showStoredData(filterCompleted);
});

filterAllBtn.addEventListener("click", function () {
  filterRemove();
  filterAllBtn.classList.add("filter-selected");
  showStoredData(storegedList);
});

function filterRemove() {
  for (let i = 0; i < allfilterBtns.length; i++) {
    allfilterBtns[i].classList.remove("filter-selected");
  }
  //remove all children
  while (listEl.firstChild) {
    listEl.removeChild(listEl.firstChild);
  }
}

//clear completed
clearCompletedEl.addEventListener("click", function () {
  for (let i = 0; i < storegedList.length; i++) {
    if (storegedList[i].done === true) {
      storegedList[i].trash = true;
    }
  }
  localStorage.setItem("todo-array", JSON.stringify(storegedList));
  location.reload();
});

//items left function
function itemsLeftCount() {
  let count = 0;
  for (let i = 0; i < storegedList.length; i++) {
    if (storegedList[i].done === false && storegedList[i].trash === false) {
      count++;
    }
  }
  itemsleftEl.textContent = `${count} items left`;
}

//drag and drop
listEl.addEventListener("mouseover", function () {
  const lis = document.querySelectorAll("li");

  lis.forEach((li) => {
    li.addEventListener("dragstart", () => {
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });
  });

  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getNextElement(e.clientY);
    const draggingEl = document.querySelector(".dragging");
    if (afterElement == null) {
      listEl.appendChild(draggingEl);
    } else {
      listEl.insertBefore(draggingEl, afterElement);
    }
  });

  function getNextElement(y) {
    const draggableElements = [
      ...document.querySelectorAll("li:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; // ditance between the box center and mouse
        if (offset < 00 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
});
