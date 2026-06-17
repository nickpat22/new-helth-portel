// State variables
let supabaseClient = null;
let currentSource = 'None';

// DOM Elements
const statusCard = document.getElementById('statusCard');
const statusPulse = document.getElementById('statusPulse');
const statusText = document.getElementById('statusText');
const statusDetails = document.getElementById('statusDetails');
const btnRetry = document.getElementById('btnRetry');

const logMessageInput = document.getElementById('logMessage');
const btnInsert = document.getElementById('btnInsert');
const btnClearLogs = document.getElementById('btnClearLogs');
const logsList = document.getElementById('logsList');

const configSourceAlert = document.getElementById('configSourceAlert');
const configForm = document.getElementById('configForm');
const supabaseUrlInput = document.getElementById('supabaseUrl');
const supabaseKeyInput = document.getElementById('supabaseKey');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const btnClearConfig = document.getElementById('btnClearConfig');

// Init function
async function init() {
  loadConfigInputs();
  await setupSupabase();
}

// Load inputs from localStorage
function loadConfigInputs() {
  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_key');
  
  if (url) supabaseUrlInput.value = url;
  if (key) supabaseKeyInput.value = key;
}

// Check source of Supabase configurations
function getActiveConfig() {
  // 1. Check window configuration (from config.js)
  if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.SUPABASE_URL && window.SUPABASE_CONFIG.SUPABASE_ANON_KEY) {
    if (window.SUPABASE_CONFIG.SUPABASE_URL !== "https://your-supabase-project-id.supabase.co") {
      currentSource = 'config.js';
      return {
        url: window.SUPABASE_CONFIG.SUPABASE_URL,
        key: window.SUPABASE_CONFIG.SUPABASE_ANON_KEY
      };
    }
  }

  // 2. Check localStorage
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  if (localUrl && localKey) {
    currentSource = 'local_storage';
    return { url: localUrl, key: localKey };
  }

  currentSource = 'none';
  return null;
}

// Update the configuration source alert text
function updateSourceAlert() {
  if (currentSource === 'config.js') {
    configSourceAlert.innerHTML = '<i class="fa-solid fa-file-code"></i> Connected via <strong>config.js</strong>. Local edits will override this.';
    configSourceAlert.style.background = 'rgba(139, 92, 246, 0.05)';
    configSourceAlert.style.borderColor = 'rgba(139, 92, 246, 0.2)';
    configSourceAlert.style.color = '#c084fc';
  } else if (currentSource === 'local_storage') {
    configSourceAlert.innerHTML = '<i class="fa-solid fa-database"></i> Connected via <strong>browser storage</strong>.';
    configSourceAlert.style.background = 'rgba(6, 182, 212, 0.05)';
    configSourceAlert.style.borderColor = 'rgba(6, 182, 212, 0.2)';
    configSourceAlert.style.color = '#22d3ee';
  } else {
    configSourceAlert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No configuration found. Please enter credentials below.';
    configSourceAlert.style.background = 'rgba(245, 158, 11, 0.05)';
    configSourceAlert.style.borderColor = 'rgba(245, 158, 11, 0.2)';
    configSourceAlert.style.color = '#fbbf24';
  }
}

// Setup and test connection
async function setupSupabase() {
  updateStatus('pending', 'Initializing connection...', 'Configuring Supabase client module...');
  
  const config = getActiveConfig();
  updateSourceAlert();

  if (!config) {
    updateStatus('disconnected', 'Configuration Required', 'Please enter your Supabase URL and Anon Key in the panel to establish a database connection.');
    btnInsert.disabled = true;
    return;
  }

  try {
    // Initialize Supabase Client
    // @ts-ignore
    supabaseClient = supabase.createClient(config.url, config.key);
    
    updateStatus('pending', 'Verifying Connection...', `Testing credentials with REST API: ${config.url}`);
    
    // Test fetch to confirm credentials are valid
    // We fetch a dummy table which is a safe way to check if the client communicates and authenticates.
    // If authorization key is invalid, we will get 401. If URL is wrong, we get network error.
    const { data, error, status } = await supabaseClient
      .from('connection_logs')
      .select('*')
      .limit(1);

    if (error) {
      // If table doesn't exist but authentication worked, we get code 'PGRST116' or status 404 (Not Found) or 400 (Bad request)
      // but if the API key was invalid, we get 401 Unauthorized.
      if (status === 401 || error.message.includes('JWT') || error.message.includes('API key')) {
        updateStatus('disconnected', 'Authentication Failed', `Error: Unauthorized (401)\nYour Anon API Key or URL is invalid.\n\nSupabase API message: ${error.message}`);
        btnInsert.disabled = true;
      } else if (error.code === 'PGRST116' || status === 404 || error.message.includes('relation "connection_logs" does not exist')) {
        // Table doesn't exist, but connection/auth is verified!
        updateStatus('connected', 'Connected (Verified)', `Successfully connected to Supabase REST API.\n\nNote: Table 'connection_logs' does not exist in your database yet.\nTo test database writes, create the table using the instructions in the panel.`);
        btnInsert.disabled = false;
        showTableSetupInstructions();
      } else {
        updateStatus('disconnected', 'Connection Error', `Failed to query table. Status: ${status}\nCode: ${error.code}\nMessage: ${error.message}`);
        btnInsert.disabled = true;
      }
    } else {
      updateStatus('connected', 'Connected (Verified)', `Successfully connected!\nTable 'connection_logs' is ready for read/write.`);
      btnInsert.disabled = false;
      fetchLogs();
    }
  } catch (err) {
    updateStatus('disconnected', 'Network Error', `Could not reach Supabase endpoint.\nPlease verify your URL is typed correctly and you have internet access.\n\nDetails: ${err.message}`);
    btnInsert.disabled = true;
  }
}

// Update UI Connection Status
function updateStatus(state, title, details) {
  statusCard.className = 'card glass-card status-card';
  statusCard.classList.add(`status-${state}`);
  
  statusText.textContent = title;
  statusDetails.textContent = details;
}

// Fetch logs from Supabase
async function fetchLogs() {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from('connection_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Fetch logs error:', error);
      return;
    }

    renderLogs(data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// Render log items into list
function renderLogs(logs) {
  if (!logs || logs.length === 0) {
    logsList.innerHTML = '<div class="log-item empty-state">No logs found. Insert one above to test!</div>';
    btnClearLogs.disabled = true;
    return;
  }

  btnClearLogs.disabled = false;
  logsList.innerHTML = logs.map(log => {
    const date = new Date(log.created_at);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `
      <div class="log-item inserted">
        <span>${escapeHtml(log.message)}</span>
        <span class="log-time">${timeString}</span>
      </div>
    `;
  }).join('');
}

// Show table setup guide in empty logs list
function showTableSetupInstructions() {
  logsList.innerHTML = `
    <div style="padding: 0.5rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
      <p style="margin-bottom: 0.5rem; color: var(--color-warning); font-weight: 600;">To enable Writes/Reads, run this SQL query in your Supabase SQL Editor:</p>
      <pre style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 0.7rem; color: #fff;">
create table connection_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  message text not null
);

alter table connection_logs enable row level security;
create policy "Public insert" on connection_logs for insert with check (true);
create policy "Public select" on connection_logs for select using (true);
      </pre>
    </div>
  `;
}

// Helper to escape HTML and prevent XSS
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// Event Listeners
configForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = supabaseUrlInput.value.trim();
  const key = supabaseKeyInput.value.trim();

  if (!url || !key) return;

  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  
  await setupSupabase();
});

btnClearConfig.addEventListener('click', () => {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_key');
  
  supabaseUrlInput.value = '';
  supabaseKeyInput.value = '';
  
  supabaseClient = null;
  currentSource = 'none';
  
  setupSupabase();
});

btnRetry.addEventListener('click', () => {
  setupSupabase();
});

toggleKeyVisibility.addEventListener('click', () => {
  const isPassword = supabaseKeyInput.type === 'password';
  supabaseKeyInput.type = isPassword ? 'text' : 'password';
  toggleKeyVisibility.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
});

btnInsert.addEventListener('click', async () => {
  if (!supabaseClient) return;

  const msg = logMessageInput.value.trim();
  if (!msg) return;

  btnInsert.disabled = true;
  
  try {
    const { error } = await supabaseClient
      .from('connection_logs')
      .insert([{ message: msg }]);

    if (error) {
      alert(`Insert failed: ${error.message}`);
    } else {
      logMessageInput.value = 'Connection test log'; // reset
      await fetchLogs();
    }
  } catch (err) {
    alert(`Write error: ${err.message}`);
  } finally {
    btnInsert.disabled = false;
  }
});

btnClearLogs.addEventListener('click', async () => {
  if (!supabaseClient || !confirm('Are you sure you want to delete all test logs from the database?')) return;

  btnClearLogs.disabled = true;

  try {
    const { error } = await supabaseClient
      .from('connection_logs')
      .delete()
      .neq('id', 0); // Delete all rows where id is not 0 (effectively all rows)

    if (error) {
      alert(`Clear logs failed: ${error.message}`);
    } else {
      await fetchLogs();
    }
  } catch (err) {
    alert(`Clear logs error: ${err.message}`);
  } finally {
    btnClearLogs.disabled = false;
  }
});

// Run
init();
