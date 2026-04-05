/* kappafy.com — JSON Explorer & Mock API Generator */
(function() {
  'use strict';

  var jsonInput = document.getElementById('jsonInput');
  var parseBtn = document.getElementById('parseBtn');
  var prettifyBtn = document.getElementById('prettifyBtn');
  var minifyBtn = document.getElementById('minifyBtn');
  var copyBtn = document.getElementById('copyBtn');
  var treeView = document.getElementById('treeView');
  var pathDisplay = document.getElementById('pathDisplay');
  var statsContainer = document.getElementById('statsContainer');
  var mockContainer = document.getElementById('mockContainer');
  var mockBtn = document.getElementById('mockBtn');
  var errorMsg = document.getElementById('errorMsg');

  if (!parseBtn) return;

  var parsedData = null;

  /* Parse JSON */
  function parseJSON() {
    var input = jsonInput.value.trim();
    if (!input) { showError('Please paste some JSON.'); return; }

    try {
      parsedData = JSON.parse(input);
      clearError();
      jsonInput.value = JSON.stringify(parsedData, null, 2);
      renderTree(parsedData);
      renderStats(parsedData);
      pathDisplay.textContent = '$';
    } catch (e) {
      showError('Invalid JSON: ' + e.message);
      parsedData = null;
      treeView.innerHTML = '';
      statsContainer.innerHTML = '';
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }

  function clearError() {
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
  }

  /* Prettify / Minify */
  function prettify() {
    if (!parsedData) { parseJSON(); return; }
    jsonInput.value = JSON.stringify(parsedData, null, 2);
  }

  function minify() {
    if (!parsedData) { parseJSON(); return; }
    jsonInput.value = JSON.stringify(parsedData);
  }

  function copyFormatted() {
    if (!parsedData) return;
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2)).then(function() {
      copyBtn.textContent = 'Copied!';
      setTimeout(function() { copyBtn.textContent = 'Copy JSON'; }, 1500);
    });
  }

  /* Determine type */
  function getType(val) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  /* Render tree recursively */
  function renderTree(data) {
    treeView.innerHTML = '';
    var root = buildTreeNode('$', data, '$');
    treeView.appendChild(root);
  }

  function buildTreeNode(key, value, path) {
    var type = getType(value);
    var node = document.createElement('div');
    node.className = 'tree-node';

    if (type === 'object' || type === 'array') {
      var isArray = type === 'array';
      var entries = isArray ? value : Object.keys(value);
      var count = isArray ? value.length : entries.length;

      var header = document.createElement('div');
      var toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = '-';

      var keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key;
      keySpan.addEventListener('click', function() { pathDisplay.textContent = path; });

      var typeSpan = document.createElement('span');
      typeSpan.className = 'tree-type type-' + type;
      typeSpan.textContent = isArray ? 'array[' + count + ']' : 'object{' + count + '}';

      header.appendChild(toggle);
      header.appendChild(keySpan);
      header.appendChild(typeSpan);

      var children = document.createElement('div');
      children.className = 'tree-children';

      var childKeys = isArray ? value : Object.keys(value);
      var limit = Math.min(isArray ? value.length : childKeys.length, 200);
      for (var i = 0; i < limit; i++) {
        var childKey = isArray ? i : childKeys[i];
        var childVal = isArray ? value[i] : value[childKey];
        var childPath = isArray ? path + '[' + i + ']' : path + '.' + childKey;
        children.appendChild(buildTreeNode(childKey, childVal, childPath));
      }
      if ((isArray ? value.length : childKeys.length) > 200) {
        var more = document.createElement('div');
        more.className = 'tree-node';
        more.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">... and ' + ((isArray ? value.length : childKeys.length) - 200) + ' more</span>';
        children.appendChild(more);
      }

      toggle.addEventListener('click', function() {
        children.classList.toggle('collapsed');
        toggle.textContent = children.classList.contains('collapsed') ? '+' : '-';
      });

      node.appendChild(header);
      node.appendChild(children);
    } else {
      var keySpan2 = document.createElement('span');
      keySpan2.className = 'tree-key';
      keySpan2.textContent = '  ' + key;
      keySpan2.addEventListener('click', function() { pathDisplay.textContent = path; });

      var typeSpan2 = document.createElement('span');
      typeSpan2.className = 'tree-type type-' + type;
      typeSpan2.textContent = type;

      var valSpan = document.createElement('span');
      valSpan.className = 'tree-value val-' + type;
      var displayVal = value;
      if (type === 'string') {
        displayVal = '"' + (value.length > 60 ? value.substring(0, 60) + '...' : value) + '"';
      } else if (type === 'null') {
        displayVal = 'null';
      }
      valSpan.textContent = ': ' + displayVal;

      node.appendChild(keySpan2);
      node.appendChild(typeSpan2);
      node.appendChild(valSpan);
    }

    return node;
  }

  /* Stats */
  function renderStats(data) {
    var stats = computeStats(data);
    statsContainer.innerHTML = '';

    var items = [
      { label: 'Total Keys', value: stats.totalKeys },
      { label: 'Max Depth', value: stats.maxDepth },
      { label: 'Strings', value: stats.types.string || 0 },
      { label: 'Numbers', value: stats.types.number || 0 },
      { label: 'Booleans', value: stats.types.boolean || 0 },
      { label: 'Nulls', value: stats.types.null || 0 },
      { label: 'Arrays', value: stats.types.array || 0 },
      { label: 'Objects', value: stats.types.object || 0 }
    ];

    for (var i = 0; i < items.length; i++) {
      var div = document.createElement('div');
      div.className = 'stat-item';
      div.innerHTML = '<div class="stat-value">' + items[i].value + '</div><div class="stat-label">' + items[i].label + '</div>';
      statsContainer.appendChild(div);
    }

    /* Array lengths */
    if (stats.arrayLengths.length > 0) {
      var alDiv = document.createElement('div');
      alDiv.className = 'stat-item';
      alDiv.style.gridColumn = '1 / -1';
      alDiv.innerHTML = '<div class="stat-label">Array Lengths</div><div style="color:var(--text-muted);font-size:12px;margin-top:4px;">' +
        stats.arrayLengths.slice(0, 10).join(', ') + (stats.arrayLengths.length > 10 ? '...' : '') + '</div>';
      statsContainer.appendChild(alDiv);
    }
  }

  function computeStats(data) {
    var result = { totalKeys: 0, maxDepth: 0, types: {}, arrayLengths: [] };
    walkStats(data, 0, result);
    return result;
  }

  function walkStats(val, depth, result) {
    if (depth > result.maxDepth) result.maxDepth = depth;
    var type = getType(val);

    if (!result.types[type]) result.types[type] = 0;
    result.types[type]++;

    if (type === 'array') {
      result.arrayLengths.push(val.length);
      for (var i = 0; i < Math.min(val.length, 1000); i++) {
        result.totalKeys++;
        walkStats(val[i], depth + 1, result);
      }
    } else if (type === 'object') {
      var keys = Object.keys(val);
      for (var k = 0; k < Math.min(keys.length, 1000); k++) {
        result.totalKeys++;
        walkStats(val[keys[k]], depth + 1, result);
      }
    }
  }

  /* Mock API Generator */
  function generateMockAPI() {
    if (!parsedData) { showError('Parse JSON first.'); return; }
    mockContainer.innerHTML = '';

    var resourceName = guessResourceName(parsedData);
    var endpoints = [];

    /* GET /resource — list */
    var listData = parsedData;
    if (!Array.isArray(parsedData)) {
      /* Wrap object in array for list endpoint */
      listData = [parsedData];
    }
    endpoints.push({
      method: 'GET',
      path: '/' + resourceName,
      desc: 'List all ' + resourceName,
      response: JSON.stringify(listData.slice(0, 3), null, 2)
    });

    /* GET /resource/:id — single */
    var singleItem = Array.isArray(parsedData) ? parsedData[0] : parsedData;
    if (singleItem && typeof singleItem === 'object') {
      endpoints.push({
        method: 'GET',
        path: '/' + resourceName + '/:id',
        desc: 'Get single ' + singularize(resourceName),
        response: JSON.stringify(singleItem, null, 2)
      });

      /* POST /resource — create */
      var createBody = {};
      var singleKeys = Object.keys(singleItem);
      for (var i = 0; i < Math.min(singleKeys.length, 10); i++) {
        var k = singleKeys[i];
        if (k !== 'id' && k !== '_id' && k !== 'created_at' && k !== 'updated_at') {
          createBody[k] = singleItem[k];
        }
      }
      endpoints.push({
        method: 'POST',
        path: '/' + resourceName,
        desc: 'Create ' + singularize(resourceName),
        response: JSON.stringify({ success: true, data: singleItem }, null, 2)
      });

      /* PUT /resource/:id — update */
      endpoints.push({
        method: 'PUT',
        path: '/' + resourceName + '/:id',
        desc: 'Update ' + singularize(resourceName),
        response: JSON.stringify({ success: true, data: singleItem, updated: true }, null, 2)
      });

      /* DELETE /resource/:id — delete */
      endpoints.push({
        method: 'DELETE',
        path: '/' + resourceName + '/:id',
        desc: 'Delete ' + singularize(resourceName),
        response: JSON.stringify({ success: true, deleted: true }, null, 2)
      });
    }

    for (var e = 0; e < endpoints.length; e++) {
      var ep = endpoints[e];
      var div = document.createElement('div');
      div.className = 'mock-endpoint';
      div.innerHTML = '<div><span class="mock-method">' + ep.method + '</span><span class="mock-path">' +
        escapeHtml(ep.path) + '</span></div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + ep.desc + '</div>' +
        '<div class="mock-response">' + escapeHtml(ep.response) + '</div>';
      mockContainer.appendChild(div);
    }
  }

  function guessResourceName(data) {
    if (Array.isArray(data) && data.length > 0) {
      var first = data[0];
      if (typeof first === 'object' && first !== null) {
        var keys = Object.keys(first);
        if (keys.indexOf('name') !== -1) return 'items';
        if (keys.indexOf('email') !== -1) return 'users';
        if (keys.indexOf('title') !== -1) return 'posts';
        if (keys.indexOf('url') !== -1) return 'resources';
      }
      return 'items';
    }
    if (typeof data === 'object' && data !== null) {
      var topKeys = Object.keys(data);
      for (var i = 0; i < topKeys.length; i++) {
        if (Array.isArray(data[topKeys[i]])) return topKeys[i];
      }
      if (topKeys.indexOf('users') !== -1) return 'users';
      if (topKeys.indexOf('data') !== -1) return 'data';
    }
    return 'resources';
  }

  function singularize(word) {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('ses')) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Event listeners */
  parseBtn.addEventListener('click', parseJSON);
  prettifyBtn.addEventListener('click', prettify);
  minifyBtn.addEventListener('click', minify);
  copyBtn.addEventListener('click', copyFormatted);
  mockBtn.addEventListener('click', generateMockAPI);

  /* Load sample on empty state */
  var sampleJSON = '[\n  {\n    "id": 1,\n    "name": "Alice Johnson",\n    "email": "alice@example.com",\n    "role": "admin",\n    "active": true,\n    "created_at": "2025-01-15T09:30:00Z"\n  },\n  {\n    "id": 2,\n    "name": "Bob Smith",\n    "email": "bob@example.com",\n    "role": "user",\n    "active": false,\n    "created_at": "2025-02-20T14:15:00Z"\n  }\n]';
  if (!jsonInput.value.trim()) {
    jsonInput.placeholder = sampleJSON;
  }
})();


// === Zovo V5 Pro Nudge System ===
(function() {
  var V5_LIMIT = 2;
  var V5_FEATURE = 'Multiple mock endpoints';
  var v5Count = 0;
  var v5Shown = false;

  function v5ShowNudge() {
    if (v5Shown || sessionStorage.getItem('v5_pro_nudge')) return;
    v5Shown = true;
    sessionStorage.setItem('v5_pro_nudge', '1');
    var host = location.hostname;
    var el = document.createElement('div');
    el.className = 'pro-nudge';
    el.innerHTML = '<div class="pro-nudge-inner">' +
      '<span class="pro-nudge-icon">\u2726</span>' +
      '<div class="pro-nudge-text">' +
      '<strong>' + V5_FEATURE + '</strong> is a Pro feature. ' +
      '<a href="https://zovo.one/pricing?utm_source=' + host +
      '&utm_medium=satellite&utm_campaign=pro-nudge" target="_blank">' +
      'Get Zovo Lifetime \u2014 $99 once, access everything forever.</a>' +
      '</div></div>';
    var target = document.querySelector('main') ||
      document.querySelector('.tool-section') ||
      document.querySelector('.container') ||
      document.querySelector('section') ||
      document.body;
    if (target) target.appendChild(el);
  }

  // Track meaningful user actions (button clicks, form submits)
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (t.closest('button, [onclick], .btn, input[type="submit"], input[type="button"]')) {
      v5Count++;
      if (v5Count >= V5_LIMIT) v5ShowNudge();
    }
  }, true);

  // Track file drops/selections (for file-based tools)
  document.addEventListener('change', function(e) {
    if (e.target && e.target.type === 'file') {
      v5Count++;
      if (v5Count >= V5_LIMIT) v5ShowNudge();
    }
  }, true);
})();
