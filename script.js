(() => {
  const STORAGE_KEY = "daily-comic-cycle:check-date";
  const CYCLE_START_DATE = "2026-06-23";
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const els = {
    currentDayNumber: document.getElementById("currentDayNumber"),
    currentDayTopic: document.getElementById("currentDayTopic"),
    cycleStartDate: document.getElementById("cycleStartDate"),
    dayButtons: document.getElementById("dayButtons"),
    focusTitle: document.getElementById("focusTitle"),
    focusSummary: document.getElementById("focusSummary"),
    selectedDayLabel: document.getElementById("selectedDayLabel"),
    cycleStatus: document.getElementById("cycleStatus"),
    topicDetailsTitle: document.getElementById("topicDetailsTitle"),
    topicDetails: document.getElementById("topicDetails"),
  };

  const days = Array.isArray(window.CYCLE_DAYS) ? window.CYCLE_DAYS : [];
  let selectedDay = 1;

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromInputValue(value) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  function getStoredCheckDate() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
      return stored;
    }
    return toDateInputValue(new Date());
  }

  function getCycleDayForDate(dateValue) {
    const start = dateFromInputValue(CYCLE_START_DATE);
    const selected = dateFromInputValue(dateValue);
    const diff = Math.floor((selected - start) / MS_PER_DAY);
    const index = ((diff % days.length) + days.length) % days.length;
    return index + 1;
  }

  function getDay(dayNumber) {
    return days.find((day) => day.day === dayNumber) || days[0];
  }

  function makeList(items) {
    const list = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    return list;
  }

  function renderDayButtons(todayDay) {
    els.dayButtons.innerHTML = "";
    days.forEach((day) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "day-button";
      button.dataset.day = String(day.day);
      button.innerHTML = `<span>Day ${day.day}</span><strong>${day.title}</strong>`;
      button.classList.toggle("active", day.day === selectedDay);
      button.classList.toggle("today", day.day === todayDay);
      button.addEventListener("click", () => {
        selectedDay = day.day;
        render();
      });
      els.dayButtons.appendChild(button);
    });
  }

  function renderTopicDetails(day) {
    els.topicDetails.innerHTML = "";
    day.sections.forEach((section) => {
      const block = document.createElement("section");
      const heading = document.createElement("h3");
      heading.textContent = section.heading;
      block.appendChild(heading);
      block.appendChild(makeList(section.items));
      els.topicDetails.appendChild(block);
    });
  }

  function render() {
    if (!days.length) return;

    const dateCycleDay = getCycleDayForDate(els.cycleStartDate.value);
    const day = getDay(selectedDay);
    const dateDay = getDay(dateCycleDay);

    els.currentDayNumber.textContent = String(dateDay.day);
    els.currentDayTopic.textContent = dateDay.title;
    els.focusTitle.textContent = day.title;
    els.focusSummary.textContent = day.summary;
    els.selectedDayLabel.textContent = `Day ${day.day}`;
    els.cycleStatus.textContent =
      day.day === dateCycleDay
        ? `Matched to ${els.cycleStartDate.value}`
        : "Manual preview";
    els.topicDetailsTitle.textContent = `${day.title} Practice`;

    renderDayButtons(dateCycleDay);
    renderTopicDetails(day);
  }

  function init() {
    if (!days.length) {
      els.focusTitle.textContent = "No cycle data found";
      return;
    }

    els.cycleStartDate.value = getStoredCheckDate();
    selectedDay = getCycleDayForDate(els.cycleStartDate.value);

    els.cycleStartDate.addEventListener("change", () => {
      window.localStorage.setItem(STORAGE_KEY, els.cycleStartDate.value);
      selectedDay = getCycleDayForDate(els.cycleStartDate.value);
      render();
    });

    render();
  }

  init();
})();
