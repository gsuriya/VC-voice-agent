// Wait for Gmail to load
function waitForGmail() {
  return new Promise((resolve) => {
    const checkGmail = () => {
      const gmailBody = document.querySelector('body[jsmodel]') || document.querySelector('[role="main"]');
      if (gmailBody) {
        resolve();
      } else {
        setTimeout(checkGmail, 500);
      }
    };
    checkGmail();
  });
}

// Create the venture button in Gmail's top toolbar
function createVentureButton() {
  // Check if button already exists
  if (document.getElementById('venture-button')) return;

  // Wait a bit more for Gmail to fully load
  setTimeout(() => {
    // Multiple strategies to find the right toolbar area
    let toolbarArea = null;
    
    // Strategy 1: Look for the Gmail header container with account info
    const headerContainer = document.querySelector('header[role="banner"]');
    if (headerContainer) {
      // Look for the rightmost section with buttons
      const rightSection = headerContainer.querySelector('.gb_Zc, .gb_4c, .nZ.qz, [gh="tm"]');
      if (rightSection) {
        toolbarArea = rightSection;
        console.log('Found toolbar via header strategy');
      }
    }
    
    // Strategy 2: Look for the search area and find its parent
    if (!toolbarArea) {
      const searchBox = document.querySelector('input[aria-label*="Search"], input[placeholder*="Search"]');
      if (searchBox) {
        let parent = searchBox.parentElement;
        while (parent && !parent.querySelector('.gb_')) {
          parent = parent.parentElement;
          if (parent === document.body) break;
        }
        if (parent && parent !== document.body) {
          toolbarArea = parent.querySelector('.gb_Zc, .nZ.qz') || parent;
          console.log('Found toolbar via search strategy');
        }
      }
    }
    
    // Strategy 3: Look for Google apps grid icon (9 dots)
    if (!toolbarArea) {
      const appsButton = document.querySelector('[aria-label*="apps"], [aria-label*="Google apps"], .gb_');
      if (appsButton) {
        toolbarArea = appsButton.parentElement;
        console.log('Found toolbar via apps button strategy');
      }
    }
    
    // Strategy 4: Brute force - find any element that looks like a toolbar in the top area
    if (!toolbarArea) {
      const topElements = document.querySelectorAll('div');
      for (let el of topElements) {
        const rect = el.getBoundingClientRect();
        // Look for elements in the top right quadrant
        if (rect.top < 100 && rect.right > window.innerWidth - 200 && rect.width > 50) {
          if (el.children.length > 0) {
            toolbarArea = el;
            console.log('Found toolbar via position strategy');
            break;
          }
        }
      }
    }
    
    if (!toolbarArea) {
      console.log('Gmail toolbar still not found, retrying in 2 seconds...');
      setTimeout(createVentureButton, 2000);
      return;
    }

    // Create the venture button
    const ventureButton = document.createElement('div');
    ventureButton.id = 'venture-button';
    ventureButton.className = 'venture-toolbar-btn';
    ventureButton.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      margin: 0 4px !important;
      background: transparent !important;
      z-index: 1000 !important;
    `;
    
    ventureButton.innerHTML = `
      <div class="venture-btn-content" style="color: #5f6368; transition: color 0.2s ease;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6L12 2L22 6V18L12 22L2 18V6Z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M8 9L12 14L16 9" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
    `;
    ventureButton.title = 'Toggle Venture Email Tab';
    
    // Add hover effects
    ventureButton.addEventListener('mouseenter', () => {
      ventureButton.style.backgroundColor = 'rgba(60, 64, 67, 0.08)';
    });
    
    ventureButton.addEventListener('mouseleave', () => {
      if (!ventureButton.classList.contains('active')) {
        ventureButton.style.backgroundColor = 'transparent';
      }
    });
    
    // Add click handler
    ventureButton.addEventListener('click', toggleVentureSidebar);
    
    // Insert button into toolbar
    if (toolbarArea.children.length > 0) {
      toolbarArea.insertBefore(ventureButton, toolbarArea.firstChild);
    } else {
      toolbarArea.appendChild(ventureButton);
    }
    
    console.log('✅ Venture button successfully added to Gmail toolbar!', toolbarArea);
  }, 500);
}

// Toggle the venture sidebar
function toggleVentureSidebar() {
  const existingSidebar = document.getElementById('venture-sidebar');
  
  if (existingSidebar) {
    // If sidebar exists, remove it
    existingSidebar.remove();
    resetGmailLayout();
    
    // Update button appearance
    const button = document.getElementById('venture-button');
    if (button) {
      button.classList.remove('active');
    }
  } else {
    // If sidebar doesn't exist, create it
    createVentureSidebar();
    
    // Update button appearance
    const button = document.getElementById('venture-button');
    if (button) {
      button.classList.add('active');
    }
  }
}

// Create the venture sidebar
function createVentureSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('venture-sidebar')) return;

  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'venture-sidebar';
  sidebar.className = 'venture-sidebar';
  
  // Create header with title and minimize button
  const header = document.createElement('div');
  header.className = 'venture-header';
  
  const title = document.createElement('h3');
  title.textContent = 'Venture Email Tab';
  title.className = 'venture-title';
  
  const minimizeBtn = document.createElement('button');
  minimizeBtn.innerHTML = '−';
  minimizeBtn.className = 'venture-minimize-btn';
  minimizeBtn.title = 'Minimize';
  
  header.appendChild(title);
  header.appendChild(minimizeBtn);
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'venture-content';
  content.innerHTML = `
    <div class="venture-placeholder">
      <p>Venture Email Tab</p>
    </div>
  `;
  
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  
  // Add to Gmail
  document.body.appendChild(sidebar);
  
  // Add minimize/maximize functionality
  let isMinimized = false;
  minimizeBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      sidebar.classList.add('minimized');
      minimizeBtn.innerHTML = '+';
      minimizeBtn.title = 'Maximize';
    } else {
      sidebar.classList.remove('minimized');
      minimizeBtn.innerHTML = '−';
      minimizeBtn.title = 'Minimize';
    }
  });
  
  // Adjust Gmail layout
  adjustGmailLayout();
}

// Adjust Gmail layout to accommodate sidebar
function adjustGmailLayout() {
  const gmailMain = document.querySelector('[role="main"]') || 
                    document.querySelector('.nH.oy8Mbf') ||
                    document.querySelector('.nH.bkL');
  
  if (gmailMain) {
    gmailMain.style.marginRight = '320px';
    gmailMain.style.transition = 'margin-right 0.3s ease';
  }
}

// Reset Gmail layout when sidebar is removed
function resetGmailLayout() {
  const gmailMain = document.querySelector('[role="main"]') || 
                    document.querySelector('.nH.oy8Mbf') ||
                    document.querySelector('.nH.bkL');
  
  if (gmailMain) {
    gmailMain.style.marginRight = '0';
  }
}

// Initialize the extension
async function init() {
  console.log('🚀 Venture Email Tab extension starting...');
  await waitForGmail();
  console.log('📧 Gmail detected, creating button...');
  
  createVentureButton();
  
  // Try multiple times to ensure button gets added
  setTimeout(() => {
    if (!document.getElementById('venture-button')) {
      console.log('🔄 Button not found, retrying...');
      createVentureButton();
    }
  }, 2000);
  
  setTimeout(() => {
    if (!document.getElementById('venture-button')) {
      console.log('🔄 Button still not found, trying fallback...');
      createFallbackButton();
    }
  }, 4000);
  
  // Handle navigation changes in Gmail SPA
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        if (!document.getElementById('venture-button')) {
          console.log('🔄 Page changed, recreating button...');
          createVentureButton();
        }
      }, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
}

// Fallback: Create button in a more obvious location
function createFallbackButton() {
  console.log('🆘 Creating fallback button...');
  
  // Create a floating button as fallback
  const fallbackButton = document.createElement('div');
  fallbackButton.id = 'venture-button';
  fallbackButton.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 50px !important;
    height: 50px !important;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    z-index: 10001 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
    transition: all 0.2s ease !important;
  `;
  
  fallbackButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6L12 2L22 6V18L12 22L2 18V6Z" stroke="white" stroke-width="2" fill="none"/>
      <path d="M8 9L12 14L16 9" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  `;
  
  fallbackButton.title = 'Toggle Venture Email Tab';
  
  fallbackButton.addEventListener('mouseenter', () => {
    fallbackButton.style.transform = 'scale(1.1)';
  });
  
  fallbackButton.addEventListener('mouseleave', () => {
    fallbackButton.style.transform = 'scale(1)';
  });
  
  fallbackButton.addEventListener('click', toggleVentureSidebar);
  
  document.body.appendChild(fallbackButton);
  console.log('✅ Fallback button created!');
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
