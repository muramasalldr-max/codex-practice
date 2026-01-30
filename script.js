const timelineGrid = document.getElementById("timelineGrid");
const datePicker = document.getElementById("datePicker");
const timeSelect = document.getElementById("timeSelect");
const taskInput = document.getElementById("taskInput");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");

let activeSlot = null;

const startHour = 9;
const totalSlots = 26;

const formatTime = (date) =>
  date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getStorageKey = (dateValue) => `schedule-${dateValue}`;

const loadSchedule = (dateValue) => {
  const raw = localStorage.getItem(getStorageKey(dateValue));
  return raw ? JSON.parse(raw) : {};
};

const saveSchedule = (dateValue, schedule) => {
  localStorage.setItem(getStorageKey(dateValue), JSON.stringify(schedule));
};

const renderTimeline = (dateValue) => {
  timelineGrid.innerHTML = "";
  const schedule = loadSchedule(dateValue);
  const baseDate = new Date(`${dateValue}T00:00:00`);

  for (let i = 0; i < totalSlots; i += 1) {
    const slotTime = new Date(
      baseDate.getTime() + (startHour * 60 + i * 30) * 60 * 1000
    );
    const label = formatTime(slotTime);
    const task = schedule[label] ?? "";

    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "timeline__slot";
    slot.dataset.time = label;
    slot.setAttribute("role", "row");

    const time = document.createElement("span");
    time.className = "timeline__time";
    time.textContent = label;

    const taskSpan = document.createElement("span");
    taskSpan.className = "timeline__task";
    taskSpan.textContent = task || "タップしてタスクを入力";
    if (task) {
      taskSpan.classList.add("timeline__task--filled");
    }

    slot.append(time, taskSpan);
    slot.addEventListener("click", () => setActiveSlot(slot, task));

    timelineGrid.appendChild(slot);
  }

  if (activeSlot) {
    const nextActive = timelineGrid.querySelector(
      `[data-time="${activeSlot.dataset.time}"]`
    );
    if (nextActive) {
      setActiveSlot(nextActive, schedule[activeSlot.dataset.time] ?? "");
    }
  }
};

const setActiveSlot = (slot, task) => {
  timelineGrid
    .querySelectorAll(".timeline__slot--active")
    .forEach((node) => node.classList.remove("timeline__slot--active"));

  activeSlot = slot;
  slot.classList.add("timeline__slot--active");
  timeSelect.value = slot.dataset.time;
  taskInput.value = task;
  taskInput.focus();
};

const buildTimeOptions = () => {
  timeSelect.innerHTML = "";
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalSlots; i += 1) {
    const optionTime = new Date(
      baseDate.getTime() + (startHour * 60 + i * 30) * 60 * 1000
    );
    const label = formatTime(optionTime);
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    timeSelect.appendChild(option);
  }
};

const handleTimeChange = () => {
  const selectedTime = timeSelect.value;
  const nextActive = timelineGrid.querySelector(
    `[data-time="${selectedTime}"]`
  );
  if (nextActive) {
    const dateValue = datePicker.value;
    const schedule = loadSchedule(dateValue);
    setActiveSlot(nextActive, schedule[selectedTime] ?? "");
  }
};

const handleSave = () => {
  if (!activeSlot) return;
  const dateValue = datePicker.value;
  const schedule = loadSchedule(dateValue);
  const task = taskInput.value.trim();

  if (task) {
    schedule[activeSlot.dataset.time] = task;
  } else {
    delete schedule[activeSlot.dataset.time];
  }

  saveSchedule(dateValue, schedule);
  renderTimeline(dateValue);
};

const handleClear = () => {
  if (!activeSlot) return;
  taskInput.value = "";
  handleSave();
};

const initDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  datePicker.value = `${yyyy}-${mm}-${dd}`;
};

saveButton.addEventListener("click", handleSave);
clearButton.addEventListener("click", handleClear);

datePicker.addEventListener("change", () => {
  activeSlot = null;
  timeSelect.value = timeSelect.options[0]?.value ?? "";
  taskInput.value = "";
  renderTimeline(datePicker.value);
});

initDate();
buildTimeOptions();
renderTimeline(datePicker.value);
handleTimeChange();

timeSelect.addEventListener("change", handleTimeChange);
