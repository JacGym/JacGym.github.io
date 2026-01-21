// app.js

function parseWeightRange(rangeStr) {
  // 处理 "空" -> 0
  rangeStr = rangeStr.replace(/\s/g, ''); // 去除空格
  if (rangeStr === '空') {
    return { warmup: 0, formal: 0 };
  }

  // 处理 "-23半" 这种情况 (假设格式是 "X-Y半")
  if (rangeStr.includes('-') && rangeStr.includes('半')) {
    const parts = rangeStr.split('-');
    if (parts.length >= 2) {
      const first = parseFloat(parts[0]);
      let second = parts[1].replace('半', '');
      if (second.endsWith('半')) { // 防止 "X半" 这种情况
         second = second.replace('半', '');
      }
      const secondNum = parseFloat(second);
      const formalValue = isNaN(secondNum) ? first : secondNum; // 如果解析失败，用first
      return { warmup: first, formal: formalValue };
    }
  }

  // 处理 "X半" 这种情况
  if (rangeStr.includes('半')) {
     const numStr = rangeStr.replace('半', '');
     const num = parseFloat(numStr);
     const formalValue = isNaN(num) ? 0 : num;
     return { warmup: formalValue, formal: formalValue };
  }

  // 处理带 "～" 或 "-" 的范围
  if (rangeStr.includes('～') || rangeStr.includes('-')) {
    const separator = rangeStr.includes('～') ? '～' : '-';
    const parts = rangeStr.split(separator).map(p => parseFloat(p));
    if (parts.length >= 2) {
      // 假设第一个是热身，第二个是正式组
      return { warmup: parts[0], formal: parts[1] };
    }
  }

  // 单一数值
  const singleValue = parseFloat(rangeStr);
  if (!isNaN(singleValue)) {
    return { warmup: singleValue, formal: singleValue };
  }

  // 解析失败，返回默认值
  console.warn(`无法解析重量: ${rangeStr}, 使用默认值 0`);
  return { warmup: 0, formal: 0 };
}

function createSets(warmupWeight, formalWeight) {
  return [
    { type: '热身组', weight: warmupWeight, reps: 12, note: '' },
    { type: '正式组1', weight: formalWeight, reps: 12, note: '' },
    { type: '正式组2', weight: formalWeight, reps: 12, note: '' },
    { type: '正式组3', weight: formalWeight, reps: 12, note: '' },
    { type: '正式组4', weight: formalWeight, reps: 12, note: '' }
  ];
}

// --- 修改：将 exerciseData 改为函数，便于重复调用 ---
function getInitialExerciseData() {
  return {
    back: [
      { raw: "25", name: '坐姿拉背', note: '' },
      { raw: "25", name: '坐姿单臂下拉', note: '' },
      { raw: "22.5-25", name: '坐姿双臂下拉', note: '' },
      { raw: "34", name: '坐姿划船', note: '' },
      { raw: "15", name: '单臂划船', note: '' }
    ].map(item => {
      const parsed = parseWeightRange(item.raw);
      return {
        name: item.name,
        sets: createSets(parsed.warmup, parsed.formal),
        note: item.note
      };
    }),
    chest: [
      { raw: "15", name: '史密斯卧推', note: '' },
      { raw: "7.5", name: '上斜杠铃卧推', note: '' },
      { raw: "22.5", name: '坐姿器械下斜', note: '' },
      { raw: "14", name: '史密斯夹胸', note: '' },
      { raw: "23～25", name: '蝴蝶机夹胸', note: '坐低，抓下把' },
      { raw: "23～25", name: '坐姿推胸', note: '偏下斜' }
    ].map(item => {
      const parsed = parseWeightRange(item.raw);
      return {
        name: item.name,
        sets: createSets(parsed.warmup, parsed.formal),
        note: item.note
      };
    }),
    legs: [
      { raw: "40", name: '深蹲', note: '' },
      { raw: "70", name: '倒蹬', note: '' },
      { raw: "6", name: '保加利亚蹲', note: '' },
      { raw: "18", name: '腿反举', note: '' }
    ].map(item => {
      const parsed = parseWeightRange(item.raw);
      return {
        name: item.name,
        sets: createSets(parsed.warmup, parsed.formal),
        note: item.note
      };
    }),
    shoulders: [
      { raw: "32～36", name: '龙门架绳索后束', note: '' },
      { raw: "32", name: '蝴蝶机后束', note: '' },
      { raw: "14～16", name: '站姿飞鸟', note: '' },
      { raw: "5～7.5", name: '坐姿飞鸟', note: '' },
      { raw: "12.5", name: '坐姿器械上推', note: '' }
    ].map(item => {
      const parsed = parseWeightRange(item.raw);
      return {
        name: item.name,
        sets: createSets(parsed.warmup, parsed.formal),
        note: item.note
      };
    }),
    arms: [
      { raw: "21-18-14", name: '颈后臂屈伸', note: '' }, // 注意: 规则未明确处理多值，这里取第一个和最后一个
      { raw: "7", name: '龙门架单臂三头', note: '' },
      { raw: "27-25", name: '三头直杆', note: '23带控制，握实' }, // 备注来自原始数据
      { raw: "空-2.5", name: '杠铃弯举', note: '' },
      { raw: "9", name: '二头单臂龙门架', note: '左手9+7到力竭' },
      { raw: "15～10", name: '曲杆杠铃弯举', note: '10kg为窄握' }
    ].map(item => {
      let parsed = { warmup: 0, formal: 0 }; // 默认值
      if (item.name === '颈后臂屈伸') {
        // 特殊处理 "21-18-14": 按照规则，取最小和最大
        const nums = [21, 18, 14];
        parsed = { warmup: Math.min(...nums), formal: Math.max(...nums) };
      } else if (item.name === '三头直杆') {
         // 特殊处理 "27-25": 按规则，warmup 27, formal 25
         parsed = parseWeightRange("27-25");
         // 注意：原始数据的备注是针对某个组的，这里放在动作备注里
         // item.note = "23带控制，握实"; // 这行其实已经由 map 传入了
      } else if (item.name === '曲杆杠铃弯举') {
         // 特殊处理 "15～10": 按规则，warmup 15, formal 10
         parsed = parseWeightRange("15～10");
      } else {
          parsed = parseWeightRange(item.raw);
      }
      return {
        name: item.name,
        sets: createSets(parsed.warmup, parsed.formal),
        note: item.note
      };
    })
  };
}

// 添加一个映射对象，将英文键映射到中文显示名
const bodyPartNameMap = {
  back: '背',
  chest: '胸',
  legs: '腿',
  shoulders: '肩',
  arms: '手臂'
};

// --- 新增：获取指定部位的历史记录 ---
function getWorkoutHistory(part) {
  const key = `workoutHistory_${part}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`获取 ${part} 历史记录失败:`, e);
    // 如果解析失败，返回空数组
    return [];
  }
  return []; // 如果没有找到，返回空数组
}

// --- 新增：保存指定部位的训练记录 ---
function saveWorkoutForPart(part, exerciseList) {
  const history = getWorkoutHistory(part);
  // 获取当前时间戳作为本次训练的唯一标识
  const timestamp = new Date().toISOString();
  // 创建一个新的记录对象，包含时间和数据
  const newRecord = {
    timestamp: timestamp,
    data: exerciseList // 这里是当前页面的 exerciseList DOM 元素，需要序列化
  };

  // 将新的记录添加到历史记录的开头
  history.unshift(newRecord);

  // 限制历史记录数量为3条
  if (history.length > 3) {
    history.splice(3); // 移除超出的记录
  }

  // 保存回 localStorage
  const key = `workoutHistory_${part}`;
  try {
    localStorage.setItem(key, JSON.stringify(history));
    console.log(`${part} 训练记录已保存`);
  } catch (e) {
    console.error(`保存 ${part} 训练记录失败:`, e);
  }
}

// --- 新增：加载指定部位的最后一次训练记录 ---
function loadLastWorkoutForPart(part) {
  const history = getWorkoutHistory(part);
  if (history.length > 0) {
    // 返回最新的记录
    return history[0].data;
  }
  return null; // 如果没有历史记录，返回 null
}

// --- 新增：序列化当前页面的训练数据 ---
function serializeCurrentWorkoutData() {
  const list = document.getElementById('exercise-list');
  const exercises = [];

  const items = list.querySelectorAll('.exercise-item');
  items.forEach(item => {
    const nameElement = item.querySelector('.exercise-name');
    const name = nameElement ? nameElement.textContent : '';
    const noteInput = item.querySelector('.note-input');
    const actionNote = noteInput ? noteInput.value : '';

    const sets = [];
    const setSections = item.querySelectorAll('.set-section');
    setSections.forEach(section => {
      const label = section.querySelector('.set-label').textContent;
      const weightInput = section.querySelector('.weight-input');
      const repsInput = section.querySelector('.reps-input');
      const noteInput = section.querySelector('.short-note-input');

      const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
      const reps = repsInput ? parseInt(repsInput.value) || 0 : 0;
      const setNote = noteInput ? noteInput.value : '';

      sets.push({
        type: label,
        weight: weight,
        reps: reps,
        note: setNote
      });
    });

    exercises.push({
      name: name,
      sets: sets,
      note: actionNote
    });
  });

  return exercises;
}

// --- 修改：反序列化并填充页面数据，同时添加 focus 全选逻辑 ---
function populateWorkoutFromData(data) {
  const list = document.getElementById('exercise-list');
  list.innerHTML = ''; // 清空现有内容

  data.forEach((exercise, index) => {
    const item = document.createElement('li');
    item.className = 'exercise-item';

    // 创建动作头部，包含名称、上下箭头和删除按钮
    const header = document.createElement('div');
    header.className = 'exercise-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'exercise-name';
    nameSpan.textContent = exercise.name;

    const moveDiv = document.createElement('div');
    moveDiv.className = 'move-buttons';

    // 上移按钮 (如果不是第一个)
    const upButton = document.createElement('button');
    upButton.className = 'btn-secondary btn-move';
    upButton.textContent = '▲';
    upButton.onclick = function() { moveExerciseUpByElement(this); };
    if (index === 0) upButton.disabled = true;

    // 下移按钮 (如果不是最后一个)
    const downButton = document.createElement('button');
    downButton.className = 'btn-secondary btn-move';
    downButton.textContent = '▼';
    downButton.onclick = function() { moveExerciseDownByElement(this); };
    if (index === data.length - 1) downButton.disabled = true;

    moveDiv.appendChild(upButton);
    moveDiv.appendChild(downButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = '删除';
    deleteButton.onclick = function() { confirmDeleteExercise(this); };

    header.appendChild(nameSpan);
    header.appendChild(moveDiv);
    header.appendChild(deleteButton);

    item.appendChild(header);

    // 创建每个组的容器
    exercise.sets.forEach(set => {
      const setSection = document.createElement('div');
      setSection.className = 'set-section';

      const label = document.createElement('div');
      label.className = 'set-label';
      label.textContent = set.type;

      const inputs = document.createElement('div');
      inputs.className = 'set-inputs';

      // 重量输入
      const weightLabel = document.createElement('label');
      weightLabel.className = 'input-label';
      weightLabel.textContent = '重量';

      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.value = set.weight;
      weightInput.step = '0.5';
      weightInput.className = 'weight-input';
      // --- 新增：添加 focus 全选逻辑 ---
      weightInput.addEventListener('focus', function() {
          // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
          setTimeout(() => {
              this.select();
          }, 0);
      });

      const kgLabel = document.createElement('label');
      kgLabel.className = 'input-label';
      kgLabel.textContent = 'kg';

      // 次数输入
      const repsLabel = document.createElement('label');
      repsLabel.className = 'input-label';
      repsLabel.textContent = '次数';

      const repsInput = document.createElement('input');
      repsInput.type = 'number';
      repsInput.value = set.reps;
      repsInput.className = 'reps-input';
      // --- 新增：添加 focus 全选逻辑 ---
      repsInput.addEventListener('focus', function() {
          // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
          setTimeout(() => {
              this.select();
          }, 0);
      });

      // 组备注输入
      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.value = set.note; // 设置初始值
      noteInput.placeholder = '备注';
      noteInput.className = 'short-note-input';
      // --- 新增：添加 focus 全选逻辑 ---
      noteInput.addEventListener('focus', function() {
          // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
          setTimeout(() => {
              this.select();
          }, 0);
      });

      inputs.appendChild(weightLabel);
      inputs.appendChild(weightInput);
      inputs.appendChild(kgLabel);
      const spacer = document.createElement('div');
      spacer.style.width = '8px';
      inputs.appendChild(spacer);
      inputs.appendChild(repsLabel);
      inputs.appendChild(repsInput);
      inputs.appendChild(noteInput);

      setSection.appendChild(label);
      setSection.appendChild(inputs);
      item.appendChild(setSection);
    });

    // 创建动作备注输入框
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = '动作备注';
    noteInput.className = 'note-input';
    noteInput.value = exercise.note || '';
    // --- 新增：添加 focus 全选逻辑 ---
    noteInput.addEventListener('focus', function() {
        // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
        setTimeout(() => {
            this.select();
        }, 0);
    });

    item.appendChild(noteInput);
    list.appendChild(item);
  });
  // 填充完成后，更新按钮状态
  updateMoveButtons();
}


function startWorkout(bodyPart) {
  document.getElementById('home-screen').classList.remove('active');
  document.getElementById('workout-screen').classList.add('active');

  const title = document.getElementById('workout-title');
  title.textContent = `${bodyPartNameMap[bodyPart] || bodyPart} 训练`;

  // --- 修改：检查是否有历史记录，如果有则加载 ---
  const lastSavedData = loadLastWorkoutForPart(bodyPart);
  if (lastSavedData) {
    console.log(`加载 ${bodyPart} 的上次训练记录`);
    populateWorkoutFromData(lastSavedData);
  } else {
    // 如果没有历史记录，则使用初始数据
    console.log(`加载 ${bodyPart} 的初始数据`);
    const initialData = getInitialExerciseData()[bodyPart];
    if (!initialData) return; // 如果找不到对应部位的数据，则退出

    populateWorkoutFromData(initialData);
  }
}


// --- 修正函数：通过按钮元素获取其所在的动作项，再根据当前 DOM 位置移动 ---
function moveExerciseUpByElement(button) {
    const itemToMove = button.closest('.exercise-item'); // 获取按钮所在的 <li> 元素
    const list = document.getElementById('exercise-list');
    const allItems = list.querySelectorAll('.exercise-item'); // 获取当前所有 <li> 元素的静态快照
    const currentIndex = Array.prototype.indexOf.call(allItems, itemToMove); // 计算当前元素的索引

    if (currentIndex <= 0) return; // 如果已经在顶部，无法上移

    const targetItem = allItems[currentIndex - 1]; // 获取前一个元素
    list.insertBefore(itemToMove, targetItem); // 将当前元素插入到前一个元素之前
    updateMoveButtons(); // 更新所有按钮状态
}

function moveExerciseDownByElement(button) {
    const itemToMove = button.closest('.exercise-item'); // 获取按钮所在的 <li> 元素
    const list = document.getElementById('exercise-list');
    const allItems = list.querySelectorAll('.exercise-item'); // 获取当前所有 <li> 元素的静态快照
    const currentIndex = Array.prototype.indexOf.call(allItems, itemToMove); // 计算当前元素的索引

    if (currentIndex >= allItems.length - 1) return; // 如果已经在底部，无法下移

    const targetItem = allItems[currentIndex + 1]; // 获取后一个元素
    // 将 itemToMove 插入到 targetItem 的 *下一个* 兄弟节点之前
    // 如果 targetItem 是最后一个，则 targetItem.nextSibling 为 null，insertBefore 会将其添加到末尾
    list.insertBefore(itemToMove, targetItem.nextSibling); // 将当前元素插入到后一个元素的后面
    updateMoveButtons(); // 更新所有按钮状态
}

// 更新所有上下箭头按钮的禁用状态
function updateMoveButtons() {
    const list = document.getElementById('exercise-list');
    const items = list.querySelectorAll('.exercise-item'); // 使用 querySelectorAll 获取静态快照

    items.forEach((item, index) => {
        const upBtn = item.querySelector('.btn-move:nth-child(1)'); // 选择第一个 .btn-move
        const downBtn = item.querySelector('.btn-move:nth-child(2)'); // 选择第二个 .btn-move

        if (upBtn) {
            upBtn.disabled = (index === 0);
        }
        if (downBtn) {
            downBtn.disabled = (index === items.length - 1);
        }
    });
}


function confirmDeleteExercise(button) {
    const exerciseItem = button.closest('.exercise-item');
    const exerciseName = exerciseItem.querySelector('.exercise-name').textContent;

    // 使用原生 confirm 弹窗
    const isConfirmed = confirm(`确定要删除 "${exerciseName}" 吗？此操作不可撤销。`);

    if (isConfirmed) {
        exerciseItem.remove();
        // 删除后也需要更新按钮状态
        updateMoveButtons();
    }
    // 如果用户点击取消，则不执行任何操作
}

function addExercise() {
  // 1. 弹出 prompt 让用户输入新动作名称
  const newExerciseName = prompt("请输入新动作的名称:");
  
  // 检查用户是否点击了取消或输入为空
  if (newExerciseName === null || newExerciseName.trim() === "") {
      // 用户取消或输入无效，不进行任何操作
      return;
  }

  // 2. 创建新的动作项
  const list = document.getElementById('exercise-list');
  const item = document.createElement('li');
  item.className = 'exercise-item';

  // 动作头部，包含名称、上下箭头和删除按钮
  const header = document.createElement('div');
  header.className = 'exercise-header';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'exercise-name';
  nameSpan.textContent = newExerciseName;

  const moveDiv = document.createElement('div');
  moveDiv.className = 'move-buttons';

  // 初始时，由于是新增的，它会是最后一个，所以下移按钮应被禁用
  // 但我们需要先创建 DOM，再更新所有按钮状态
  const upButton = document.createElement('button');
  upButton.className = 'btn-secondary btn-move';
  upButton.textContent = '▲'; // 使用填充三角形上箭头
  upButton.onclick = function() { moveExerciseUpByElement(this); }; // 使用 function 以便 this 指向按钮
  upButton.disabled = true; // 初始禁用，因为是第一个

  const downButton = document.createElement('button');
  downButton.className = 'btn-secondary btn-move';
  downButton.textContent = '▼'; // 使用填充三角形下箭头
  downButton.onclick = function() { moveExerciseDownByElement(this); }; // 使用 function 以便 this 指向按钮
  // 初始不禁用，因为后面可能还有别的动作

  moveDiv.appendChild(upButton);
  moveDiv.appendChild(downButton);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  deleteButton.textContent = '删除';
  deleteButton.onclick = function() { confirmDeleteExercise(this); }; // 使用 function 以便 this 指向按钮

  header.appendChild(nameSpan);
  header.appendChild(moveDiv);
  header.appendChild(deleteButton);

  item.appendChild(header);

  // 添加 5 个组（1 热身 + 4 正式）
  for (let i = 0; i < 5; i++) {
    const setSection = document.createElement('div');
    setSection.className = 'set-section';

    const label = document.createElement('div');
    label.className = 'set-label';
    label.textContent = i === 0 ? '热身组' : `正式组${i}`;

    const inputs = document.createElement('div');
    inputs.className = 'set-inputs';

    // 重量输入
    const weightLabel = document.createElement('label');
    weightLabel.className = 'input-label';
    weightLabel.textContent = '重量';

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.value = '';
    weightInput.step = '0.5';
    weightInput.className = 'weight-input';
    // --- 新增：为新增的输入框也添加 focus 全选逻辑 ---
    weightInput.addEventListener('focus', function() {
        // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
        setTimeout(() => {
            this.select();
        }, 0);
    });

    const kgLabel = document.createElement('label');
    kgLabel.className = 'input-label';
    kgLabel.textContent = 'kg';

    // 次数输入
    const repsLabel = document.createElement('label');
    repsLabel.className = 'input-label';
    repsLabel.textContent = '次数';

    const repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.value = '12';
    repsInput.className = 'reps-input';
    // --- 新增：为新增的输入框也添加 focus 全选逻辑 ---
    repsInput.addEventListener('focus', function() {
        // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
        setTimeout(() => {
            this.select();
        }, 0);
    });

    // 组备注输入
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = '备注';
    noteInput.className = 'short-note-input';
    // --- 新增：为新增的输入框也添加 focus 全选逻辑 ---
    noteInput.addEventListener('focus', function() {
        // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
        setTimeout(() => {
            this.select();
        }, 0);
    });

    inputs.appendChild(weightLabel);
    inputs.appendChild(weightInput);
    inputs.appendChild(kgLabel);
    // 在 'kg' 后面添加一个元素来制造间隙
    const spacer = document.createElement('div');
    spacer.style.width = '8px'; // 设置间隙宽度
    inputs.appendChild(spacer);
    inputs.appendChild(repsLabel);
    inputs.appendChild(repsInput);
    inputs.appendChild(noteInput);

    setSection.appendChild(label);
    setSection.appendChild(inputs);
    item.appendChild(setSection);
  }

  // 动作备注输入框
  const actionNoteInput = document.createElement('input');
  actionNoteInput.type = 'text';
  actionNoteInput.placeholder = '动作备注';
  actionNoteInput.className = 'note-input';
  // --- 新增：为新增的输入框也添加 focus 全选逻辑 ---
  actionNoteInput.addEventListener('focus', function() {
      // 使用 setTimeout 确保在下一事件循环执行，以兼容某些浏览器行为
      setTimeout(() => {
          this.select();
      }, 0);
  });

  item.appendChild(actionNoteInput);
  list.appendChild(item);

  // 3. 添加完后，更新所有按钮状态
  updateMoveButtons();

  // 4. **重要**：刚添加的动作现在是最后一个，需要重新启用它的上移按钮
  // 获取最新添加的项目（即最后一个）
  const lastItem = list.lastElementChild;
  const lastUpBtn = lastItem.querySelector('.btn-move:nth-child(1)');
  if (lastUpBtn) {
      lastUpBtn.disabled = false; // 新增的动作可以向上移动了
  }
}

function saveWorkout() {
  // --- 修改：获取当前页面的实际数据 ---
  const currentWorkoutData = serializeCurrentWorkoutData();
  // 获取当前训练部位 (需要从当前页面状态获取，例如从标题)
  const titleText = document.getElementById('workout-title').textContent;
  // 通过映射反向查找对应的 bodyPart 键
  let currentBodyPart = null;
  for (const [key, value] of Object.entries(bodyPartNameMap)) {
    if (titleText.startsWith(value)) { // 检查标题是否以该部位名称开头
        currentBodyPart = key;
        break;
    }
  }

  if (currentBodyPart) {
      // 保存到对应部位的历史记录
      saveWorkoutForPart(currentBodyPart, currentWorkoutData);
      alert('本次训练已保存！');
  } else {
      console.error('无法确定当前训练部位，保存失败。');
      alert('保存失败，无法确定训练部位。');
  }
}

function goHome() {
  document.getElementById('workout-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');
  // 离开时不需要销毁任何实例，因为没有使用 SortableJS
}

// --- 修改：展示历史记录 ---
function showHistory() {
  // 这里可以展示所有部位的历史记录，或者跳转到一个专门的页面
  // 为了简化，我们先展示一个包含所有部位历史的模态框
  const modal = document.getElementById('history-modal');
  const historyList = modal.querySelector('.history-list');
  historyList.innerHTML = ''; // 清空现有列表

  // 遍历所有部位
  for (const part in bodyPartNameMap) {
    const partHistory = getWorkoutHistory(part);
    if (partHistory.length > 0) {
      // 为每个部位添加一个分组标题
      const partHeader = document.createElement('li');
      partHeader.className = 'history-item';
      partHeader.style.fontWeight = 'bold';
      partHeader.style.borderTop = '1px solid #ccc';
      partHeader.style.marginTop = '10px';
      partHeader.textContent = `${bodyPartNameMap[part]} (${part})`;
      historyList.appendChild(partHeader);

      // 添加该部位的历史记录
      partHistory.forEach(record => {
        const li = document.createElement('li');
        li.className = 'history-item';
        // 格式化时间戳为可读格式 (例如: YYYY-MM-DD HH:mm:ss)
        const date = new Date(record.timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        li.textContent = `${date} - ${bodyPartNameMap[part]} 训练`;
        // 可选：添加点击加载该次记录的功能
        // li.onclick = () => {
        //     populateWorkoutFromData(record.data);
        //     closeHistoryModal();
        //     // 可能需要更新标题等状态
        // };
        historyList.appendChild(li);
      });
    }
  }

  // 如果没有任何历史记录
  if (historyList.children.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'history-item';
    emptyLi.textContent = '暂无历史记录';
    historyList.appendChild(emptyLi);
  }

  modal.classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.add('hidden');
}