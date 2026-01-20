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
    { type: '热身组', weight: warmupWeight, reps: 12 },
    { type: '正式组1', weight: formalWeight, reps: 12 },
    { type: '正式组2', weight: formalWeight, reps: 12 },
    { type: '正式组3', weight: formalWeight, reps: 12 },
    { type: '正式组4', weight: formalWeight, reps: 12 }
  ];
}

const exerciseData = {
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

// 添加一个映射对象，将英文键映射到中文显示名
const bodyPartNameMap = {
  back: '背',
  chest: '胸',
  legs: '腿',
  shoulders: '肩',
  arms: '手臂'
};

function startWorkout(bodyPart) {
  document.getElementById('home-screen').classList.remove('active');
  document.getElementById('workout-screen').classList.add('active');

  const title = document.getElementById('workout-title');
  // 使用映射对象获取中文名称
  title.textContent = `${bodyPartNameMap[bodyPart] || bodyPart} 训练`;

  const list = document.getElementById('exercise-list');
  list.innerHTML = ''; // 清空现有内容

  const data = exerciseData[bodyPart];
  if (!data) return; // 如果找不到对应部位的数据，则退出

  data.forEach((exercise, index) => { // 获取当前动作的索引
    const item = document.createElement('li');
    item.className = 'exercise-item';

    // 创建动作头部，包含名称、上下箭头和删除按钮
    const header = document.createElement('div');
    header.className = 'exercise-header';

    // --- 关键修改开始：直接创建并添加按钮，避免 innerHTML 丢失事件 ---
    const nameSpan = document.createElement('span');
    nameSpan.className = 'exercise-name';
    nameSpan.textContent = exercise.name;

    const moveDiv = document.createElement('div');
    moveDiv.className = 'move-buttons';

    // 上移按钮 (如果不是第一个)
    const upButton = document.createElement('button');
    upButton.className = 'btn-secondary btn-move';
    upButton.textContent = '▲'; // 使用填充三角形上箭头
    // --- 关键修改：不再传递 index，而是绑定 this 到按钮本身 ---
    upButton.onclick = function() { moveExerciseUpByElement(this); }; // 使用 function 以便 this 指向按钮
    if (index === 0) upButton.disabled = true; // 第一个不能上移

    // 下移按钮 (如果不是最后一个)
    const downButton = document.createElement('button');
    downButton.className = 'btn-secondary btn-move';
    downButton.textContent = '▼'; // 使用填充三角形下箭头
    // --- 关键修改：不再传递 index，而是绑定 this 到按钮本身 ---
    downButton.onclick = function() { moveExerciseDownByElement(this); }; // 使用 function 以便 this 指向按钮
    if (index === data.length - 1) downButton.disabled = true; // 最后一个不能下移

    moveDiv.appendChild(upButton);
    moveDiv.appendChild(downButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = '删除'; // 设置按钮文字
    deleteButton.onclick = function() { confirmDeleteExercise(this); }; // 使用 function 以便 this 指向按钮

    header.appendChild(nameSpan);
    header.appendChild(moveDiv);
    header.appendChild(deleteButton);
    // --- 关键修改结束 ---

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
      weightInput.step = '0.5'; // 支持半公斤
      weightInput.className = 'weight-input';
      // width 在 CSS 中设置

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
      // width 在 CSS 中设置

      // 组备注输入
      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.placeholder = '备注';
      noteInput.className = 'short-note-input';
      // width 在 CSS 中设置

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
    });

    // 创建动作备注输入框
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = '动作备注';
    noteInput.className = 'note-input';
    noteInput.value = exercise.note || '';

    item.appendChild(noteInput);
    list.appendChild(item);
  });
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

// 移动动作上移 (保留旧函数名，但内部调用新逻辑)
function moveExerciseUp(fromIndex) {
    // 这个函数现在不应该被直接调用了，因为 index 可能不准。
    // 如果需要，可以保留，但建议只通过按钮触发。
    // console.warn("警告：moveExerciseUp 应该通过按钮事件触发。");
    // 此处可以留空或抛出错误
}

// 移动动作下移 (保留旧函数名，但内部调用新逻辑)
function moveExerciseDown(fromIndex) {
    // 这个函数现在不应该被直接调用了，因为 index 可能不准。
    // 如果需要，可以保留，但建议只通过按钮触发。
    // console.warn("警告：moveExerciseDown 应该通过按钮事件触发。");
    // 此处可以留空或抛出错误
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

    // 组备注输入
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = '备注';
    noteInput.className = 'short-note-input';

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

// 辅助函数：通过按钮元素获取其所在的动作项，再根据索引移动 (现在统一使用 ByElement 方式)
// function moveExerciseUpByElement(button) { ... } // 已定义在上方
// function moveExerciseDownByElement(button) { ... } // 已定义在上方


function saveWorkout() {
  alert('训练已保存！');
  // 这里可以添加保存到 localStorage 的逻辑
  // 示例：
  const workoutData = document.getElementById('exercise-list').innerHTML;
  localStorage.setItem('currentWorkout', workoutData);
  console.log('数据已保存到本地');
}

function goHome() {
  document.getElementById('workout-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');
  // 离开时不需要销毁任何实例，因为没有使用 SortableJS
}

function showHistory() {
  document.getElementById('history-modal').classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.add('hidden');
}