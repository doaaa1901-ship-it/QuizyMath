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

// 🌟 الأسئلة الاحتياطية الموسعة (Local Backup) مع روابط الصور لكل سؤال
const localQuestionsBackup = {
  algebra: {
    easy: [
      { 
        question: "Solve for x: 2x + 3 = 7", 
        options: ["x = 2", "x = 3", "x = 4", "x = 5"], 
        answer: "x = 2", 
        hint: "Subtract 3 then divide by 2",
        img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Simplify: 3x + 2x", 
        options: ["5x", "6x", "3x²", "x⁵"], 
        answer: "5x",
        hint: "Combine the like terms directly",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What is the value of x if x - 5 = 12?", 
        options: ["x = 7", "x = 17", "x = 12", "x = -7"], 
        answer: "x = 17",
        hint: "Add 5 to both sides of the equation",
        img: "https://images.unsplash.com/photo-1453733190148-c44698c265a8?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    medium: [
      { 
        question: "Solve: 3x - 5 = 10", 
        options: ["x = 3", "x = 5", "x = 6", "x = 7"], 
        answer: "x = 5",
        hint: "Add 5 then divide by 3",
        img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Expand: (x + 2)(x + 3)", 
        options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5", "x² + 2x + 3"], 
        answer: "x² + 5x + 6",
        hint: "Use the FOIL method to expand",
        img: "https://images.unsplash.com/photo-1596495578065-6e0763fa1141?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Find the slope of the line y = 4x - 7", 
        options: ["-7", "4", "7", "1"], 
        answer: "4",
        hint: "Look at the 'm' value in y = mx + b",
        img: "https://images.unsplash.com/photo-1543286386-7a39e65fecab?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    hard: [
      { 
        question: "Solve: 2x² - 8 = 0", 
        options: ["x = ±2", "x = 2", "x = 4", "x = -2"], 
        answer: "x = ±2",
        hint: "Add 8, divide by 2, then find the square root",
        img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Factorize: x² - 9", 
        options: ["(x - 3)(x + 3)", "(x - 9)(x + 1)", "x(x - 9)", "(x - 1)(x + 9)"], 
        answer: "(x - 3)(x + 3)",
        hint: "This is a difference of squares: a² - b²",
        img: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Find the discriminant of the quadratic equation x² - 4x + 4 = 0", 
        options: ["0", "16", "-16", "8"], 
        answer: "0",
        hint: "Use the formula: D = b² - 4ac",
        img: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=400&q=80" 
      }
    ]
  },
  geometry: {
    easy: [
      { 
        question: "How many sides does a triangle have?", 
        options: ["3", "4", "5", "6"], 
        answer: "3",
        hint: "Think about the prefix 'tri'",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What is the sum of angles in a triangle?", 
        options: ["180°", "90°", "360°", "270°"], 
        answer: "180°",
        hint: "It totals a straight flat line if cut open",
        img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What shape has four equal sides and 90-degree angles?", 
        options: ["Square", "Rectangle", "Triangle", "Hexagon"], 
        answer: "Square",
        hint: "All dimensions are identical and parallel",
        img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    medium: [
      { 
        question: "Area of a rectangle = ?", 
        options: ["length × width", "2(length + width)", "side²", "πr²"], 
        answer: "length × width",
        hint: "Multiply base dimensions",
        img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Area of a circle with radius r?", 
        options: ["πr²", "2πr", "r²", "πd"], 
        answer: "πr²",
        hint: "Pi multiplied by the radius squared",
        img: "https://images.unsplash.com/photo-1618005198143-e5283b019a7f?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What is the perimeter of a rectangle with length 5 and width 3?", 
        options: ["16", "15", "8", "30"], 
        answer: "16",
        hint: "Formula: 2 * (length + width)",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    hard: [
      { 
        question: "Find the hypotenuse if sides are 6 and 8", 
        options: ["10", "12", "8", "14"], 
        answer: "10",
        hint: "Use the Pythagorean Theorem: a² + b² = c²",
        img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What is the volume of a cube with side 4?", 
        options: ["64", "16", "32", "48"], 
        answer: "64",
        hint: "Side cubed: s * s * s",
        img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Find the total interior angle sum of a regular hexagon.", 
        options: ["720°", "540°", "360°", "900°"], 
        answer: "720°",
        hint: "Formula: (n - 2) * 180, where n is number of sides",
        img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80" 
      }
    ]
  },
  trigonometry: {
    easy: [
      { 
        question: "sin(90°) =", 
        options: ["0", "1", "√2/2", "undefined"], 
        answer: "1",
        hint: "The peak value on the sine wave circle",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "cos(0°) =", 
        options: ["1", "0", "undefined", "-1"], 
        answer: "1",
        hint: "The value starts at maximum height along the x-axis",
        img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "What is the ratio definition of tan(θ)?", 
        options: ["Opposite/Adjacent", "Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Hypotenuse/Opposite"], 
        answer: "Opposite/Adjacent",
        hint: "SOH CAH TOA rules",
        img: "https://images.unsplash.com/photo-1596495578065-6e0763fa1141?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    medium: [
      { 
        question: "tan(45°) =", 
        options: ["1", "0", "√3", "1/√3"], 
        answer: "1",
        hint: "Opposite side equals the Adjacent side in this special right triangle",
        img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "If sin(θ) = 1/2, what is the acute angle θ?", 
        options: ["30°", "45°", "60°", "90°"], 
        answer: "30°",
        hint: "Matches the shortest standard side profile",
        img: "https://images.unsplash.com/photo-1543286386-7a39e65fecab?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "cos(180°) =", 
        options: ["-1", "0", "1", "0.5"], 
        answer: "-1",
        hint: "The polar opposite of cos(0°)",
        img: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80" 
      }
    ],
    hard: [
      { 
        question: "Simplify: sin²x + cos²x", 
        options: ["1", "0", "2", "sinx"], 
        answer: "1",
        hint: "The fundamental Pythagorean trigonometric identity",
        img: "https://images.unsplash.com/photo-1453733190148-c44698c265a8?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "If tanx = 3/4, find sinx (where x is acute)", 
        options: ["3/5", "4/5", "5/3", "1"], 
        answer: "3/5",
        hint: "Construct a 3-4-5 right triangle: sin is Opposite/Hypotenuse",
        img: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=400&q=80"
      },
      { 
        question: "Which of the following equals 1/cos(x)?", 
        options: ["sec(x)", "csc(x)", "cot(x)", "tan(x)"], 
        answer: "sec(x)",
        hint: "Reciprocal trigonometric identity starting with 's'",
        img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=400&q=80" 
      }
    ]
  }
};

// ✅ دالة جلب الأسئلة ديناميكياً من الباك إند والمونجو
async function loadQuiz() {
    try {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

        const response = await fetch(`/api/questions?category=${formattedCategory}&difficulty=${formattedDifficulty}`);
        const mongoQuestions = await response.json();

        if (mongoQuestions && mongoQuestions.length > 0) {
            currentSet = mongoQuestions.map(q => ({
                question: q.questionText,
                options: q.options,
                answer: q.correctAnswer,
                hint: q.hint,
                img: q.img || ""
            }));
            console.log("✅ Loaded questions successfully from MongoDB Atlas!");
        } else {
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

  try {
      // لو المستخدم مسجل دخول، النتيجة بتترتبط بحسابه، غير كده بتتحفظ كـ guest
      const token = localStorage.getItem("token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/scores', {
          method: 'POST',
          headers,
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