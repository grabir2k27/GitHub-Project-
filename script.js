


function handleLogin() {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
      } else {
        alert('Invalid credentials! Use: admin / admin123');
      }
    }

    // Auto-fill for demo
    window.onload = () => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
      }
    };



    let allIssues = [];
    let currentTab = 0; // 0=all, 1=open, 2=closed

    async function fetchIssues() {
      document.getElementById('loading').classList.remove('hidden');
      try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const json = await res.json();
        allIssues = json.data || [];
        renderIssues();
      } catch (err) {
        alert('Failed to load issues. Check your internet or API.');
        console.error(err);
      }
      document.getElementById('loading').classList.add('hidden');
    }

    function filterIssues() {
      if (currentTab === 0) return allIssues;
      return allIssues.filter(issue => 
        currentTab === 1 ? issue.status === 'open' : issue.status === 'closed'
      );
    }

    function renderIssues(filtered = null) {
      const container = document.getElementById('issuesGrid');
      container.innerHTML = '';

      const issuesToShow = filtered || filterIssues();

      if (issuesToShow.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-slate-400 py-12">No issues found.</p>`;
        return;
      }

      issuesToShow.forEach(issue => {
        const borderColor = issue.status === 'open' ? 'border-emerald-500' : 'border-purple-500';

        const card = document.createElement('div');
        card.className = `issue-card bg-slate-900 border ${borderColor} border-t-4 rounded-2xl overflow-hidden cursor-pointer`;
        card.innerHTML = `
          <div class="p-5">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-lg leading-tight line-clamp-2">${issue.title}</h3>
              <span class="text-xs px-3 py-1 rounded-full ${issue.status === 'open' ? 'bg-emerald-900 text-emerald-300' : 'bg-purple-900 text-purple-300'}">
                ${issue.status.toUpperCase()}
              </span>
            </div>
            <p class="text-slate-400 text-sm line-clamp-3 mb-4">${issue.description}</p>
            
            <div class="flex flex-wrap gap-2 mb-4">
              ${issue.labels.map(label => 
                `<span class="text-xs bg-slate-800 px-3 py-1 rounded-full">${label}</span>`
              ).join('')}
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500">
              <div>
                <span class="font-medium">${issue.author}</span>
                <span class="mx-2">•</span>
                <span>${new Date(issue.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
              </div>
              <div class="capitalize font-medium ${issue.priority === 'high' ? 'text-red-400' : issue.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}">
                ${issue.priority}
              </div>
            </div>
          </div>
        `;
        card.onclick = () => showIssueModal(issue);
        container.appendChild(card);
      });

      // Update header info
      updateHeaderInfo(issuesToShow.length);
    }

    function updateHeaderInfo(count) {
      const header = document.getElementById('headerInfo');
      const statusText = currentTab === 0 ? 'All Issues' : currentTab === 1 ? 'Open Issues' : 'Closed Issues';
      header.innerHTML = `
        <i class="fas fa-exclamation-circle text-2xl"></i>
        <div>
          <div class="font-semibold">${count} ${statusText}</div>
          <div class="text-xs text-slate-500">Showing results from API</div>
        </div>
      `;
    }

    function switchTab(tabIndex) {
      currentTab = tabIndex;

      // Update active tab
      document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('tab-active', i === tabIndex);
      });

      renderIssues();
    }

    function showIssueModal(issue) {
      const modal = document.getElementById('issueModal');
      const content = document.getElementById('modalContent');
      const titleEl = document.getElementById('modalTitle');

      titleEl.textContent = `#${issue.id} ${issue.title}`;

      content.innerHTML = `
        <div class="space-y-6">
          <div>
            <p class="text-slate-300 leading-relaxed">${issue.description}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-slate-500">Status</span>
              <div class="mt-1 font-medium">${issue.status.toUpperCase()}</div>
            </div>
            <div>
              <span class="text-slate-500">Priority</span>
              <div class="mt-1 font-medium capitalize ${issue.priority === 'high' ? 'text-red-400' : ''}">${issue.priority}</div>
            </div>
            <div>
              <span class="text-slate-500">Author</span>
              <div class="mt-1 font-medium">${issue.author}</div>
            </div>
            <div>
              <span class="text-slate-500">Assignee</span>
              <div class="mt-1 font-medium">${issue.assignee || 'Unassigned'}</div>
            </div>
          </div>

          <div>
            <span class="text-slate-500">Labels</span>
            <div class="flex flex-wrap gap-2 mt-2">
              ${issue.labels.map(l => `<span class="bg-slate-800 px-4 py-1 rounded-full text-xs">${l}</span>`).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-700 text-xs text-slate-500">
            Created: ${new Date(issue.createdAt).toLocaleString()}<br>
            Updated: ${new Date(issue.updatedAt).toLocaleString()}
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('issueModal').classList.add('hidden');
    }

    async function performSearch() {
      const query = document.getElementById('searchInput').value.trim();
      if (!query) {
        renderIssues();
        return;
      }

      document.getElementById('loading').classList.remove('hidden');
      try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        const results = json.data || [];
        renderIssues(results);
      } catch (e) {
        alert('Search failed');
      }
      document.getElementById('loading').classList.add('hidden');
    }

    function logout() {
      if (confirm('Logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
      }
    }

    // Keyboard support for search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    // Initial load
    window.onload = () => {
      if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
      }
      fetchIssues();
    };