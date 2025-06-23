//luma board explanation
const lines = document.querySelectorAll('.reveal-on-scroll');

  function revealLines() {
    lines.forEach(line => {
      const top = line.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        line.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealLines);
  window.addEventListener('load', revealLines);

// Update the date and time every second
function updateDateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  document.getElementById("dateTimeDisplay").textContent = `${dateStr} — ${timeStr}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Cursor glowing dots effect
const dotsHighlight = document.querySelector('.dots-highlight');
let hideTimeout;

window.addEventListener('mousemove', (e) => {
  dotsHighlight.style.setProperty('--x', `${e.clientX}px`);
  dotsHighlight.style.setProperty('--y', `${e.clientY}px`);
  dotsHighlight.style.opacity = '1';

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    dotsHighlight.style.opacity = '0';
  }, 500);
});

window.addEventListener('mouseout', () => {
  dotsHighlight.style.opacity = '0';
});

function createTaskElement(text, list) {
  const wrapper = document.createElement('div'); // outer wrapper
  wrapper.className = 'task-wrapper';

  const li = document.createElement('li');
  li.className = 'task-box';
  li.setAttribute('draggable', true);
  li.id = 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

  const taskContent = document.createElement('span');
  taskContent.className = 'task-text';
  taskContent.textContent = text;

  li.appendChild(taskContent);

  // Create buttons outside li
  const btnContainer = document.createElement('div');
  btnContainer.className = 'task-btn-container';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'edit-btn';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);

  // Add edit/delete logic
  editBtn.addEventListener('click', () => {
    if (editBtn.textContent === 'Edit') {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = taskContent.textContent;
      li.replaceChild(input, taskContent);
      editBtn.textContent = 'Save';
      input.focus();

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          taskContent.textContent = input.value.trim() || 'Untitled task';
          li.replaceChild(taskContent, input);
          editBtn.textContent = 'Edit';
          renumberTasks(list);
        }
      });
    } else {
      const input = li.querySelector('input');
      if (input) {
        const newValue = input.value.trim() || 'Untitled task';
        taskContent.textContent = newValue;
        li.replaceChild(taskContent, input);
        editBtn.textContent = 'Edit';
        renumberTasks(list);
      }
    }
  });

  deleteBtn.addEventListener('click', () => {
    wrapper.remove();
  });

  wrapper.appendChild(li);
  wrapper.appendChild(btnContainer);

  return wrapper;
}

// Renumber tasks ONLY in Done list with "1. ", "2. " prefixes
function renumberTasks(list) {
  if (list.classList.contains('done-list')) {
    const tasks = list.querySelectorAll('li');
    tasks.forEach((task, index) => {
      const textEl = task.querySelector('.task-text');
      const rawText = textEl.textContent.replace(/^\d+\.\s*/, '');
      textEl.textContent = `${index + 1}. ${rawText}`;
    });
  }
  // No renumber for Schedule or Time lists (keep numbers fixed)
}

function enableDragAndDrop() {
  const containers = document.querySelectorAll('.container .task-list ');

  containers.forEach(list => {
    list.addEventListener('dragover', e => {
      e.preventDefault(); // Allow drop
    });
    list.addEventListener('drop', e => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      const draggedTaskLi = document.getElementById(taskId);
      if (!draggedTaskLi) return;

      const draggedTextEl = draggedTaskLi.querySelector('.task-text');
      if (!draggedTextEl) return;

      const draggedTextFull = draggedTextEl.textContent.trim();
      const match = draggedTextFull.match(/^(\d+)\.\s*(.*)$/);
      let draggedNumber = null;
      let draggedText = draggedTextFull;
      if (match) {
        draggedNumber = match[1];
        draggedText = match[2];
      }

      if (list.classList.contains('done-list') && list.closest('.container')) {
        const doneList = list;
        const scheduleList = document.querySelectorAll('.container')[0].querySelector('.task-list');
        const timeList = document.querySelectorAll('.container')[1].querySelector('.task-list');

        [scheduleList, timeList].forEach(taskList => {
          [...taskList.children].forEach(taskWrapper => {
            const taskLi = taskWrapper.querySelector('li');
            if (!taskLi) return;
            const textEl = taskLi.querySelector('.task-text');
            if (!textEl) return;
            const textContent = textEl.textContent.trim();
            if (textContent.startsWith(draggedNumber + '.')) {
              taskWrapper.remove();
            }
          });
        });

        const isAlreadyInDone = [...doneList.children].some(taskWrapper => {
          const textEl = taskWrapper.querySelector('.task-text');
          if (!textEl) return false;
          const txt = textEl.textContent.replace(/^\d+\.\s*/, '').trim();
          return txt === draggedText;
        });

        if (!isAlreadyInDone) {
          const newTask = createTaskElement(draggedText, doneList);
          doneList.appendChild(newTask);
          renumberTasks(doneList);
          addTaskListeners(doneList.parentElement);
        }
      } else {
        // Move between Schedule/Time lists - move whole wrapper element
        const oldList = draggedTaskLi.parentElement.parentElement.querySelector('.task-list');
        const newList = list;

        if (oldList !== newList) {
          const taskWrapper = draggedTaskLi.parentElement;
          newList.appendChild(taskWrapper);
          // No renumbering in Schedule/Time lists - numbers stay fixed
        }
      }
    });
  });

  // Apply drag attributes to all current tasks
  document.querySelectorAll('.task-list li').forEach(task => {
    task.setAttribute('draggable', true);
    task.id = task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    task.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  });
}

// Add drag listeners to new tasks added dynamically
function addTaskListeners(container) {
  const list = container.querySelector('.task-list');
  list.querySelectorAll('li').forEach(task => {
    task.setAttribute('draggable', true);
    task.id = task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    task.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  });
}

// Setup add task buttons, input enter key, and initialization
// --- Fixed here: add support for .board container (for Time section)
// Handle only the top 3 containers (Schedule, Time, Done)
document.querySelectorAll('.box-row .container').forEach(container => {
  const input = container.querySelector('.task-input');
  const button = container.querySelector('.add-task-btn');
  const list = container.querySelector('.task-list');

  if (!input || !button || !list) return;

  button.addEventListener('click', () => {
    const taskText = input.value.trim();
    if (taskText === '') return;

    const tasksCount = list.querySelectorAll('li').length + 1;
    const taskElement = createTaskElement(`${tasksCount}. ${taskText}`, list);
    list.appendChild(taskElement);
    input.value = '';

    addTaskListeners(container);
  });

  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') button.click();
  });
});


// Initialize drag and drop on page load
enableDragAndDrop();
// Fix: Handle Time box in the board (bottom section) separately
const boardTimeInput = document.getElementById('board-time-input');
const boardTimeButton = document.getElementById('board-time-add');
const boardTimeList = document.getElementById('board-time-list');

if (boardTimeInput && boardTimeButton && boardTimeList) {
  boardTimeButton.addEventListener('click', () => {
    const text = boardTimeInput.value.trim();
    if (text === '') return;

    const count = boardTimeList.querySelectorAll('li').length + 1;
    const taskEl = createTaskElement(`${count}. ${text}`, boardTimeList);
    boardTimeList.appendChild(taskEl);
    boardTimeInput.value = '';

    addTaskListeners(boardTimeList.closest('.container'));
  });

  boardTimeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      boardTimeButton.click();
    }
  });
}
//adding elements automatically
function copyTaskToBottom(taskText, targetList) {
  const wrapper = document.createElement('div');
  wrapper.className = 'task-wrapper';

  const li = document.createElement('li');
  li.className = 'task-box';
  li.setAttribute('draggable', false); // No dragging below
  li.textContent = taskText;

  wrapper.appendChild(li);
  targetList.appendChild(wrapper);
}

// Observe new additions to Done and Schedule lists (upper)
const upperDoneList = document.querySelectorAll('.container')[2].querySelector('.task-list');
const upperScheduleList = document.querySelectorAll('.container')[0].querySelector('.task-list');

const lowerDoneList = document.querySelector('.done-list-bottom');
const lowerPendingList = document.querySelector('.pending-list-bottom');

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (!node.querySelector) return;
      const textEl = node.querySelector('.task-text');
      if (!textEl) return;

      const taskText = textEl.textContent.trim();

      if (mutation.target === upperDoneList) {
        // Avoid duplicates in lower Done
        const exists = [...lowerDoneList.querySelectorAll('li')].some(li =>
          li.textContent.trim() === taskText
        );
        if (!exists) copyTaskToBottom(taskText, lowerDoneList);

      } else if (mutation.target === upperScheduleList) {
        const exists = [...lowerPendingList.querySelectorAll('li')].some(li =>
          li.textContent.trim() === taskText
        );
        if (!exists) copyTaskToBottom(taskText, lowerPendingList);
      }
    });
  });
});

observer.observe(upperDoneList, { childList: true });
observer.observe(upperScheduleList, { childList: true });
//deleting when tasks are deleted
const topDoneList = upperDoneList;
const topScheduleList = upperScheduleList;

function removeFromBottomList(taskText, targetList) {
  const items = targetList.querySelectorAll('li');
  items.forEach(item => {
    if (item.textContent.trim() === taskText) {
      item.parentElement.remove(); // Remove wrapper div
    }
  });
}

const deleteObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.removedNodes.forEach(node => {
      if (!node.querySelector) return;
      const textEl = node.querySelector('.task-text');
      if (!textEl) return;

      const taskText = textEl.textContent.trim();

      if (mutation.target === topDoneList) {
        removeFromBottomList(taskText, lowerDoneList);
      } else if (mutation.target === topScheduleList) {
        removeFromBottomList(taskText, lowerPendingList);
      }
    });
  });
});

deleteObserver.observe(topDoneList, { childList: true });
deleteObserver.observe(topScheduleList, { childList: true });

// calender
// --- Calendar Update ---
function updateCalendar() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);

  const dayDivs = document.querySelectorAll('.calendar-day');
  dayDivs.forEach((div, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = date.getDate();
    div.innerHTML = `<span>${dayName}</span><span>${dayNum}</span>`;
    div.dataset.date = date.toISOString().split('T')[0];
    div.dataset.day = dayName;
  });
}

updateCalendar();
setInterval(updateCalendar, 3600 * 1000);

// --- Monitor Bottom Done List ---
const doneListBottom = document.querySelector('.done-list-bottom');

const bottomDoneObserver = new MutationObserver(mutations => {
  const todayDate = new Date().toISOString().split('T')[0];

  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      let li = node.querySelector ? node.querySelector('li') : null;
      if (!li && node.tagName === 'LI') li = node;
      if (!li) return;

      let title = li.textContent.trim();
      title = title.replace(/^\d+\.\s*/, '');
      if (!title) return;

      const token = localStorage.getItem('token');
      if (!token) return; // Skip if not logged in
      
      fetch('https://lumaboard.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, date: todayDate, completed: true })
      }).then(() => {
        markCalendarDaysWithTasks();
      }).catch(err => console.error('Error saving task:', err));
    });
  });
});
bottomDoneObserver.observe(doneListBottom, { childList: true });

// monitor the bottom pending list
const pendingListBottom = document.querySelector('.pending-list-bottom');

const pendingObserver = new MutationObserver(mutations => {
  const todayDate = new Date().toISOString().split('T')[0];
  const token = localStorage.getItem('token');
  if (!token) return;

  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      let li = node.querySelector ? node.querySelector('li') : null;
      if (!li && node.tagName === 'LI') li = node;
      if (!li) return;

      let title = li.textContent.trim();
      title = title.replace(/^\d+\.\s*/, '');
      if (!title) return;

      // Save the task as not completed
      fetch('https://lumaboard.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, date: todayDate, completed: false })
      }).catch(err => console.error('Error saving pending task:', err));
    });
  });
});

pendingObserver.observe(pendingListBottom, { childList: true });
// refreshing the pending tasks bug issue
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const todayDate = new Date().toISOString().split('T')[0];

    fetch(`https://lumaboard.onrender.com/api/tasks/${todayDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(tasks => {
        tasks.forEach(task => {
          if (!task.completed) {
            const li = document.createElement('li');
            li.textContent = task.title;
            li.dataset.taskId = task._id;

            const pendingList = document.querySelector('.pending-list-bottom');
            if (pendingList) {
              pendingList.appendChild(li);
            }
          }
        });
      })
      .catch(err => console.error('Error loading pending tasks:', err));
  }, 300);
});


// --- Mark Calendar Days With Tasks ---
function markCalendarDaysWithTasks() {
  const token = localStorage.getItem('token');
  if (!token) return;

  document.querySelectorAll('.calendar-day').forEach(dayDiv => {
    let indicator = dayDiv.querySelector('.task-indicator');
    if (indicator) indicator.remove();

    const date = dayDiv.dataset.date;

    fetch(`https://lumaboard.onrender.com/api/tasks/${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(tasks => {
  const hasDoneTasks = tasks.some(task => task.completed);

  if (hasDoneTasks) {
    indicator = document.createElement('span');
    indicator.className = 'task-indicator';
    indicator.textContent = '•';
    indicator.style.color = '#4caf50';
    indicator.style.marginLeft = '4px';
    dayDiv.appendChild(indicator);
  }
})

  });
}

// After updateCalendar and on interval
function updateCalendarAndIndicators() {
  updateCalendar();
  markCalendarDaysWithTasks();
}
updateCalendarAndIndicators();
setInterval(updateCalendarAndIndicators, 3600 * 1000);

// --- Popup Logic ---
const calendarDays = document.querySelectorAll('.calendar-day');
const popup = document.getElementById('calendar-popup');
const popupDayName = document.getElementById('popup-day-name');
const popupTaskList = document.getElementById('popup-task-list');
const closeBtn = document.querySelector('.close-btn');

let activeDay = null;

calendarDays.forEach(day => {
  day.addEventListener('click', () => {
    const selectedDate = day.dataset.date;
    const token = localStorage.getItem('token');
    if (!token) return;

    if (popup.classList.contains('show') && activeDay === selectedDate) {
      popup.classList.remove('show');
      activeDay = null;
      return;
    }

    activeDay = selectedDate;
    popupDayName.textContent = selectedDate;
    popupTaskList.innerHTML = 'Loading...';

    fetch(`https://lumaboard.onrender.com/api/tasks/${selectedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(tasks => {
        popupTaskList.innerHTML = '';
        if (!tasks.length) {
          popupTaskList.innerHTML = '<li>No tasks done</li>';
        } else {
          tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.title;
            popupTaskList.appendChild(li);
          });
        }
      })
      .catch(() => {
        popupTaskList.innerHTML = '<li>Error loading tasks</li>';
      });

    popup.classList.add('show');
  });
});

closeBtn.addEventListener('click', () => {
  popup.classList.remove('show');
  activeDay = null;
});


//animation for about luma section
function revealAboutLumaOnLoad() {
  const about = document.querySelector('.about-luma');
  if (!about) return;

  const lines = [
    ...about.querySelectorAll('h1'),
    ...about.querySelectorAll('.subtext')
  ];

  lines.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 1s ease, transform 1s ease';
  });

  let revealed = 0;

  setTimeout(() => {
    const revealNext = () => {
      if (revealed < lines.length) {
        lines[revealed].style.opacity = '1';
        lines[revealed].style.transform = 'translateY(0)';
        revealed++;
        setTimeout(revealNext, 400); // delay between each line
      }
    };
    revealNext();
  }, 600); // initial delay before first line shows
}

window.addEventListener('load', revealAboutLumaOnLoad);

// how it works animation
const boxes = document.querySelectorAll('.howitworks-box');
let lastScrollY = window.scrollY;

const seeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    const goingDown = window.scrollY > lastScrollY;
    const goingUp = window.scrollY < lastScrollY;

    if (entry.isIntersecting) {
      if (goingDown) {
        setTimeout(() => {
          entry.target.classList.add('show-how');
        }, index * 600); // 200ms delay between each box
      } else if (goingUp) {
        setTimeout(() => {
          entry.target.classList.remove('show-how');
        }, (boxes.length - index - 1) * 200); // reverse order on scroll up
      }
    }
  });

  lastScrollY = window.scrollY;
}, {
  threshold: 0.6
});

boxes.forEach(box => seeObserver.observe(box));