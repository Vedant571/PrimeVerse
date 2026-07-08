// PrimeVerse Interactive Mathematics Tools Controller

// 1. Core Prime Math Utilities
const PrimeMath = {
    isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    },

    getFactors(n) {
        const factors = [];
        for (let i = 1; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                factors.push(i);
                if (i * i !== n) {
                    factors.push(n / i);
                }
            }
        }
        return factors.sort((a, b) => a - b);
    },

    generatePrimesRange(start, end) {
        const primes = [];
        const maxLimit = 100000; // safety ceiling
        
        // Sanitize bounds
        const s = Math.max(2, parseInt(start, 10) || 0);
        const e = Math.min(maxLimit, parseInt(end, 10) || 0);
        
        // Simple sieve or trial division
        for (let i = s; i <= e; i++) {
            if (this.isPrime(i)) {
                primes.push(i);
            }
        }
        return primes;
    },

    getPrimeFactorization(n) {
        let temp = n;
        const factors = {};
        
        // Divide out 2s
        while (temp % 2 === 0) {
            factors[2] = (factors[2] || 0) + 1;
            temp /= 2;
        }
        
        // Divide out odd divisors
        for (let i = 3; i * i <= temp; i += 2) {
            while (temp % i === 0) {
                factors[i] = (factors[i] || 0) + 1;
                temp /= i;
            }
        }
        
        // If remaining is prime itself
        if (temp > 2) {
            factors[temp] = (factors[temp] || 0) + 1;
        }
        
        return factors;
    },

    // Recursively build factor tree nodes
    buildFactorTreeData(n) {
        if (n <= 1) return { value: n };
        if (this.isPrime(n)) return { value: n, isPrime: true };

        // Find smallest prime factor
        let factor = 2;
        while (n % factor !== 0) {
            factor++;
        }
        
        const other = n / factor;
        return {
            value: n,
            left: { value: factor, isPrime: true },
            right: this.buildFactorTreeData(other)
        };
    }
};

// 2. Quiz Database & State
const QuizData = [
    {
        question: "What is the only even prime number?",
        options: ["0", "2", "4", "6"],
        correct: 1,
        explanation: "2 is the smallest prime number and the only even prime. Any even number greater than 2 is divisible by 2, meaning it has factors other than 1 and itself."
    },
    {
        question: "Which of the following numbers is a prime number?",
        options: ["27", "51", "91", "97"],
        correct: 3,
        explanation: "97 is a prime number because it is only divisible by 1 and 97. (27 = 3×9, 51 = 3×17, 91 = 7×13)."
    },
    {
        question: "A prime number of the form 2^p - 1 is known as a:",
        options: ["Goldbach Prime", "Mersenne Prime", "Fibonacci Prime", "Fermat Prime"],
        correct: 1,
        explanation: "A Mersenne prime is a prime number that is one less than a power of two: M_p = 2^p - 1, named after the French scholar Marin Mersenne."
    },
    {
        question: "What does Goldbach's Conjecture state?",
        options: [
            "Every odd number is the sum of three primes.",
            "Every even integer greater than 2 is the sum of two primes.",
            "There are infinitely many twin primes.",
            "Prime numbers occur at regular intervals."
        ],
        correct: 1,
        explanation: "Goldbach's Conjecture states that every even integer greater than 2 can be written as the sum of two prime numbers. It remains unsolved to this day!"
    },
    {
        question: "What is the prime factorization of 90?",
        options: ["2 × 3 × 5", "2 × 3^2 × 5", "2^2 × 3 × 5", "2 × 3 × 5^2"],
        correct: 1,
        explanation: "90 factored is 2 × 45, which is 2 × 9 × 5, which breaks down into 2 × 3^2 × 5."
    }
];

let currentQuestionIndex = 0;
let quizScore = 0;
let answered = false;

// 3. UI Bindings
document.addEventListener("DOMContentLoaded", () => {
    // --- TOOL 1: Checker ---
    const checkBtn = document.getElementById("checkPrimeBtn");
    const checkerInput = document.getElementById("checkerNumberInput");
    const checkerResult = document.getElementById("checkerResult");

    if (checkBtn && checkerInput && checkerResult) {
        const runCheck = () => {
            const val = checkerInput.value.trim();
            if (val === "") {
                checkerResult.innerHTML = `<span class="text-danger fw-semibold"><i class="bi bi-x-circle-fill"></i> Please enter a number</span>`;
                return;
            }
            
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 0) {
                checkerResult.innerHTML = `<span class="text-danger fw-semibold"><i class="bi bi-x-circle-fill"></i> Enter a valid positive integer</span>`;
                return;
            }

            const isPrime = PrimeMath.isPrime(num);
            const factors = PrimeMath.getFactors(num);

            if (isPrime) {
                checkerResult.innerHTML = `
                    <div class="alert alert-success border-0 bg-success bg-opacity-10 text-success p-3 rounded-4 fade-in-up">
                        <h5 class="fw-bold"><i class="bi bi-check-circle-fill"></i> ${num} is a Prime Number!</h5>
                        <p class="mb-0 text-secondary" style="font-size: 0.9rem;">It has exactly two factors: 1 and ${num}.</p>
                    </div>
                `;
            } else {
                checkerResult.innerHTML = `
                    <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger p-3 rounded-4 fade-in-up">
                        <h5 class="fw-bold"><i class="bi bi-x-circle-fill"></i> ${num} is a Composite Number (Not Prime)</h5>
                        <p class="text-secondary mb-2" style="font-size: 0.9rem;">It has ${factors.length} factors: ${factors.join(", ")}.</p>
                        <small class="d-block text-muted">A number must have exactly two factors to be prime.</small>
                    </div>
                `;
            }
        };

        checkBtn.addEventListener("click", runCheck);
        checkerInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") runCheck();
        });
    }

    // --- TOOL 2: Generator ---
    const genBtn = document.getElementById("generatePrimesBtn");
    const genStart = document.getElementById("genStartInput");
    const genEnd = document.getElementById("genEndInput");
    const genResult = document.getElementById("genResult");

    if (genBtn && genStart && genEnd && genResult) {
        genBtn.addEventListener("click", () => {
            const startVal = genStart.value.trim();
            const endVal = genEnd.value.trim();
            
            if (startVal === "" || endVal === "") {
                genResult.innerHTML = `<div class="text-danger fw-semibold mt-3"><i class="bi bi-x-circle-fill"></i> Fill in both range inputs</div>`;
                return;
            }

            const start = parseInt(startVal, 10);
            const end = parseInt(endVal, 10);

            if (start > end) {
                genResult.innerHTML = `<div class="text-danger fw-semibold mt-3"><i class="bi bi-x-circle-fill"></i> Start number must be smaller than end number</div>`;
                return;
            }

            if (end - start > 50000) {
                genResult.innerHTML = `<div class="text-warning fw-semibold mt-3"><i class="bi bi-exclamation-triangle-fill"></i> Range is too large. Max limit range is 50,000 for browser safety</div>`;
                return;
            }

            // Benchmark start
            const t0 = performance.now();
            const primes = PrimeMath.generatePrimesRange(start, end);
            const t1 = performance.now();
            const elapsed = (t1 - t0).toFixed(2);

            if (primes.length === 0) {
                genResult.innerHTML = `
                    <div class="mt-3 alert alert-warning border-0 bg-warning bg-opacity-10 text-warning p-3 rounded-4 fade-in-up">
                        <p class="mb-0">Found <strong>0</strong> primes in range [${start}, ${end}]. (Calculated in ${elapsed} ms)</p>
                    </div>
                `;
                return;
            }

            genResult.innerHTML = `
                <div class="mt-3 fade-in-up">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-secondary" style="font-size: 0.9rem;">
                            Found <strong>${primes.length}</strong> primes (in ${elapsed} ms)
                        </span>
                        <button class="btn btn-sm btn-premium-outline rounded-pill px-3 py-1" onclick="copyGenResult()">
                            <i class="bi bi-clipboard"></i> Copy List
                        </button>
                    </div>
                    <div class="p-3 bg-dark bg-opacity-40 rounded-4 border" style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.95rem; word-break: break-all; letter-spacing: 0.5px; border-color: var(--border-color) !important;">
                        <span id="primesListText">${primes.join(", ")}</span>
                    </div>
                </div>
            `;
        });
    }

    // --- TOOL 3: Factorization ---
    const factorBtn = document.getElementById("factorizeBtn");
    const factorInput = document.getElementById("factorInput");
    const factorResult = document.getElementById("factorResult");

    if (factorBtn && factorInput && factorResult) {
        factorBtn.addEventListener("click", () => {
            const val = factorInput.value.trim();
            if (val === "") {
                factorResult.innerHTML = `<div class="text-danger fw-semibold mt-3"><i class="bi bi-x-circle-fill"></i> Enter a number</div>`;
                return;
            }

            const num = parseInt(val, 10);
            if (isNaN(num) || num < 2 || num > 1000000) {
                factorResult.innerHTML = `<div class="text-danger fw-semibold mt-3"><i class="bi bi-x-circle-fill"></i> Please enter an integer between 2 and 1,000,000</div>`;
                return;
            }

            const pFactors = PrimeMath.getPrimeFactorization(num);
            
            // Format Prime Factorization output string
            const equationTerms = [];
            for (let f in pFactors) {
                const power = pFactors[f];
                if (power > 1) {
                    equationTerms.push(`${f}<sup>${power}</sup>`);
                } else {
                    equationTerms.push(f);
                }
            }
            const equationHTML = `${num} = ${equationTerms.join(" &times; ")}`;

            // Build factor tree JSON
            const treeData = PrimeMath.buildFactorTreeData(num);
            
            // Generate visual HTML of the tree
            const treeHTML = buildTreeHTML(treeData);

            factorResult.innerHTML = `
                <div class="mt-4 p-3 glass-panel rounded-4 border fade-in-up" style="border-color: var(--border-color) !important;">
                    <h5 class="fw-bold mb-3 text-center" style="background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Prime Factorization</h5>
                    <div class="text-center fs-4 fw-bold mb-4" style="color: var(--text-primary); font-family: 'Poppins', sans-serif;">
                        ${equationHTML}
                    </div>
                    <div class="factor-tree-wrapper py-3">
                        <h6 class="text-center text-secondary mb-3">Factor Tree Diagram</h6>
                        <div class="factor-tree d-flex justify-content-center">
                            ${treeHTML}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Helper to recursively draw Factor Tree elements in HTML
    function buildTreeHTML(node) {
        if (!node) return "";
        
        const isPrimeClass = node.isPrime ? "bg-primary border-primary text-white" : "bg-dark bg-opacity-40 border text-secondary";
        const labelStyle = node.isPrime ? "font-weight: 700; box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);" : "";

        let childrenHTML = "";
        if (node.left && node.right) {
            childrenHTML = `
                <div class="d-flex justify-content-between mt-3 px-3 tree-branches" style="gap: 40px; position: relative;">
                    <div class="tree-branch-left" style="position: relative; flex: 1; text-align: center;">
                        <span style="position: absolute; top: -16px; left: 50%; height: 16px; width: 1px; background: var(--border-color); transform: rotate(15deg);"></span>
                        ${buildTreeHTML(node.left)}
                    </div>
                    <div class="tree-branch-right" style="position: relative; flex: 1; text-align: center;">
                        <span style="position: absolute; top: -16px; left: 50%; height: 16px; width: 1px; background: var(--border-color); transform: rotate(-15deg);"></span>
                        ${buildTreeHTML(node.right)}
                    </div>
                </div>
            `;
        }

        return `
            <div class="d-inline-flex flex-column align-items-center factor-node">
                <div class="px-3 py-2 rounded-4 text-center border d-flex align-items-center justify-content-center" style="min-width: 50px; font-family: monospace; font-size: 1.1rem; ${labelStyle}; border-color: var(--border-color) !important; transition: all 0.3s; ${node.isPrime ? 'background: var(--accent-gradient); border: none !important; color: white !important;' : 'background: rgba(255,255,255,0.05); color: var(--text-primary);'}">
                    ${node.value}
                </div>
                ${childrenHTML}
            </div>
        `;
    }

    // --- TOOL 4: Quiz ---
    const quizCard = document.getElementById("quizCard");
    if (quizCard) {
        initQuiz();
    }
});

// Copy Gen Result Clipboard
window.copyGenResult = function() {
    const listText = document.getElementById("primesListText");
    if (listText) {
        navigator.clipboard.writeText(listText.innerText).then(() => {
            showToast("Copied primes list!", "success");
        });
    }
};

// Quiz Module Logic
function initQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    answered = false;
    renderQuestion();
}

function renderQuestion() {
    const quizCard = document.getElementById("quizCard");
    if (!quizCard) return;

    answered = false;
    const q = QuizData[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / QuizData.length) * 100;

    quizCard.innerHTML = `
        <div class="fade-in-up">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge badge-category">Question ${currentQuestionIndex + 1} of ${QuizData.length}</span>
                <span class="fw-semibold text-secondary" style="font-size: 0.9rem;">Score: ${quizScore}/${QuizData.length}</span>
            </div>
            
            <div class="progress mb-4 bg-dark bg-opacity-20 border" style="height: 6px; border-color: var(--border-color) !important; border-radius: 3px;">
                <div class="progress-bar rounded" role="progressbar" style="width: ${progressPercent}%; background: var(--accent-gradient);" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>

            <h4 class="fw-bold mb-4" style="color: var(--text-primary); font-family: 'Poppins', sans-serif;">${q.question}</h4>

            <div class="row g-3" id="quizOptions">
                ${q.options.map((opt, idx) => `
                    <div class="col-12">
                        <button class="w-100 text-start px-4 py-3 rounded-4 glass-panel border option-btn" data-index="${idx}" style="font-size: 1rem; color: var(--text-primary); transition: all 0.25s; text-decoration: none;">
                            <div class="d-flex align-items-center">
                                <span class="badge rounded-circle border d-inline-flex align-items-center justify-content-center me-3" style="width: 28px; height: 28px; border-color: var(--border-color) !important; font-family: monospace; font-weight: 700;">${String.fromCharCode(65 + idx)}</span>
                                <span class="option-text">${opt}</span>
                            </div>
                        </button>
                    </div>
                `).join('')}
            </div>

            <div id="quizFeedback" class="mt-4 d-none">
                <div class="p-3 rounded-4 mb-4 border explanation-card"></div>
                <div class="text-end">
                    <button class="btn btn-premium rounded-pill px-4" id="quizNextBtn">
                        ${currentQuestionIndex === QuizData.length - 1 ? 'Finish Quiz' : 'Next Question <i class="bi bi-arrow-right-short"></i>'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Bind option click
    const optionBtns = quizCard.querySelectorAll(".option-btn");
    optionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (answered) return;
            const chosenIdx = parseInt(btn.dataset.index, 10);
            selectOption(chosenIdx, optionBtns);
        });
    });
}

function selectOption(idx, optionBtns) {
    answered = true;
    const q = QuizData[currentQuestionIndex];
    const feedbackDiv = document.getElementById("quizFeedback");
    const explanationCard = feedbackDiv.querySelector(".explanation-card");
    const nextBtn = document.getElementById("quizNextBtn");

    optionBtns.forEach(btn => {
        const btnIdx = parseInt(btn.dataset.index, 10);
        const optBadge = btn.querySelector(".badge");
        btn.disabled = true;

        if (btnIdx === q.correct) {
            btn.style.background = "rgba(16, 185, 129, 0.15)";
            btn.style.borderColor = "#10b981";
            optBadge.style.background = "#10b981";
            optBadge.style.color = "#fff";
            optBadge.style.borderColor = "#10b981";
        } else if (btnIdx === idx) {
            btn.style.background = "rgba(239, 68, 68, 0.15)";
            btn.style.borderColor = "#ef4444";
            optBadge.style.background = "#ef4444";
            optBadge.style.color = "#fff";
            optBadge.style.borderColor = "#ef4444";
        }
    });

    const isCorrect = idx === q.correct;
    if (isCorrect) {
        quizScore++;
        explanationCard.innerHTML = `
            <h6 class="fw-bold text-success mb-2"><i class="bi bi-check-circle-fill"></i> Correct Answer!</h6>
            <p class="mb-0 text-secondary" style="font-size: 0.9rem;">${q.explanation}</p>
        `;
        explanationCard.style.background = "rgba(16, 185, 129, 0.05)";
        explanationCard.style.borderColor = "rgba(16, 185, 129, 0.15)";
    } else {
        explanationCard.innerHTML = `
            <h6 class="fw-bold text-danger mb-2"><i class="bi bi-x-circle-fill"></i> Incorrect</h6>
            <p class="mb-2 text-secondary" style="font-size: 0.9rem;">The correct answer is <strong>${q.options[q.correct]}</strong>.</p>
            <p class="mb-0 text-muted" style="font-size: 0.85rem;">${q.explanation}</p>
        `;
        explanationCard.style.background = "rgba(239, 68, 68, 0.05)";
        explanationCard.style.borderColor = "rgba(239, 68, 68, 0.15)";
    }

    feedbackDiv.classList.remove("d-none");
    
    // Bind Next button click
    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < QuizData.length) {
            renderQuestion();
        } else {
            renderResults();
        }
    });
}

function renderResults() {
    const quizCard = document.getElementById("quizCard");
    if (!quizCard) return;

    const percent = Math.round((quizScore / QuizData.length) * 100);
    let title = "Math Genius!";
    let message = "Outstanding! You have a profound understanding of prime numbers.";
    let icon = "bi-trophy-fill text-warning";

    if (percent < 50) {
        title = "Keep Practicing!";
        message = "Read through our articles and try again. Practice makes perfect.";
        icon = "bi-mortarboard-fill text-secondary";
    } else if (percent < 80) {
        title = "Great Job!";
        message = "You have a solid foundation of numbers theory properties.";
        icon = "bi-award-fill text-info";
    }

    quizCard.innerHTML = `
        <div class="text-center py-4 fade-in-up">
            <i class="bi ${icon}" style="font-size: 4rem;"></i>
            <h3 class="fw-bold mt-3 mb-2" style="color: var(--text-primary);">${title}</h3>
            <p class="text-secondary mb-4">${message}</p>
            
            <div class="fs-1 fw-extrabold mb-4" style="font-family: 'Poppins', sans-serif; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${quizScore} / ${QuizData.length}
                <div style="font-size: 1.2rem; color: var(--text-muted); font-weight: 500;" class="mt-1">${percent}% Score</div>
            </div>

            <button class="btn btn-premium rounded-pill px-4" onclick="restartQuiz()">
                <i class="bi bi-arrow-counterclockwise"></i> Retake Quiz
            </button>
        </div>
    `;
}

window.restartQuiz = function() {
    initQuiz();
};
