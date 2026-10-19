const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 0. NAVBAR PAGE SWITCHING LOGIC
  // ==========================================
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page-section");

  const titleMap = {
    "home-page": [
      "Welcome to EduNova AI",
      "Discover modern AI study assistants.",
    ],
    "dashboard-page": [
      "Dashboard",
      "Empowering learners with AI-driven study tools.",
    ],
    "services-page": [
      "Our AI Services",
      "Explore state-of-the-art AI study tools.",
    ],
    "contact-page": [
      "Contact Support",
      "We are here to answer your questions.",
    ],
    "about-page": [
      "About EduNova AI",
      "Our mission to empower students globally.",
    ],
  };

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetPageId = item.getAttribute("data-target");

      // Hide all page sections
      pages.forEach((page) => page.classList.add("hidden"));

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Show target page section & set active nav item
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.classList.remove("hidden");
      }
      item.classList.add("active");

      // Update header titles dynamically
      if (titleMap[targetPageId]) {
        const headerTitle = document.getElementById("header-title");
        const headerSubtitle = document.getElementById("header-subtitle");
        if (headerTitle) headerTitle.innerText = titleMap[targetPageId][0];
        if (headerSubtitle)
          headerSubtitle.innerText = titleMap[targetPageId][1];
      }
    });
  });

  // CTA Button on Home Page to switch to Dashboard
  const exploreBtn = document.getElementById("exploreDashboardBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      const dashNav = document.querySelector('[data-target="dashboard-page"]');
      if (dashNav) dashNav.click();
    });
  }

  // ==========================================
  // 1. POMODORO FOCUS TIMER WIDGET
  // ==========================================
  let timerInterval = null;
  let totalSeconds = 0;
  let isTimerRunning = false;

  const minutesEl = document.getElementById("timerMinutes");
  const secondsEl = document.getElementById("timerSeconds");
  const startBtn = document.getElementById("startTimerBtn");
  const pauseBtn = document.getElementById("pauseTimerBtn");
  const resetBtn = document.getElementById("resetTimerBtn");

  function updateTimerDisplay() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (minutesEl) minutesEl.innerText = String(mins).padStart(2, "0");
    if (secondsEl) secondsEl.innerText = String(secs).padStart(2, "0");
  }

  updateTimerDisplay();

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (isTimerRunning) return;
      isTimerRunning = true;
      timerInterval = setInterval(() => {
        totalSeconds++;
        updateTimerDisplay();
      }, 1000);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      isTimerRunning = false;
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      isTimerRunning = false;
      totalSeconds = 0;
      updateTimerDisplay();
    });
  }

  // ==========================================
  // 2. DYNAMIC DAILY STUDY CHECKLIST (With Strike-Through Support)
  // ==========================================
  const checklistContainer = document.getElementById("checklistItems");
  const checklistProgress = document.getElementById("checklistProgress");
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");

  let checklistData = [];

  function renderChecklist() {
    if (!checklistContainer) return;
    checklistContainer.innerHTML = "";

    checklistData.forEach((item, index) => {
      const label = document.createElement("label");
      label.className = "checklist-item";
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "0.5rem";
      label.style.fontSize = "0.85rem";

      // Apply strike-through and dimmed opacity when checked
      const textStyle = item.checked
        ? "text-decoration: line-through; opacity: 0.6;"
        : "";

      label.innerHTML = `
        <input type="checkbox" ${item.checked ? "checked" : ""} data-index="${index}">
        <span style="${textStyle}">${index + 1}. ${item.text}</span>
      `;
      checklistContainer.appendChild(label);
    });

    const total = checklistData.length;
    const checkedCount = checklistData.filter((i) => i.checked).length;
    if (checklistProgress) {
      checklistProgress.innerText = `${checkedCount}/${total} Done`;
    }

    const checkboxes = checklistContainer.querySelectorAll(
      'input[type="checkbox"]',
    );
    checkboxes.forEach((box) => {
      box.addEventListener("change", (e) => {
        const idx = e.target.getAttribute("data-index");
        checklistData[idx].checked = e.target.checked;
        renderChecklist();
      });
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const text = taskInput.value.trim();

      if (!text) {
        alert("Please enter a task name!");
        return;
      }

      if (checklistData.length >= 4) {
        alert("Maximum limit reached! You can only add up to 4 tasks.");
        return;
      }

      checklistData.push({ text: text, checked: false });
      taskInput.value = "";
      renderChecklist();
    });
  }

  renderChecklist();

  // ==========================================
  // 3. CONCEPT SIMPLIFIER (ELI5)
  // ==========================================
  const eli5Btn = document.getElementById("eli5Btn");
  if (eli5Btn) {
    eli5Btn.addEventListener("click", async () => {
      const input = document.getElementById("eli5Input").value.trim();
      const output = document.getElementById("eli5Output");

      if (!input) {
        alert("Please enter a concept to simplify!");
        return;
      }

      eli5Btn.innerText = "Simplifying...";
      eli5Btn.disabled = true;
      output.classList.add("hidden");

      try {
        const response = await fetch(`${API_BASE_URL}/summarize-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textNotes: `Explain this concept simply like I am 5 years old: ${input}`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          output.innerText = data.summary;
          output.classList.remove("hidden");
        } else {
          alert("Error: " + (data.error || "Failed to simplify concept."));
        }
      } catch (err) {
        console.error("ELI5 Error:", err);
        alert("Could not connect to backend server on port 5000.");
      } finally {
        eli5Btn.innerText = "Simplify Concept";
        eli5Btn.disabled = false;
      }
    });
  }

  // ==========================================
  // 4. SMART QUIZ GENERATOR
  // ==========================================
  const quizBtn = document.getElementById("generateQuizBtn");
  if (quizBtn) {
    quizBtn.addEventListener("click", async () => {
      const input = document.getElementById("quizInput").value.trim();
      const numQuestions = document.getElementById("quizNum").value;
      const difficulty = document.getElementById("quizDifficulty").value;
      const output = document.getElementById("quizOutput");

      if (!input) {
        alert("Please paste study content to generate quiz questions!");
        return;
      }

      quizBtn.innerText = "Creating Practice Quiz...";
      quizBtn.disabled = true;
      output.classList.add("hidden");

      try {
        const response = await fetch(`${API_BASE_URL}/generate-flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textContent: `Generate ${numQuestions} practice quiz questions with ${difficulty} difficulty from this content: ${input}`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          output.innerText = data.flashcards;
          output.classList.remove("hidden");
        } else {
          alert("Error: " + (data.error || "Failed to create quiz."));
        }
      } catch (err) {
        console.error("Quiz Error:", err);
        alert("Could not connect to backend server on port 5000.");
      } finally {
        quizBtn.innerText = "Create Practice Quiz";
        quizBtn.disabled = false;
      }
    });
  }

  // ==========================================
  // 5. ESSAY & WRITING POLISH
  // ==========================================
  const polishBtn = document.getElementById("polishEssayBtn");
  if (polishBtn) {
    polishBtn.addEventListener("click", async () => {
      const input = document.getElementById("essayInput").value.trim();
      const output = document.getElementById("essayOutput");

      if (!input) {
        alert("Please enter draft text to review!");
        return;
      }

      polishBtn.innerText = "Reviewing Writing...";
      polishBtn.disabled = true;
      output.classList.add("hidden");

      try {
        const response = await fetch(`${API_BASE_URL}/summarize-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textNotes: `Review and polish this text for grammar, tone, and sentence structure, and give analysis points: ${input}`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          output.innerText = data.summary;
          output.classList.remove("hidden");
        } else {
          alert("Error: " + (data.error || "Failed to polish text."));
        }
      } catch (err) {
        console.error("Essay Polish Error:", err);
        alert("Could not connect to backend server on port 5000.");
      } finally {
        polishBtn.innerText = "Review Tone / Grammar";
        polishBtn.disabled = false;
      }
    });
  }

  // ==========================================
  // 6. CONTACT FORM SUBMISSION
  // ==========================================
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const statusBox = document.getElementById("contactStatus");
      if (statusBox) {
        statusBox.innerText =
          "Thank you! Your message has been sent successfully.";
        statusBox.classList.remove("hidden");
        contactForm.reset();
      }
    });
  }
});
