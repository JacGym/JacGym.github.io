// app.js

const LOGS_KEY = 'gym_logs';

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const workoutScreen = document.getElementById('workout-screen');
const historyScreen = document.getElementById('history-screen');
const currentMuscleGroupEl = document.getElementById('current-muscle-group');
const exercisesContainer = document.getElementById('exercises-container');
const historyListUl = document.getElementById('history-list-ul');

// --- Application Start ---
document.addEventListener('DOMContentLoaded', function () {
    console.log("应用已加载");
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});

// --- Main Functions ---

function startWorkout(muscleGroup) {
    currentMuscleGroupEl.textContent = muscleGroup;
    showWorkoutScreen();

    const lastLog = getLastLogForMuscleGroup(muscleGroup);
    if (lastLog) {
        renderExercises(lastLog.exercises);
    } else {
        // If no history, render an empty list
        renderExercises([]);
    }
}

function renderExercises(exercisesData) {
    exercisesContainer.innerHTML = '';
    exercisesData.sort((a, b) => a.order - b.order);

    exercisesData.forEach((exercise, index) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        exerciseDiv.dataset.exerciseName = exercise.name;

        let exerciseHtml = `
            <button class="delete-exercise-btn" onclick="removeExercise(${index})">✕</button>
            <div class="exercise-header">
                <span class="exercise-name">${exercise.name}</span>
                <div class="order-controls">
                    <button onclick="moveExercise(${index}, 'up')">&uarr;</button>
                    <button onclick="moveExercise(${index}, 'down')">&darr;</button>
                </div>
            </div>
            <textarea class="exercise-notes" placeholder="动作备注..." data-exercise-index="${index}">${exercise.notes || ''}</textarea>
        `;

        // Render 5 sets per exercise
        for (let i = 0; i < 5; i++) {
            const set = exercise.sets[i] || { weight: '', reps: '' };
            const setLabels = ['热身', '正式1', '正式2', '正式3', '正式4'];
            exerciseHtml += `
                <div class="set-row">
                    <span class="set-label">${setLabels[i]}</span>
                    <div class="set-inputs">
                        <input type="number" step="0.5" placeholder="重量" value="${set.weight}" data-exercise-index="${index}" data-set-index="${i}" data-field="weight">
                        <span>kg</span>
                        <input type="number" placeholder="次数" value="${set.reps}" data-exercise-index="${index}" data-set-index="${i}" data-field="reps">
                        <span>次</span>
                    </div>
                </div>
            `;
        }

        exerciseDiv.innerHTML = exerciseHtml; // Insert the generated HTML
        exercisesContainer.appendChild(exerciseDiv);
    });
}

function moveExercise(fromIndex, direction) {
    const currentExercises = getCurrentExercisesFromDOM();
    if ((direction === 'up' && fromIndex === 0) || (direction === 'down' && fromIndex === currentExercises.length - 1)) {
        return;
    }
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    [currentExercises[fromIndex], currentExercises[toIndex]] = [currentExercises[toIndex], currentExercises[fromIndex]];
    currentExercises.forEach((ex, idx) => ex.order = idx);
    renderExercises(currentExercises);
}

function removeExercise(index) {
    if (confirm("确定要删除这个动作吗？")) {
        const currentExercises = getCurrentExercisesFromDOM();
        currentExercises.splice(index, 1);
        currentExercises.forEach((ex, idx) => ex.order = idx);
        renderExercises(currentExercises);
    }
}

function addNewExercise() {
    const newName = prompt("请输入新动作名称:");
    if (newName && newName.trim() !== "") {
        const currentExercises = getCurrentExercisesFromDOM();
        const newOrder = currentExercises.length;
        const newExercise = {
            name: newName.trim(),
            order: newOrder,
            sets: Array(5).fill(null).map(() => ({ weight: '', reps: '' })),
            notes: ''
        };
        currentExercises.push(newExercise);
        renderExercises(currentExercises);
    }
}

function getCurrentExercisesFromDOM() {
    const exercises = [];
    const exerciseElements = exercisesContainer.querySelectorAll('.exercise-item');

    exerciseElements.forEach((el, globalIndex) => {
        const name = el.querySelector('.exercise-name').textContent;
        const order = globalIndex;
        const sets = [];
        const notes = el.querySelector('.exercise-notes').value;

        const setInputs = el.querySelectorAll('.set-row input');
        for (let i = 0; i < setInputs.length; i += 2) {
            const weight = setInputs[i].value;
            const reps = setInputs[i + 1].value;
            sets.push({ weight: weight || '', reps: reps || '' });
        }

        exercises.push({
            name: name,
            order: order,
            sets: sets,
            notes: notes
        });
    });

    return exercises;
}

function saveWorkout() {
    const muscleGroup = currentMuscleGroupEl.textContent;
    const exercises = getCurrentExercisesFromDOM();
    const notes = ""; // We don't have a global note input in this version

    if (exercises.length === 0) {
        alert("至少需要有一个动作才能保存！");
        return;
    }

    // Validate that formal sets have both weight and reps filled
    for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        for (let j = 1; j < ex.sets.length; j++) { // Start from 1 to skip warmup
            const set = ex.sets[j];
            if (set.weight === '' || set.reps === '') {
                 alert(`请完成 "${ex.name}" 的第 ${j+1} 组 (重量/次数) 输入后再保存。`);
                 return;
            }
        }
    }

    const newLog = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        muscleGroup: muscleGroup,
        exercises: exercises,
        notes: notes
    };

    const logs = getLogs();
    logs.push(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

    alert("训练记录已保存！");
    showHomeScreen();
}

function showHistory() {
    const muscleGroup = currentMuscleGroupEl.textContent;
    const logs = getLogs().filter(log => log.muscleGroup === muscleGroup);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort descending by date

    historyListUl.innerHTML = '';
    logs.forEach((log, index) => {
        const li = document.createElement('li');
        li.textContent = `${log.date} (${log.exercises.length} 个动作)`;
        li.onclick = () => loadHistoryLog(log);
        historyListUl.appendChild(li);
    });

    historyScreen.classList.remove('hidden');
    exercisesContainer.style.display = 'none'; // Hide main workout view
}

function loadHistoryLog(log) {
    renderExercises(log.exercises);
    hideHistory();
}

function hideHistory() {
    historyScreen.classList.add('hidden');
    exercisesContainer.style.display = 'block'; // Show main workout view again
}

function getLogs() {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function getLastLogForMuscleGroup(muscleGroup) {
    const logs = getLogs().filter(log => log.muscleGroup === muscleGroup);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs.length > 0 ? logs[0] : null;
}

function showWorkoutScreen() {
    homeScreen.classList.remove('active');
    workoutScreen.classList.add('active');
}

function showHomeScreen() {
    workoutScreen.classList.remove('active');
    homeScreen.classList.add('active');
    historyScreen.classList.add('hidden'); // Ensure history is hidden when going back
    exercisesContainer.style.display = 'block'; // Ensure main view is shown
}