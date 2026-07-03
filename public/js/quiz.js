// ✅ Get all necessary elements
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const timerDisplay = document.getElementById("timeLeft");
const feedback = document.getElementById("feedback");
const questionImg = document.getElementById("questionImg");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const skipBtn = document.getElementById("skipBtn");
const hintBtn = document.getElementById("hintBtn");
const showQuestionBtn = document.getElementById("showQuestionBtn");
const scoreDisplay = document.getElementById("scoreDisplay");
const progressBar = document.getElementById("progressBar");

let currentIndex = 0;
let score = 0;
let timer;

const category = localStorage.getItem("category") || "algebra";
const difficulty = localStorage.getItem("difficulty") || "easy";
let currentSet = [];

const timePerLevel = {
  easy: 30,
  medium: 60,
  hard: 230
};
let time = timePerLevel[difficulty];

// 🌟 الأسئلة الاحتياطية (Local Backup) في حال لم يتم جلبها من الـ API
const localQuestionsBackup = {
  algebra: {
    easy: [
      { question: "Solve for x: 2x + 3 = 7", options: ["x = 2", "x = 3", "x = 4", "x = 5"], answer: "x = 2", hint: "Subtract 3 then divide by 2" },
      { question: "Simplify: 3x + 2x", options: ["5x", "6x", "3x²", "x⁵"], answer: "5x" }
    ],
    medium: [
      { question: "Solve: 3x - 5 = 10", options: ["x = 3", "x = 5", "x = 6", "x = 7"], answer: "x = 5" },
      { question: "Expand: (x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5", "x² + 2x + 3"], answer: "x² + 5x + 6" }
    ],
    hard: [
      { question: "Solve: 2x² - 8 = 0", options: ["x = ±2", "x = 2", "x = 4", "x = -2"], answer: "x = ±2" },
      { question: "Factorize: x² - 9", options: ["(x - 3)(x + 3)", "(x - 9)(x + 1)", "x(x - 9)", "(x - 1)(x + 9)"], answer: "(x - 3)(x + 3)" }
    ]
  },
  geometry: {
    easy: [
      { question: "How many sides does a triangle have?", options: ["3", "4", "5", "6"], answer: "3" },
      { question: "What is the sum of angles in a triangle?", options: ["180°", "90°", "360°", "270°"], answer: "180°" }
    ],
    medium: [
      { question: "Area of a rectangle = ?", options: ["length × width", "2(length + width)", "side²", "πr²"], answer: "length × width" },
      { question: "Area of a circle with radius r?", options: ["πr²", "2πr", "r²", "πd"], answer: "πr²" }
    ],
    hard: [
      { question: "Find the hypotenuse if sides are 6 and 8", options: ["10", "12", "8", "14"], answer: "10" },
      { question: "What is the volume of a cube with side 4?", options: ["64", "16", "32", "48"], answer: "64" }
    ]
  },
  trigonometry: {
    easy: [
      { question: "sin(90°) =", options: ["0", "1", "√2/2", "undefined"], answer: "1" },
      { question: "cos(0°) =", options: ["1", "0", "undefined", "-1"], answer: "1" }
    ],
    medium: [
      { question: "tan(45°) =", options: ["1", "0", "√3", "1/√3"], answer: "1" },
      { question: "If sin(θ)=1/2, θ=?", options: ["30°", "45°", "60°", "90°"], answer: "30°" }
    ],
    hard: [
      { question: "Simplify: sin²x + cos²x", options: ["1", "0", "2", "sinx"], answer: "1" },
      { question: "If tanx = 3/4, find sinx", options: ["3/5", "4/5", "5/3", "1"], answer: "3/5" }
    ]
  }
};

// ✅ دالة جلب الأسئلة ديناميكياً من الباك إند والمونجو
async function loadQuiz() {
    try {
        // تحويل الحروف الأولى لكبيرة لتطابق البيانات المرسلة (مثل algebra -> Algebra)
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

        const response = await fetch(`/api/questions?category=${formattedCategory}&difficulty=${formattedDifficulty}`);
        const mongoQuestions = await response.json();

        if (mongoQuestions && mongoQuestions.length > 0) {
            // تحويل بنية بيانات المونجو لتطابق نظام الكود الحالي عندك
            currentSet = mongoQuestions.map(q => ({
                question: q.questionText,
                options: q.options,
                answer: q.correctAnswer,
                hint: q.hint,
                img: q.img || ""
            }));
            console.log("✅ Loaded questions successfully from MongoDB Atlas!");
        } else {
            // استخدام الأسئلة المحلية إذا كانت قاعدة البيانات فارغة
            currentSet = [...localQuestionsBackup[category][difficulty]];
            console.log("⚠️ MongoDB setup is empty for this setup. Using local backup.");
        }
    } catch (err) {
        console.error("Failed to fetch from API, loading local backup questions:", err);
        currentSet = [...localQuestionsBackup[category][difficulty]];
    }

    shuffle(currentSet);
    scoreDisplay.textContent = `Score: 0 / ${currentSet.length} (0%)`;
    progressBar.style.width = `0%`;
    showQuestion();
}

function showQuestion() {
  clearInterval(timer);
  const q = currentSet[currentIndex];

  if (!q || !q.question || !q.options) {
    questionText.textContent = "⚠️ Failed to load question.";
    optionsContainer.innerHTML = "";
    questionImg.src = "";
    questionImg.classList.add("hidden");
    timerDisplay.textContent = "0";
    return;
  }

  time = timePerLevel[difficulty];
  updateTimer();
  timerDisplay.classList.remove("warning");

  timer = setInterval(() => {
    time--;
    updateTimer();
    if (time <= 3) timerDisplay.classList.add("warning");
    if (time <= 0) {
      clearInterval(timer);
      checkAnswer(null);
    }
  }, 1000);

  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";

  // ✅ عرض الصورة الخاصة بالسؤال
  if (q.img) {
    questionImg.src = q.img;
    questionImg.classList.remove("hidden");
  } else {
    questionImg.src = "";
    questionImg.classList.add("hidden");
  }

  // ✅ توليد أزرار الاختيارات الأربعة
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option-btn");
    btn.onclick = () => checkAnswer(opt);
    optionsContainer.appendChild(btn);
  });

  feedback.innerHTML = "";
}

function checkAnswer(selected) {
  clearInterval(timer);
  const correct = currentSet[currentIndex].answer;
  if (selected === correct) {
    if(correctSound) correctSound.play().catch(e => console.log("Audio play deferred"));
    score++;
    feedback.innerHTML = "✅ Correct!";
  } else {
    if(wrongSound) wrongSound.play().catch(e => console.log("Audio play deferred"));
    feedback.innerHTML = `❌ Wrong! Answer was: ${correct}`;
  }

  const total = currentSet.length;
  const percent = Math.round((score / total) * 100);
  scoreDisplay.textContent = `Score: ${score} / ${total} (${percent}%)`;
  const progressPercent = ((currentIndex + 1) / total) * 100;
  progressBar.style.width = `${progressPercent}%`;

  setTimeout(() => {
    feedback.innerHTML = "";
    currentIndex++;
    if (currentIndex < currentSet.length) showQuestion();
    else endQuiz();
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = time + "s";
}

// ✅ دالة إنهاء الكويز وإرسال النتيجة تلقائياً للـ Scoreboard في قاعدة البيانات Cloud
async function endQuiz() {
  const finalScoreText = `${score}/${currentSet.length}`;
  localStorage.setItem("latestScore", finalScoreText);
  
  const past = JSON.parse(localStorage.getItem("history") || "[]");
  past.push({
    score: finalScoreText,
    date: new Date().toLocaleString(),
    difficulty,
    category
  });
  localStorage.setItem("history", JSON.stringify(past));

  // إرسال النتيجة بطلب POST حقيقي لحفظها في الـ Scoreboard بالمونجو
  try {
      await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              scoreText: finalScoreText,
              difficulty: difficulty.toUpperCase()
          })
      });
      console.log('Score saved successfully to remote MongoDB leaderboard.');
  } catch (err) {
      console.error('Failed to sync score with server:', err);
  }

  window.location.href = "score.html";
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function handleImageError() {
  questionImg.src = "images/default.png";
  questionImg.alt = "Image not available";
}

skipBtn.onclick = () => {
  clearInterval(timer);
  feedback.innerHTML = "⏭️ Question skipped.";
  setTimeout(() => {
    feedback.innerHTML = "";
    currentIndex++;
    if (currentIndex < currentSet.length) showQuestion();
    else endQuiz();
  }, 800);
};

hintBtn.onclick = () => {
  const q = currentSet[currentIndex];
  feedback.innerHTML = q.hint ? `💡 Hint: ${q.hint}` : "❓ No hint available.";
};

showQuestionBtn.onclick = () => {
  const q = currentSet[currentIndex];
  if (q && q.question) {
    alert(q.question);
    const utterance = new SpeechSynthesisUtterance(q.question);
    speechSynthesis.speak(utterance);
  } else {
    alert("⚠️ No question loaded.");
  }
};

// تشغيل جلب البيانات عند بدء تحميل الصفحة
loadQuiz();