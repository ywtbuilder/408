// State variables
let queueMode = false; // false = Without Dummy Head, true = With Dummy Head
let nodes = []; // Array of node objects: { id, value, isDummy }
let pPointer = null; // ID of the tail node pointed to by p
let tempPointers = {}; // Map of { label: nodeId } (e.g. { q: 'node-1', r: 'node-2' })
let activeLines = []; // Active connection lines to highlight: array of { fromId, toId }
let activeNodes = []; // Nodes to highlight

// Action and Stepping
let currentAction = 'idle'; // 'idle', 'enqueue', 'dequeue'
let currentStepIndex = -1;
let steps = [];
let isPlaying = false;
let playTimer = null;
let animSpeed = 1500; // ms per step
let nodeIdCounter = 0;
let actionValue = 10; // default initial input value

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const nodesContainer = document.getElementById('nodes-container');
const pointerContainer = document.getElementById('pointer-labels-container');
const svgOverlay = document.getElementById('svg-overlay');
const codeContainer = document.getElementById('code-container');
const stepExplanation = document.getElementById('step-explanation');
const queueStatusText = document.getElementById('queue-status-text');
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const sliderSpeed = document.getElementById('slider-speed');
const inputVal = document.getElementById('input-val');
const activeOpLabel = document.getElementById('active-op-label');

// Initialize
window.addEventListener('load', () => {
  resetQueue();

  // Event listener for speed slider
  sliderSpeed.addEventListener('input', (e) => {
    animSpeed = parseInt(e.target.value);
    if (isPlaying) {
      pause();
      play();
    }
  });

  // Track resizing to update SVG links
  window.addEventListener('resize', () => {
    renderQueue();
  });
});

// Setup default initial queue
function resetQueue() {
  stopSimulation();
  nodes = [];
  nodeIdCounter = 0;

  if (queueMode) {
    // With Dummy Head: create dummy head node
    const dummyId = createNodeId();
    nodes.push({ id: dummyId, value: '头结点', isDummy: true });
    pPointer = dummyId; // Empty queue with dummy head: p points to dummy head

    // Add two elements initially
    const n1 = { id: createNodeId(), value: 10, isDummy: false };
    const n2 = { id: createNodeId(), value: 20, isDummy: false };
    nodes.push(n1, n2);
    pPointer = n2.id;
  } else {
    // Without Dummy Head: add three elements initially
    const n1 = { id: createNodeId(), value: 10, isDummy: false };
    const n2 = { id: createNodeId(), value: 20, isDummy: false };
    const n3 = { id: createNodeId(), value: 30, isDummy: false };
    nodes.push(n1, n2, n3);
    pPointer = n3.id;
  }

  tempPointers = {};
  activeLines = [];
  activeNodes = [];
  inputVal.value = 30;
  updateStatusText();
  renderQueue();
  loadCodePanelDefault();
  addLog('队列已重置。', 'info');
}

function clearAll() {
  stopSimulation();
  nodes = [];
  pPointer = null;
  tempPointers = {};
  activeLines = [];
  activeNodes = [];

  if (queueMode) {
    const dummyId = createNodeId();
    nodes.push({ id: dummyId, value: '头结点', isDummy: true });
    pPointer = dummyId;
  }

  updateStatusText();
  renderQueue();
  loadCodePanelDefault();
  addLog('队列已清空。', 'info');
}

function createNodeId() {
  nodeIdCounter++;
  return `node-${nodeIdCounter}`;
}

// Set mode (With or Without Dummy Head)
function setMode(hasDummy) {
  if (queueMode === hasDummy) return;
  queueMode = hasDummy;

  document.getElementById('btn-mode-no-dummy').classList.toggle('active', !hasDummy);
  document.getElementById('btn-mode-dummy').classList.toggle('active', hasDummy);

  addLog(`切换为: ${hasDummy ? '带头结点' : '不带头结点'}的循环链表`, 'info');
  resetQueue();
}

// Load C++ code representation depending on mode and action
function populateCodePanel(actionType) {
  const panel = getCodePanelContent(actionType);
  if (!panel) return;

  codeContainer.innerHTML = '';
  appendExamQuestion(panel.question);
  appendExamSection('（1）算法思想', panel.thoughts, 'text');
  appendExamSection('（2）数据结构定义', getTypeDefinitionLines(), 'code');
  appendExamSection('（3）算法实现', panel.codeLines, 'code', true);
  appendExamSection('（4）复杂度分析', panel.complexity, 'text');
}

function getCodePanelContent(actionType) {
  if (actionType === 'enqueue') {
    if (!queueMode) {
      return {
        question: '题目：用尾指针 p 表示不带头结点的循环链表队列，写出入队算法。',
        thoughts: [
          'p 指向队尾，队头就是 p->next；空队列用 p == nullptr 表示。',
          '先建立新结点 q。若队空，让 q 自己指向自己，再令 p 指向 q。',
          '若队列非空，先用 r 保存原队头，再把 p->next 改为 q，q->next 接回 r，最后更新尾指针 p。'
        ],
        codeLines: [
          `void Enqueue(LinkList &p, ElemType x) {`,
          `    LNode* q = new LNode;`,
          `    q->data = x;`,
          `    if (p == nullptr) {`,
          `        q->next = q;`,
          `        p = q;`,
          `    } else {`,
          `        LNode* r = p->next;`,
          `        p->next = q;`,
          `        q->next = r;`,
          `        p = q;`,
          `    }`,
          `}`
        ],
        complexity: [
          '时间复杂度：O(1)，只修改常数个指针。',
          '空间复杂度：O(1)，除新结点外只使用常数个辅助指针。'
        ]
      };
    } else {
      return {
        question: '题目：用尾指针 p 表示带头结点的循环链表队列，写出入队算法。',
        thoughts: [
          '带头结点时，空队列和非空队列都满足 p->next 指向头结点。',
          '先申请新结点 q，并用 r 保存头结点地址，避免改指针时丢失循环入口。',
          '把原队尾接到 q，再让 q 接回头结点，最后令 p 指向新的队尾 q。'
        ],
        codeLines: [
          `void Enqueue(LinkList &p, ElemType x) {`,
          `    LNode* q = new LNode;`,
          `    q->data = x;`,
          `    LNode* r = p->next;  // r 指向头结点`,
          `    p->next = q;`,
          `    q->next = r;`,
          `    p = q;`,
          `}`
        ],
        complexity: [
          '时间复杂度：O(1)，无需遍历链表。',
          '空间复杂度：O(1)，除新结点外只使用常数个辅助指针。'
        ]
      };
    }
  } else if (actionType === 'dequeue') {
    if (!queueMode) {
      return {
        question: '题目：用尾指针 p 表示不带头结点的循环链表队列，写出出队算法。',
        thoughts: [
          'p 为空表示队列为空；非空时，队头结点是 p->next。',
          '用 t 指向队头。若 t == p，说明只有一个结点，删除后尾指针置空。',
          '若有多个结点，令 p->next 跳过 t 指向 t->next，最后释放 t。'
        ],
        codeLines: [
          `void Dequeue(LinkList &p) {`,
          `    if (p == nullptr) return; // 队列为空`,
          `    LNode* t = p->next;        // t 指向队头元素`,
          `    if (t == p) {             // 队列中只有一个结点`,
          `        p = nullptr;`,
          `    } else {`,
          `        p->next = t->next;    // 跨过 t`,
          `    }`,
          `    delete t;                 // 释放内存`,
          `}`
        ],
        complexity: [
          '时间复杂度：O(1)，直接通过尾指针找到队头。',
          '空间复杂度：O(1)，只使用一个临时指针 t。'
        ]
      };
    } else {
      return {
        question: '题目：用尾指针 p 表示带头结点的循环链表队列，写出出队算法。',
        thoughts: [
          'p->next 是头结点 head；若 head->next == head，说明队列为空。',
          '非空时，真正的队头元素是 head->next，用 t 保存后由 head->next 跨过它。',
          '若 t 同时也是队尾，删除后尾指针 p 应重新指向头结点。'
        ],
        codeLines: [
          `void Dequeue(LinkList &p) {`,
          `    LNode* head = p->next;       // head 指向头结点`,
          `    if (head->next == head) {   // 队列为空`,
          `        return;`,
          `    }`,
          `    LNode* t = head->next;       // t 指向队头元素`,
          `    head->next = t->next;       // 头结点跨过 t 指向下一个`,
          `    if (t == p) {               // 如果删掉的是队尾`,
          `        p = head;               // 尾指针重新指向头结点`,
          `    }`,
          `    delete t;                   // 释放内存`,
          `}`
        ],
        complexity: [
          '时间复杂度：O(1)，头结点和尾指针可直接定位队头。',
          '空间复杂度：O(1)，只使用 head、t 两个辅助指针。'
        ]
      };
    }
  }

  return null;
}

function getTypeDefinitionLines() {
  return [
    `typedef struct LNode {`,
    `    ElemType data;`,
    `    struct LNode *next;`,
    `} LNode, *LinkList;`
  ];
}

function appendExamQuestion(question) {
  const questionDiv = document.createElement('div');
  questionDiv.className = 'exam-question';
  questionDiv.innerText = question;
  codeContainer.appendChild(questionDiv);
}

function appendExamSection(title, lines, type, trackCode = false) {
  const section = document.createElement('section');
  section.className = 'exam-section';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'exam-section-title';
  titleDiv.innerText = title;
  section.appendChild(titleDiv);

  if (type === 'code') {
    const block = document.createElement('div');
    block.className = 'exam-code-block';
    lines.forEach((line, idx) => {
      block.appendChild(createCodeLine(line, idx, trackCode));
    });
    section.appendChild(block);
  } else {
    lines.forEach(line => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'exam-text-line';
      lineDiv.innerText = line;
      section.appendChild(lineDiv);
    });
  }

  codeContainer.appendChild(section);
}

function createCodeLine(line, idx, trackCode) {
  const lineDiv = document.createElement('div');
  lineDiv.className = `code-line notranslate${trackCode ? '' : ' code-line-static'}`;
  lineDiv.setAttribute('translate', 'no');
  if (trackCode) {
    lineDiv.id = `code-line-${idx}`;
  }

  const numSpan = document.createElement('span');
  numSpan.className = 'code-line-num';
  numSpan.innerText = idx + 1;

  const textSpan = document.createElement('span');
  textSpan.className = 'code-line-text';
  textSpan.innerHTML = highlightCPP(line);

  lineDiv.appendChild(numSpan);
  lineDiv.appendChild(textSpan);
  return lineDiv;
}

function loadCodePanelDefault() {
  activeOpLabel.innerText = '就绪';
  codeContainer.innerHTML = `
    <div style="color: var(--text-muted); font-style: italic; text-align: center; margin-top: 2rem;">
      请点击 [入队] 或 [出队] 按钮开始算法步骤追踪
    </div>
  `;
}

function highlightCPP(line) {
  // Escape special HTML characters first to prevent DOM corruption
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const commentStart = escaped.indexOf('//');
  const codePart = commentStart === -1 ? escaped : escaped.slice(0, commentStart);
  const commentPart = commentStart === -1 ? '' : escaped.slice(commentStart);

  return highlightCPPCode(codePart) +
    (commentPart ? `<span class="comment">${commentPart}</span>` : '');
}

function highlightCPPCode(text) {
  return text
    .replace(/\b(typedef|struct|void|delete|new|nullptr|return|if|else)\b/g, '<span class="keyword">$1</span>')
    .replace(/\b(LNode|LinkList|ElemType)\b/g, '<span class="type">$1</span>');
}

function highlightCodeLine(lineIdx) {
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
  const activeLine = document.getElementById(`code-line-${lineIdx}`);
  if (activeLine) {
    activeLine.classList.add('active');
    activeLine.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Visual layout mathematics
function renderQueue() {
  nodesContainer.innerHTML = '';
  pointerContainer.innerHTML = '';

  // Clear SVG lines
  const paths = svgOverlay.querySelectorAll('path:not(defs path)');
  paths.forEach(p => p.remove());

  // Clear SVG lines
  const lines = svgOverlay.querySelectorAll('line');
  lines.forEach(l => l.remove());

  const w = canvasContainer.clientWidth || 800;
  const h = canvasContainer.clientHeight || 500;

  const centerY = h / 2 - 15;
  const spacing = 70; // Horizontal gap between nodes

  // Filter nodes currently in the main structure
  const circularNodes = nodes.filter(n => n.id !== 'temp-q');
  const N = circularNodes.length;

  // 1. Calculate positions for horizontal nodes
  const totalWidth = N * 100 + (N - 1) * spacing;
  const startX = (w - totalWidth) / 2;

  circularNodes.forEach((node, idx) => {
    node.x = startX + idx * (100 + spacing);
    node.y = centerY;
  });

  // 2. Position new node q if it exists (floats above the list)
  const newNodeQ = nodes.find(n => n.id === 'temp-q');
  if (newNodeQ) {
    newNodeQ.x = w / 2 - 50;
    newNodeQ.y = centerY - 120; // Float above
  }

  // 3. Render node elements in DOM
  nodes.forEach(node => {
    const nodeDiv = document.createElement('div');
    nodeDiv.id = node.id;
    nodeDiv.className = 'node notranslate';
    nodeDiv.setAttribute('translate', 'no');
    if (node.isDummy) nodeDiv.classList.add('dummy-head');
    if (node.id === 'temp-q') nodeDiv.classList.add('new-node');
    if (activeNodes.includes(node.id)) nodeDiv.classList.add('highlighted');

    nodeDiv.style.left = `${node.x}px`;
    nodeDiv.style.top = `${node.y}px`;

    const dataDiv = document.createElement('div');
    dataDiv.className = 'node-data';
    dataDiv.innerText = node.value;

    const nextDiv = document.createElement('div');
    nextDiv.className = 'node-next';

    nodeDiv.appendChild(dataDiv);
    nodeDiv.appendChild(nextDiv);
    nodesContainer.appendChild(nodeDiv);
  });

  // 4. Render pointer labels (p, q, r, t)
  renderPointerLabel('p', pPointer, 'p', 'down'); // tail pointer points UP, label is below

  Object.keys(tempPointers).forEach(label => {
    const targetId = tempPointers[label];
    if (targetId) {
      let dir = 'up'; // default above node, pointing DOWN
      if (label === 'head') dir = 'down'; // head label is below, pointing UP
      renderPointerLabel(label, targetId, label, dir);
    }
  });

  // 5. Render connection lines (arrows) in SVG
  if (N > 0) {
    circularNodes.forEach((node, idx) => {
      // Find where next should go
      let nextNode = null;
      if (N === 1) {
        nextNode = node;
      } else {
        nextNode = circularNodes[(idx + 1) % N];
      }

      // Check if this connection is currently intercepted/modified by an animation step
      const intercept = activeLines.find(line => line.fromId === node.id);
      if (intercept) {
        if (intercept.toId) {
          const targetNode = nodes.find(n => n.id === intercept.toId);
          if (targetNode) {
            drawArrow(node, targetNode, true, true); // Active path
          }
        }
      } else {
        // Standard queue link. Loopback (index N-1 to 0) needs curve if N > 1, or self loop
        const isLoopback = (N > 1 && idx === N - 1);
        const isSelfLoop = (N === 1);
        drawArrow(node, nextNode, isLoopback || isSelfLoop, false);
      }
    });
  }

  // Also draw temporary lines if specified (e.g. from q to another node)
  activeLines.forEach(line => {
    if (line.fromId === 'temp-q') {
      const fromNode = nodes.find(n => n.id === 'temp-q');
      const toNode = nodes.find(n => n.id === line.toId);
      if (fromNode && toNode) {
        drawArrow(fromNode, toNode, false, true);
      }
    }
  });
}

// Generate pointer label elements with straight vertical arrows
function renderPointerLabel(label, targetId, cssClass, direction) {
  const targetNode = nodes.find(n => n.id === targetId);
  if (!targetNode) return;

  const labelDiv = document.createElement('div');
  labelDiv.className = `pointer-label ${cssClass} notranslate`;
  labelDiv.setAttribute('translate', 'no');
  labelDiv.innerText = label;

  const tcx = targetNode.x + 50; // horizontal center of target node
  const lx = tcx - 16;           // center the 32px-wide label badge
  let ly = 0;

  if (direction === 'down') {
    // Label is BELOW the node, pointing UP.
    ly = targetNode.y + 85;

    // Draw SVG vertical line from top of label to bottom of node
    drawPointerLine(tcx, ly, tcx, targetNode.y + 48, label, 'up');
  } else {
    // Label is ABOVE the node, pointing DOWN.
    ly = targetNode.y - 55;

    // Draw SVG vertical line from bottom of label to top of node
    drawPointerLine(tcx, ly + 24, tcx, targetNode.y, label, 'down');
  }

  labelDiv.style.left = `${lx}px`;
  labelDiv.style.top = `${ly}px`;

  pointerContainer.appendChild(labelDiv);
}

// Helper to draw vertical pointer lines with color-matched arrowheads
function drawPointerLine(x1, y1, x2, y2, label, arrowDirection) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);

  // Calculate end offset for marker visibility
  let targetY = y2;
  if (arrowDirection === 'up') {
    targetY = y2 + 6; // stop slightly below the bottom edge so arrowhead doesn't clip
  } else {
    targetY = y2 - 6; // stop slightly above the top edge
  }

  line.setAttribute('x2', x2);
  line.setAttribute('y2', targetY);
  line.setAttribute('class', `pointer-line ${label}`);

  // Set arrowhead marker matching the pointer
  line.setAttribute('marker-end', `url(#arrow-${label})`);
  svgOverlay.appendChild(line);
}

// Draw a beautiful curved SVG arrow between nodes
function drawArrow(fromNode, toNode, isCurved, isActive) {
  // Start point from next field of fromNode (approx 80px horizontally inside the 100px node)
  const sx = fromNode.x + 80;
  const sy = fromNode.y + 24;

  let pathD = '';
  let markerId = isActive ? 'arrow-active' : 'arrow';

  const isSelfLoop = (fromNode.id === toNode.id);

  if (isSelfLoop) {
    // Single node loops back above itself and lands on the top edge to avoid covering the value.
    const startX = fromNode.x + 80;
    const startY = fromNode.y + 18;
    const endX = fromNode.x + 20;
    const endY = fromNode.y;
    const archTop = Math.max(18, fromNode.y - 92);

    pathD = `M ${startX} ${startY} C ${fromNode.x + 132} ${archTop}, ${fromNode.x - 34} ${archTop}, ${endX} ${endY}`;
  } else if (isCurved) {
    // Loop back from tail to head (e.g. from right to left)
    const ex = toNode.x + 22;
    const ey = toNode.y;
    const archTop = Math.max(22, Math.min(fromNode.y, toNode.y) - 105);
    const cp1x = sx + 10;
    const cp2x = ex - 10;

    pathD = `M ${sx} ${sy} C ${cp1x} ${archTop}, ${cp2x} ${archTop}, ${ex} ${ey}`;
  } else {
    // Normal sequential arrow pointing to the right or to a floating node
    const ex = toNode.x;
    const ey = toNode.y + 24;

    // If toNode is temp-q (floating above), point to its bottom center
    if (toNode.id === 'temp-q') {
      pathD = `M ${sx} ${sy} L ${toNode.x + 50} ${toNode.y + 48}`;
    } else {
      // Perfectly horizontal straight line
      pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
    }
  }

  // Create path element
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('class', `arrow-path ${isActive ? 'active' : ''}`);
  path.setAttribute('marker-end', `url(#${markerId})`);
  svgOverlay.appendChild(path);
}

// Log management (displays in step explanation)
function addLog(message, type = 'info') {
  if (stepExplanation) {
    stepExplanation.innerHTML = message;
  }
}

function clearLogs() {
  if (stepExplanation) {
    stepExplanation.innerHTML = '系统就绪';
  }
}

function updateStatusText() {
  // Count elements
  let count = nodes.filter(n => !n.isDummy && n.id !== 'temp-q').length;
  let text = `队列当前状态: ${count === 0 ? '空队列' : `有 ${count} 个元素`}`;
  if (queueMode) {
    text += ' (带头结点)';
  } else {
    text += ' (不带头结点)';
  }
  queueStatusText.innerText = text;
}

// Playback State Machine Controls
function setSimulationState(action, stepList) {
  stopSimulation();
  currentAction = action;
  steps = stepList;
  currentStepIndex = 0;
  isPlaying = false;

  populateCodePanel(action);
  activeOpLabel.innerText = action === 'enqueue' ? '入队中...' : '出队中...';

  btnPrev.disabled = true;
  btnNext.disabled = false;

  // Run step 0
  runStep(0);
}

function stopSimulation() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  isPlaying = false;
  btnPlay.innerText = '▶';
  btnPrev.disabled = true;
  btnNext.disabled = true;

  // Clean up any remaining animation temp-node structures
  nodes = nodes.filter(n => n.id !== 'temp-q');

  // Restore correct pointers
  if (currentAction !== 'idle') {
    currentAction = 'idle';
    activeLines = [];
    activeNodes = [];
    tempPointers = {};
    loadCodePanelDefault();
  }
}

function togglePlay() {
  if (currentAction === 'idle') {
    addLog('无正在进行的算法演示。请先点击 [入队] 或 [出队]。', 'warning');
    return;
  }

  if (isPlaying) {
    pause();
  } else {
    play();
  }
}

function play() {
  isPlaying = true;
  btnPlay.innerText = '⏸';

  if (currentStepIndex >= steps.length - 1) {
    // If ended, loop back to start
    currentStepIndex = -1;
  }

  nextStep();

  playTimer = setInterval(() => {
    if (currentStepIndex < steps.length - 1) {
      nextStep();
    } else {
      pause();
      addLog('演示自动播放结束。', 'info');
    }
  }, animSpeed);
}

function pause() {
  isPlaying = false;
  btnPlay.innerText = '▶';
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
}

function nextStep() {
  if (currentStepIndex < steps.length - 1) {
    currentStepIndex++;
    runStep(currentStepIndex);
  }
}

function prevStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    runStep(currentStepIndex);
  }
}

// Replays execution up to visual stepIndex
function runStep(stepIdx) {
  // Update controls
  btnPrev.disabled = (stepIdx === 0);
  btnNext.disabled = (stepIdx === steps.length - 1);

  // Execute action
  steps[stepIdx].action();

  // Update view
  highlightCodeLine(steps[stepIdx].codeLine);
  renderQueue();
  updateStatusText();

  // Log message
  addLog(`[步骤 ${stepIdx + 1}/${steps.length}] ${steps[stepIdx].log}`, 'step');
}

// ==========================================
// ALGORITHM 1: ENQUEUE (入队) DEMO BUILDER
// ==========================================
function startEnqueue() {
  const val = parseInt(inputVal.value);
  if (isNaN(val) || val < 0 || val > 99) {
    addLog('请输入 0 到 99 之间的有效整数。', 'warning');
    return;
  }

  // Increment input value for user convenience
  actionValue = val;
  inputVal.value = (val + 10) % 100;

  addLog(`开始入队演示：值 = <b>${actionValue}</b>`, 'info');

  const stepList = [];

  if (!queueMode) {
    // ---------------------------------
    // Mode: Without Dummy Head
    // ---------------------------------
    const isQueueEmpty = (pPointer === null);
    let newId = 'temp-q'; // ID of the allocated node

    // Step 1: void Enqueue(Node*& p, int x)
    stepList.push({
      codeLine: 0,
      log: `开始执行入队函数。插入数据 x = ${actionValue}。`,
      action: () => {
        // Reset state to initial before this enqueue
        resetStateBeforeAnimation();
      }
    });

    // Step 2: Node* q = new Node(x);
    stepList.push({
      codeLine: 1,
      log: `申请一个新结点 q，其数据域为 ${actionValue}，指针域为 nullptr。`,
      action: () => {
        resetStateBeforeAnimation();
        // Add new node q in staging area
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        tempPointers = { q: 'temp-q' };
        activeNodes = ['temp-q'];
        activeLines = [];
      }
    });

    // Step 3: if (p == nullptr) {
    stepList.push({
      codeLine: 2,
      log: `检查尾指针 p 是否为空。当前 p 为 ${isQueueEmpty ? 'nullptr (队列为空)' : '有效地址 (队列非空)'}。`,
      action: () => {
        resetStateBeforeAnimation();
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        tempPointers = { q: 'temp-q' };
        activeNodes = isQueueEmpty ? ['temp-q'] : ['temp-q', pPointer];
        activeLines = [];
      }
    });

    if (isQueueEmpty) {
      // Subpath: Queue is empty
      // Step 4: q->next = q;
      stepList.push({
        codeLine: 3,
        log: `因为队列为空，将新结点 q 的 next 指针指向自身，构成单结点循环。`,
        action: () => {
          resetStateBeforeAnimation();
          nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
          tempPointers = { q: 'temp-q' };
          activeNodes = ['temp-q'];
          // Arrow pointing to itself
          activeLines = [{ fromId: 'temp-q', toId: 'temp-q' }];
        }
      });

      // Step 5: p = q;
      stepList.push({
        codeLine: 4,
        log: `将尾指针 p 指向新加入的结点 q。现在 p 既是队尾也是队头。`,
        action: () => {
          resetStateBeforeAnimation();
          // Insert node permanently into circular list
          const finalId = createNodeId();
          nodes = [{ id: finalId, value: actionValue, isDummy: false }];
          pPointer = finalId;
          tempPointers = { q: finalId };
          activeNodes = [finalId];
          activeLines = []; // Standard rendering will loop this node automatically
        }
      });
    } else {
      // Subpath: Queue is NOT empty
      // Step 4: LNode* r = p->next;
      stepList.push({
        codeLine: 7,
        log: `队列非空，用辅助指针 r 指向当前的队头结点（即 p->next）。`,
        action: () => {
          resetStateBeforeAnimation();
          nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });

          // Current head node is p->next in circular array
          const headNode = getNextNodeInCircle(pPointer);
          tempPointers = { q: 'temp-q', r: headNode.id };
          activeNodes = ['temp-q', pPointer, headNode.id];
          activeLines = [];
        }
      });

      // Step 5: p->next = q;
      stepList.push({
        codeLine: 8,
        log: `修改队尾结点 p 的 next，使其指向新结点 q。暂时打破原来的环。`,
        action: () => {
          resetStateBeforeAnimation();
          nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
          const headNode = getNextNodeInCircle(pPointer);
          tempPointers = { q: 'temp-q', r: headNode.id };
          activeNodes = ['temp-q', pPointer];

          // Re-route p's line to temp-q instead of headNode
          activeLines = [{ fromId: pPointer, toId: 'temp-q' }];
        }
      });

      // Step 6: q->next = r;
      stepList.push({
        codeLine: 9,
        log: `将新节点 q 的 next 指向记录好的旧队头 r，让新结点成为队尾，且重新闭合循环环路。`,
        action: () => {
          resetStateBeforeAnimation();
          nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
          const headNode = getNextNodeInCircle(pPointer);
          tempPointers = { q: 'temp-q', r: headNode.id };
          activeNodes = ['temp-q', headNode.id];

          // Connect p -> q and q -> r
          activeLines = [
            { fromId: pPointer, toId: 'temp-q' },
            { fromId: 'temp-q', toId: headNode.id }
          ];
        }
      });

      // Step 7: p = q;
      stepList.push({
        codeLine: 10,
        log: `更新尾指针 p，使其移动并指向新加入的队尾结点 q。入队操作结束！`,
        action: () => {
          resetStateBeforeAnimation();
          // Integrate temp-q into nodes list, right after pPointer
          const pIndex = nodes.findIndex(n => n.id === pPointer);
          const finalId = createNodeId();
          const newNode = { id: finalId, value: actionValue, isDummy: false };

          // Insert after p
          nodes.splice(pIndex + 1, 0, newNode);
          pPointer = finalId;

          tempPointers = { q: finalId };
          activeNodes = [finalId];
          activeLines = []; // Clear custom lines, automatic rendering takes over
        }
      });
    }
  } else {
    // ---------------------------------
    // Mode: With Dummy Head
    // ---------------------------------
    // Step 1: void Enqueue(Node*& p, int x)
    stepList.push({
      codeLine: 0,
      log: `开始执行入队函数（带头结点模式）。插入数据 x = ${actionValue}。`,
      action: () => {
        resetStateBeforeAnimation();
      }
    });

    // Step 2: Node* q = new Node(x);
    stepList.push({
      codeLine: 1,
      log: `申请新结点 q，数据域设为 ${actionValue}，指针域为 nullptr。`,
      action: () => {
        resetStateBeforeAnimation();
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        tempPointers = { q: 'temp-q' };
        activeNodes = ['temp-q'];
        activeLines = [];
      }
    });

    // Step 3: Node* r = p->next;
    stepList.push({
      codeLine: 2,
      log: `用临时指针 r 记录当前的队头。这里 p->next 必定指向头结点（无论队列是否为空）。`,
      action: () => {
        resetStateBeforeAnimation();
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        const headNode = getNextNodeInCircle(pPointer); // In circular list, p->next is always dummy head
        tempPointers = { q: 'temp-q', r: headNode.id };
        activeNodes = ['temp-q', pPointer, headNode.id];
        activeLines = [];
      }
    });

    // Step 4: p->next = q;
    stepList.push({
      codeLine: 3,
      log: `将尾指针 p 指向的结点的 next 指向新结点 q。暂时切断指向头结点的回路。`,
      action: () => {
        resetStateBeforeAnimation();
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        const headNode = getNextNodeInCircle(pPointer);
        tempPointers = { q: 'temp-q', r: headNode.id };
        activeNodes = [pPointer, 'temp-q'];

        // p points to q
        activeLines = [{ fromId: pPointer, toId: 'temp-q' }];
      }
    });

    // Step 5: q->next = r;
    stepList.push({
      codeLine: 4,
      log: `将新结点 q 的 next 指针指向记录好的头结点 r，重新链接回循环链表。`,
      action: () => {
        resetStateBeforeAnimation();
        nodes.push({ id: 'temp-q', value: actionValue, isDummy: false });
        const headNode = getNextNodeInCircle(pPointer);
        tempPointers = { q: 'temp-q', r: headNode.id };
        activeNodes = ['temp-q', headNode.id];

        activeLines = [
          { fromId: pPointer, toId: 'temp-q' },
          { fromId: 'temp-q', toId: headNode.id }
        ];
      }
    });

    // Step 6: p = q;
    stepList.push({
      codeLine: 5,
      log: `更新尾指针 p 指向新入队的队尾结点 q。带头结点的入队完成，操作非常统一。`,
      action: () => {
        resetStateBeforeAnimation();
        // Insert node permanently into circular array
        const pIndex = nodes.findIndex(n => n.id === pPointer);
        const finalId = createNodeId();
        const newNode = { id: finalId, value: actionValue, isDummy: false };

        nodes.splice(pIndex + 1, 0, newNode);
        pPointer = finalId;

        tempPointers = { q: finalId };
        activeNodes = [finalId];
        activeLines = [];
      }
    });
  }

  setSimulationState('enqueue', stepList);
}

// ==========================================
// ALGORITHM 2: DEQUEUE (出队) DEMO BUILDER
// ==========================================
function startDequeue() {
  // Count current element nodes (excluding dummy head)
  const elementCount = nodes.filter(n => !n.isDummy).length;

  if (elementCount === 0) {
    addLog('队列已空，无法进行出队操作。', 'warning');
    return;
  }

  addLog('开始出队演示。', 'info');

  const stepList = [];

  if (!queueMode) {
    // ---------------------------------
    // Mode: Without Dummy Head
    // ---------------------------------
    const isSingleNode = (nodes.length === 1);

    // Step 1: void Dequeue(Node*& p)
    stepList.push({
      codeLine: 0,
      log: `开始执行出队操作。尾指针为 p。`,
      action: () => {
        resetStateBeforeAnimation();
      }
    });

    // Step 2: if (p == nullptr)
    stepList.push({
      codeLine: 1,
      log: `检查队列是否为空。当前尾指针 p 非空，向下执行。`,
      action: () => {
        resetStateBeforeAnimation();
        activeNodes = [pPointer];
      }
    });

    // Step 3: Node* t = p->next;
    stepList.push({
      codeLine: 2,
      log: `用临时指针 t 指向队头元素（即尾指针 p->next）。`,
      action: () => {
        resetStateBeforeAnimation();
        const headNode = getNextNodeInCircle(pPointer);
        tempPointers = { t: headNode.id };
        activeNodes = [headNode.id, pPointer];
      }
    });

    // Step 4: if (t == p)
    stepList.push({
      codeLine: 3,
      log: `检查队头元素 t 是否与尾指针 p 指向同一个结点（判断是否为唯一结点）。当前是${isSingleNode ? '唯一结点' : '多结点队列'}。`,
      action: () => {
        resetStateBeforeAnimation();
        const headNode = getNextNodeInCircle(pPointer);
        tempPointers = { t: headNode.id };
        activeNodes = [headNode.id, pPointer];
      }
    });

    if (isSingleNode) {
      // Step 5: p = nullptr;
      stepList.push({
        codeLine: 4,
        log: `仅有一个结点，出队后队列将空，因此先将尾指针 p 置为 nullptr。`,
        action: () => {
          resetStateBeforeAnimation();
          const headNode = getNextNodeInCircle(pPointer);
          pPointer = null; // Update p to null
          tempPointers = { t: headNode.id };
          activeNodes = [headNode.id];
        }
      });
    } else {
      // Step 5 (else): p->next = t->next;
      stepList.push({
        codeLine: 6,
        log: `将尾指结点的 next 指针指向队头结点的下一个结点 t->next，从而绕过并摘除 t。`,
        action: () => {
          resetStateBeforeAnimation();
          const headNode = getNextNodeInCircle(pPointer);
          const nextOfHead = getNextNodeInCircle(headNode.id);
          tempPointers = { t: headNode.id };
          activeNodes = [pPointer, headNode.id, nextOfHead.id];

          // Modify p's arrow to skip t and point to t->next
          activeLines = [{ fromId: pPointer, toId: nextOfHead.id }];
        }
      });
    }

    // Step 6: delete t;
    stepList.push({
      codeLine: 8,
      log: `释放摘除的队头结点 t 的内存空间，出队操作圆满完成！`,
      action: () => {
        resetStateBeforeAnimation();
        const headNode = getNextNodeInCircle(pPointer || ''); // Find the old head we are removing

        if (isSingleNode) {
          nodes = [];
          pPointer = null;
        } else {
          // Remove node from circular list
          nodes = nodes.filter(n => n.id !== headNode.id);
        }

        tempPointers = {};
        activeNodes = [];
        activeLines = [];
      }
    });
  } else {
    // ---------------------------------
    // Mode: With Dummy Head
    // ---------------------------------
    const headNode = nodes.find(n => n.isDummy);
    const isSingleElement = (nodes.length === 2); // Dummy Head + 1 Element

    // Step 1: void Dequeue(Node*& p)
    stepList.push({
      codeLine: 0,
      log: `开始执行出队操作（带头结点模式）。`,
      action: () => {
        resetStateBeforeAnimation();
      }
    });

    // Step 2: Node* head = p->next;
    stepList.push({
      codeLine: 1,
      log: `用 head 指针指向头结点（即 p->next）。`,
      action: () => {
        resetStateBeforeAnimation();
        tempPointers = { head: headNode.id };
        activeNodes = [headNode.id, pPointer];
      }
    });

    // Step 3: if (head->next == head)
    stepList.push({
      codeLine: 2,
      log: `检查头结点是否指向自身（即队列是否为空）。当前队列不为空，继续向下。`,
      action: () => {
        resetStateBeforeAnimation();
        tempPointers = { head: headNode.id };
        activeNodes = [headNode.id];
      }
    });

    // Step 4: Node* t = head->next;
    stepList.push({
      codeLine: 5,
      log: `用临时指针 t 指向真正的第一个元素结点（head->next）。`,
      action: () => {
        resetStateBeforeAnimation();
        const targetNode = getNextNodeInCircle(headNode.id);
        tempPointers = { head: headNode.id, t: targetNode.id };
        activeNodes = [headNode.id, targetNode.id];
      }
    });

    // Step 5: head->next = t->next;
    stepList.push({
      codeLine: 6,
      log: `修改头结点的 next 指针指向 t->next，从而绕过并摘除队头元素 t。`,
      action: () => {
        resetStateBeforeAnimation();
        const targetNode = getNextNodeInCircle(headNode.id);
        const nextOfTarget = getNextNodeInCircle(targetNode.id);
        tempPointers = { head: headNode.id, t: targetNode.id };
        activeNodes = [headNode.id, targetNode.id, nextOfTarget.id];

        // head's arrow re-routed to skip t and point to t->next
        activeLines = [{ fromId: headNode.id, toId: nextOfTarget.id }];
      }
    });

    // Step 6: if (t == p)
    stepList.push({
      codeLine: 7,
      log: `检查被删除结点 t 是否刚好是队尾（即尾指针指向的结点）。当前为${isSingleElement ? '是（队尾元素）' : '否（非尾元素）'}。`,
      action: () => {
        resetStateBeforeAnimation();
        const targetNode = getNextNodeInCircle(headNode.id);
        tempPointers = { head: headNode.id, t: targetNode.id };
        activeNodes = [targetNode.id, pPointer];
      }
    });

    if (isSingleElement) {
      // Step 7: p = head;
      stepList.push({
        codeLine: 8,
        log: `删除的是队尾元素，队列将变为空队，因此将尾指针 p 重新指回空队列的头结点 head。`,
        action: () => {
          resetStateBeforeAnimation();
          const targetNode = getNextNodeInCircle(headNode.id);
          pPointer = headNode.id; // p points back to dummy head
          tempPointers = { head: headNode.id, t: targetNode.id };
          activeNodes = [headNode.id, targetNode.id];
        }
      });
    }

    // Step 8: delete t;
    stepList.push({
      codeLine: 10,
      log: `释放队头元素 t 的内存空间，出队操作完成！`,
      action: () => {
        resetStateBeforeAnimation();
        const targetNode = getNextNodeInCircle(headNode.id);

        if (isSingleElement) {
          nodes = [headNode];
          pPointer = headNode.id;
        } else {
          nodes = nodes.filter(n => n.id !== targetNode.id);
        }

        tempPointers = {};
        activeNodes = [];
        activeLines = [];
      }
    });
  }

  setSimulationState('dequeue', stepList);
}

// Helpers for replaying states consistently
function resetStateBeforeAnimation() {
  // Resets layout and structures to the exact state before current action started,
  // so steps can reconstruct modifications on top of clean baselines.
  tempPointers = {};
  activeLines = [];
  activeNodes = [];

  // Rebuild standard list based on queueMode and active items
  // Since we only change actual queue state on the VERY LAST STEP of enqueue/dequeue,
  // we can reconstruct baseline queue elements from current state or action value.
  if (currentAction === 'enqueue') {
    // Baseline is nodes WITHOUT the new node
    nodes = nodes.filter(n => n.id !== 'temp-q' && n.id.startsWith('node-'));

    // Re-establish pPointer to correct rear node
    if (nodes.length > 0) {
      if (queueMode) {
        // Last node in nodes list (since dummy head is index 0)
        pPointer = nodes[nodes.length - 1].id;
      } else {
        pPointer = nodes[nodes.length - 1].id;
      }
    } else {
      pPointer = null;
    }
  } else if (currentAction === 'dequeue') {
    // For dequeue, baseline is nodes BEFORE deletion.
    // The deletion only commits at the very last step. So nodes array STILL CONTAINS the node.
    // However, if we are in the middle of replay, we don't modify nodes yet.
    // So nodes is already in baseline state!
  }
}

// Utility to get next node in the circular order in standard list
function getNextNodeInCircle(nodeId) {
  if (nodes.length === 0) return null;
  const idx = nodes.findIndex(n => n.id === nodeId);
  if (idx === -1) return null;
  return nodes[(idx + 1) % nodes.length];
}
