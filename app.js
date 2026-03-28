// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyB9VziVCtIffdMTYHtH3Fd7AB8sb3X1c8I",
  authDomain: "school-f6436.firebaseapp.com",
  projectId: "school-f6436",
  storageBucket: "school-f6436.firebasestorage.app",
  messagingSenderId: "416612644923",
  appId: "1:416612644923:web:b9e636dcb9031dfd96841e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// State Management
let members = [];
let financials = [];
let committee = [];
let homeData = {
    pres: 'Sunil Perera', presWA: '94771234567',
    sec: 'Kamal Silva', secWA: '94712345678',
    tres: 'Ajith Kumara', tresWA: '94703456789',
    addr: 'පත්බේරිය - පරකඩුව'
};
let gallery = [];
let societyLogo = 'icon.png';
let currentYear = new Date().getFullYear();
let currentRole = localStorage.getItem('samagi_role') || null;

// Real-time Firestore Listeners
db.collection('members').onSnapshot((snapshot) => {
    members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderMembers();
    renderFinancials();
});

db.collection('financials').onSnapshot((snapshot) => {
    financials = snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
    renderFinancials();
});

db.collection('committee').orderBy('order').onSnapshot((snapshot) => {
    committee = snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
    if(typeof renderCommittee === 'function') renderCommittee();
});

db.collection('settings').doc('home').onSnapshot((doc) => {
    if (doc.exists) {
        homeData = doc.data();
        if(typeof loadHomeData === 'function') loadHomeData();
    }
});

db.collection('settings').doc('logo').onSnapshot((doc) => {
    if (doc.exists) {
        societyLogo = doc.data().url || 'icon.png';
        const logoContainer = document.getElementById('logo-container');
        if(logoContainer) logoContainer.innerHTML = `<img src="${societyLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        const bannerIcon = document.getElementById('bannerIconImg');
        if (bannerIcon) bannerIcon.innerHTML = `<img src="${societyLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`;
        if(typeof updateFavicon === 'function') updateFavicon(societyLogo);
        if(typeof updateManifest === 'function') updateManifest();
    }
});

db.collection('gallery').onSnapshot((snapshot) => {
    gallery = snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
    if(typeof renderGallery === 'function') renderGallery();
});


// Translation Engine
let currentLang = localStorage.getItem('samagi_lang') || 'si';
const transDict = {
    "Home": "මුල් පිටුව", "Members": "සාමාජිකයින්", "Financials": "ගිණුම්", "Gallery": "ගැලරිය", "Notices": "දැන්වීම්",
    "Install Samagi App!": "සමගි App එක ලබාගන්න!", "INSTALL": "ස්ථාපනය කරන්න", "Logout": "ඉවත් වන්න",
    "Samagi Annonyadara Subasadaka Samithiya": "සමගි අන්‍යෝන්‍යාධාර සුබසාධක සමිතිය", "Founded on:": "ආරම්භ කළ දිනය:",
    "Registered Address": "ලියාපදිංචි ලිපිනය", "Sabhapathi (President)": "සභාපති (President)", "Lekam (Secretary)": "ලේකම් (Secretary)",
    "Bhandagarika (Treasurer)": "භාණ්ඩාගාරික (Treasurer)", "Save Changes": "වෙනස්කම් සුරකින්න", "Executive Committee Officials": "විධායක කමිටු නිලධාරීන්",
    "Add Official": "නිලධාරියෙකු එක් කරන්න", "Position": "තනතුර", "Name": "නම", "WhatsApp": "වට්ස්ඇප්", "Action": "ක්‍රියාව",
    "Manage Members": "සාමාජිකයින් කළමනාකරණය", "Show for Year:": "වර්ෂය: ", "Add Member": "සාමාජිකයෙකු එක් කරන්න",
    "Total Membership Fees": "මුළු සාමාජික ගාස්තු", "Total Death Contributions": "මුළු මරණාධාර ලදුපත්", "Building & Misc Income": "වෙනත් ආදායම්",
    "Yearly Balance": "වාර්ෂික ශේෂය", "Add Income/Expense": "මුදල් එක් කරන්න", "Year": "වර්ෂය", "Type": "වර්ගය", "Category": "අංශය",
    "Amount (Rs)": "මුදල (රු.)", "Income (Building/Other)": "ආදායම්", "Expense (Bill/Repair/Death)": "වියදම් (බිල්/මරණාධාර)",
    "Save Record": "දත්ත සුරකින්න", "Recent Financial Records": "මෑත මූල්‍ය වාර්තා", "Settings": "සැකසුම්",
    "Monthly Fee (Rs)": "මාසික ගාස්තුව (රු.)", "Death Fee (Rs)": "මරණාධාර මුදල (රු.)", "Photo Gallery": "ඡායාරූප ගැලරිය",
    "Upload Photo": "ඡායාරූපයක් එක් කරන්න", "Member Notice Board": "දැන්වීම් පුවරුව", "Compose Notice": "දැන්වීමක් සකසන්න",
    "Send to All Members": "සියලුම සාමාජිකයින්ට යවන්න", "Send to Committee": "කමිටුවට යවන්න", "Quick Message Links": "කෙටි පණිවිඩ සැකිලි",
    "Monthly Fees Reminder": "මාසික ගාස්තු සිහිකැඳවීම", "Death Benefit Notice": "මරණාධාර දැන්වීම", "Use Template": "භාවිතා කරන්න",
    "System Login": "පද්ධතියට ඇතුල් වීම", "Select Role": "තනතුර තෝරන්න", "Admin (Main)": "ප්‍රධාන පරිපාලක",
    "Sabhapathi": "සභාපති", "Lekam": "ලේකම්", "Bhandagarika": "භාණ්ඩාගාරික", "Member (View Only)": "සාමාජික (බැලීමට පමණක්)",
    "PIN Code": "මුරපදය (PIN)", "Login": "ඇතුල් වන්න", "Invalid PIN!": "මුරපදය වැරදියි!", "Add New Member": "නව සාමාජිකයෙකු එක් කිරීම", "Install App": "App එක Install කරන්න",
    "Quick Access!": "ඉක්මනින් පිවිසෙන්න!", "Install Samagi App": "සමගි App එක ස්ථාපනය කරන්න",
    "Install this app on your phone for faster access to member details and financials.": "පහසුවෙන් සාමාජික විස්තර සහ ගිණුම් බැලීමට මෙය ඔබගේ දුරකථනයේ ස්ථාපනය කරගන්න.",
    "Enjoy a faster, smoother experience on your device.": "ඔබගේ දුරකථනයෙන් වඩාත් පහසුවෙන් සහ වේගයෙන් මෙම පද්ධතිය භාවිතා කරන්න.",
    "MAYBE LATER": "පසුව කරන්න",
    "Full Name": "සම්පූර්ණ නම", "NIC Number": "ජාතික හැඳුනුම්පත් අංකය", "Address": "ලිපිනය", "Date of Birth": "උපන් දිනය",
    "WhatsApp No": "වට්ස්ඇප් අංකය", "Other Phone": "වෙනත් දුරකථන අංකය", "Joined Year": "සමිතියට බැඳුණු වසර",
    "Add Dependent": "යැපෙන්නෙක් එක් කරන්න", "Cancel": "අවලංගු කරන්න", "Save Member": "සාමාජිකයා සුරකින්න",
    "Joined": "බැඳුණු වසර", "NIC": "හැඳුනුම්පත", "Dependents": "යැපෙන්නන්", "Actions": "ක්‍රියාමාර්ග", "Cat": "අංශය", "Amount": "මුදල",
    "Home page details saved!": "විස්තර සාර්ථකව සුරැකිණි!", "Maximum 10 dependents allowed": "උපරිම යැපෙන්නන් 10ක් පමණයි",
    "Are you sure you want to remove this member?": "මෙම සාමාජිකයාව ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?", "Delete this record?": "මෙම වාර්තාව මකා දැමිය යුතුද?",
    "Enter Event Name:": "අවස්ථාවේ නම (Event Name) ඇතුලත් කරන්න:", "Enter Date (YYYY/MM/DD):": "දිනය ඇතුලත් කරන්න (YYYY/MM/DD):",
    "Enter Image URL (or use a sample URL):": "පින්තූරයේ URL එක ලබාදෙන්න:", "Delete this photo?": "මෙම පින්තූරය මකා දැමිය යුතුද?",
    "No members found.": "සාමාජිකයින් හමුවූයේ නැත.", "Send via WhatsApp? (Click 'Cancel' for SMS)": "WhatsApp හරහා යවන්නද? (SMS සඳහා 'Cancel' ඔබන්න)",
    "Delete this official?": "මෙම නිලධාරියාව ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?", "Role: ": "තනතුර: ", "Admin": "ප්‍රධාන පරිපාලක", "Member": "සාමාජික",
    "New Update Available!": "අලුත් වෙනසක් තිබේ!", "REFRESH NOW": "දැන් ලබාගන්න"
};

const placeholderDictTransl = {
    "Search by Name or NIC...": "නම හෝ හැඳුනුම්පත මගින් සොයන්න...", "e.g. Electricity Bill": "උදා: විදුලි බිල",
    "0.00": "0.00", "Type message here...": "පණිවිඩය මෙහි ලියන්න...", "Enter PIN (e.g., 1234)": "PIN අංකය ඇතුලත් කරන්න (උදා: 1234)",
    "Dependent Name": "යැපෙන්නාගේ නම", "Age": "වයස", "Relationship": "ඥාතිත්වය", "94771234567": "94771234567"
};

let textNodesCache = [];
let placeholderCache = [];

function initTranslation() {
    // Translation for Update Banner
    if (document.getElementById('updateBanner')) {
        document.getElementById('updateText').textContent = t("New Update Available!");
        document.querySelector('#updateBanner button').textContent = t("REFRESH NOW");
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walker.nextNode()) {
        if(node.parentNode && ['SCRIPT', 'STYLE'].includes(node.parentNode.nodeName)) continue;
        let original = node.nodeValue;
        let text = original.trim();
        if(text && transDict[text]) {
            textNodesCache.push({ node, enText: text, prefix: original.substring(0, original.indexOf(text)), suffix: original.substring(original.indexOf(text) + text.length) });
        }
    }
    
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if(el.placeholder && placeholderDictTransl[el.placeholder]) {
            placeholderCache.push({ el, enText: el.placeholder });
        }
    });

    applyTranslation();
}

function applyTranslation() {
    const isEn = currentLang === 'en';
    
    if (document.getElementById('updateBanner')) {
        document.getElementById('updateText').textContent = isEn ? "New Update Available!" : "අලුත් වෙනසක් තිබේ!";
        document.querySelector('#updateBanner button').innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ` + (isEn ? "REFRESH NOW" : "දැන් ලබාගන්න");
    }

    textNodesCache.forEach(item => {
        item.node.nodeValue = item.prefix + (isEn ? item.enText : transDict[item.enText]) + item.suffix;
    });
    placeholderCache.forEach(item => {
        item.el.placeholder = isEn ? item.enText : placeholderDictTransl[item.enText];
    });
    const btn = document.getElementById('langToggleInfoBtn');
    if(btn) btn.textContent = isEn ? "සිංහල" : "English";
}

function t(enText) {
    if(currentLang === 'en') return enText;
    return transDict[enText] || enText;
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'si' : 'en';
    localStorage.setItem('samagi_lang', currentLang);
    applyTranslation();
    renderMembers();
    renderFinancials();
    renderCommittee();
    if (currentRole) applyRolePermissions();
};

// Progressive Web App (PWA) Setup
let newWorker;
function triggerUpdate() {
    if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTranslation();
    initYearFilters();
    renderMembers();
    renderFinancials();
    renderGallery();
    renderCommittee();
    loadHomeData();
    setupNavigation();
    
    // Set initial dates and filters
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('financeDate').value = today;
    document.getElementById('dashboardYear').value = currentYear;
    document.getElementById('recordFilterYear').value = currentYear;
    
    // Init categories
    if (typeof updateFinanceCategories === 'function') {
        updateFinanceCategories();
    }
    const displayLogo = societyLogo ? societyLogo : 'icon.png';
    document.getElementById('logo-container').innerHTML = `<img src="${displayLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    updateFavicon(displayLogo);
    const bannerIcon = document.getElementById('bannerIconImg');
    if (bannerIcon) bannerIcon.innerHTML = `<img src="${displayLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`;

    // PWA Setup
    updateManifest();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        const updateBanner = document.getElementById('updateBanner');
                        if (updateBanner) updateBanner.style.display = 'block';
                    }
                });
            });
            // If there's already a waiting worker
            if (reg.waiting && navigator.serviceWorker.controller) {
                newWorker = reg.waiting;
                const updateBanner = document.getElementById('updateBanner');
                if (updateBanner) updateBanner.style.display = 'block';
            }
        });
        
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }

    if (!currentRole) {
        document.getElementById('loginModal').style.display = 'flex';
    } else {
        applyRolePermissions();
    }
});

// Login Logic
document.getElementById('loginRole').addEventListener('change', (e) => {
    if (e.target.value === 'Member') {
        document.getElementById('pinGroup').style.display = 'none';
        document.getElementById('loginPin').value = '';
    } else {
        document.getElementById('pinGroup').style.display = 'flex';
    }
});

document.getElementById('loginPin').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginBtn').click();
    }
});

document.getElementById('loginBtn').addEventListener('click', () => {
    const role = document.getElementById('loginRole').value;
    const pin = document.getElementById('loginPin').value;
    
    if (role !== 'Member') {
        if (pin !== '1234') { 
            document.getElementById('loginError').style.display = 'block';
            return;
        }
    }
    
    document.getElementById('loginError').style.display = 'none';
    localStorage.setItem('samagi_role', role);
    currentRole = role;
    document.getElementById('loginModal').style.display = 'none';
    applyRolePermissions();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('samagi_role');
    currentRole = null;
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('currentUserRole').textContent = '';
    document.getElementById('loginPin').value = '';
    document.getElementById('loginModal').style.display = 'flex';
});

function applyRolePermissions() {
    const isMember = currentRole === 'Member';
    const styleId = 'role-style';
    let styleEl = document.getElementById(styleId);
    
    document.getElementById('logoutBtn').style.display = 'block';
    
    const roleNames = { 'Admin': 'Admin', 'President': 'Sabhapathi', 'Secretary': 'Lekam', 'Treasurer': 'Bhandagarika', 'Member': 'Member' };
    document.getElementById('currentUserRole').textContent = t('Role: ') + t(roleNames[currentRole]);
    
    if (isMember) {
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = `
            .admin-only { display: none !important; }
            .edit-input, .edit-input-sm { pointer-events: none; border: none !important; background: transparent !important; }
            #society-address { pointer-events: none; text-decoration: none; }
            td input { pointer-events: none; border: none !important; background: transparent !important; }
            #logo-container { pointer-events: none; }
        `;
    } else {
        if (styleEl) styleEl.remove();
    }
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
    
    // Show additional UI elements
    const navBtn = document.getElementById('navInstallTopBtn');
    if (navBtn) navBtn.style.display = 'inline-flex';
    
    const homeCTA = document.getElementById('homeInstallCTA');
    if (homeCTA) homeCTA.style.display = 'block';

    const floatingBtn = document.getElementById('floatingInstallBtn');
    if (floatingBtn) floatingBtn.style.display = 'inline-flex';
});

window.addEventListener('appinstalled', (e) => {
    deferredPrompt = null;
    hideInstallUI();
    const floatingBtn = document.getElementById('floatingInstallBtn');
    if (floatingBtn) floatingBtn.style.display = 'none';
    console.log('PWA was installed');
});

function hideInstallUI() {
    if (document.getElementById('installBanner')) document.getElementById('installBanner').style.display = 'none';
    if (document.getElementById('navInstallTopBtn')) document.getElementById('navInstallTopBtn').style.display = 'none';
    if (document.getElementById('homeInstallCTA')) document.getElementById('homeInstallCTA').style.display = 'none';
    if (document.getElementById('floatingInstallBtn')) document.getElementById('floatingInstallBtn').style.display = 'none';
}

document.addEventListener('click', async (e) => {
    const installBtnIds = ['installAppMainBtn', 'navInstallTopBtn', 'homeInstallAppBtn', 'floatingInstallBtn'];
    const target = e.target.closest('#installAppMainBtn, #navInstallTopBtn, #homeInstallAppBtn, #floatingInstallBtn');
    
    if (target && installBtnIds.includes(target.id)) {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                hideInstallUI();
            }
            deferredPrompt = null;
        }
    }
});

// Dynamic Manifest for PWA Logo
function updateManifest() {
    const logoBase64 = localStorage.getItem('samagi_logo');
    const defaultIcon = 'icon.png';
    const iconToUse = logoBase64 ? logoBase64 : defaultIcon;
    
    let mimeType = "image/png";
    if (logoBase64 && logoBase64.startsWith("data:image/jpeg")) {
        mimeType = "image/jpeg";
    }

    const manifest = {
        name: "Samagi Society",
        short_name: "Samagi",
        start_url: "index.html",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0d9488",
        icons: [
            {
                src: iconToUse,
                sizes: "192x192",
                type: mimeType,
                purpose: "any"
            },
            {
                src: iconToUse,
                sizes: "192x192",
                type: mimeType,
                purpose: "maskable"
            },
            {
                src: iconToUse,
                sizes: "512x512",
                type: mimeType,
                purpose: "any"
            },
            {
                src: iconToUse,
                sizes: "512x512",
                type: mimeType,
                purpose: "maskable"
            }
        ]
    };

    const manifestString = JSON.stringify(manifest);
    const manifestURL = "data:application/json;charset=utf-8," + encodeURIComponent(manifestString);
    let link = document.querySelector('link[rel="manifest"]');
    if (link) {
        link.href = manifestURL;
    }
}

// Navigation Logic
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = e.target.getAttribute('data-section');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// Year Filters
function initYearFilters() {
    const yearSelect = document.getElementById('yearFilter');
    const startYear = 2007;
    for (let y = startYear; y <= currentYear + 1; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if (y === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    yearSelect.addEventListener('change', () => renderMembers());
}

// Member Management
function renderMembers() {
    const query = document.getElementById('memberSearch').value.toLowerCase();
    const selectedYear = parseInt(document.getElementById('yearFilter').value);
    const tbody = document.getElementById('memberTableBody');
    tbody.innerHTML = '';

    const filtered = members.filter(m => {
        const matchesQuery = m.name.toLowerCase().includes(query) || m.nic.toLowerCase().includes(query);
        const matchesYear = m.joinedYear <= selectedYear;
        return matchesQuery && matchesYear;
    });

    filtered.forEach((m, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.joinedYear}</td>
            <td>${m.nic}</td>
            <td><strong>${m.name}</strong><br><small>${m.address}</small></td>
            <td><a href="https://wa.me/${m.whatsapp}" target="_blank" style="color:var(--success);text-decoration:none;"><i class="fa-brands fa-whatsapp"></i> ${m.whatsapp}</a></td>
            <td>${m.dependents ? m.dependents.length : 0}</td>
            <td class="admin-only">
                <button class="btn btn-danger btn-sm" onclick="deleteMember('${m.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Search Event
document.getElementById('memberSearch').addEventListener('input', renderMembers);

// Add Member
const memberModal = document.getElementById('memberModal');
const addMemberBtn = document.getElementById('addMemberBtn');
const memberForm = document.getElementById('memberForm');

addMemberBtn.onclick = () => {
    document.getElementById('modalTitle').textContent = "Add New Member";
    memberForm.reset();
    document.getElementById('dependentsContainer').innerHTML = '';
    updateDepCount();
    memberModal.style.display = 'flex';
};

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function addDependentField(name = '', age = '', rel = '', addr = '') {
    const container = document.getElementById('dependentsContainer');
    const count = container.children.length;
    if (count >= 10) return alert(t("Maximum 10 dependents allowed"));

    const div = document.createElement('div');
    div.className = 'dependent-row';
    div.innerHTML = `
        <input type="text" placeholder="${currentLang === 'en' ? 'Dependent Name' : 'යැපෙන්නාගේ නම'}" value="${name}" required style="font-size:0.8rem;">
        <input type="number" placeholder="${currentLang === 'en' ? 'Age' : 'වයස'}" value="${age}" required style="font-size:0.8rem;">
        <input type="text" placeholder="${currentLang === 'en' ? 'Relationship' : 'ඥාතිත්වය'}" value="${rel}" required style="font-size:0.8rem;">
        <input type="text" placeholder="Address" value="${addr}" style="font-size:0.8rem;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove(); updateDepCount();"><i class="fa-solid fa-minus"></i></button>
    `;
    container.appendChild(div);
    updateDepCount();
}

function updateDepCount() {
    document.getElementById('depCount').textContent = document.getElementById('dependentsContainer').children.length;
}

memberForm.onsubmit = (e) => {
    e.preventDefault();
    const deps = [];
    document.querySelectorAll('.dependent-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        deps.push({
            name: inputs[0].value,
            age: inputs[1].value,
            relation: inputs[2].value,
            address: inputs[3].value
        });
    });

    const newMember = {
        name: document.getElementById('mName').value,
        nic: document.getElementById('mNIC').value,
        address: document.getElementById('mAddress').value,
        dob: document.getElementById('mDOB').value,
        whatsapp: document.getElementById('mWApp').value,
        phone: document.getElementById('mPhone').value,
        joinedYear: parseInt(document.getElementById('mJoinedYear').value),
        dependents: deps
    };

    db.collection('members').add(newMember).then(() => {
        closeModal('memberModal');
    }).catch(e => console.error(e));
};

function deleteMember(id) {
    if (confirm(t("Are you sure you want to remove this member?"))) {
        db.collection('members').doc(id).delete();
    }
}

// Financial Logic
function renderFinancials() {
    let totalSubscription = 0;
    let totalDeathContrib = 0;
    let totalMiscIncome = 0;
    let totalExpenses = 0;

    const monthlyFee = parseInt(document.getElementById('settingMonthlyFee').value) || 100;
    const dashboardYearEl = document.getElementById('dashboardYear');
    if (!dashboardYearEl.value) dashboardYearEl.value = currentYear;
    const selectedYear = parseInt(dashboardYearEl.value) || currentYear;

    // Calculate Subscriptions based on members active in THAT year
    const activeInYearCount = members.filter(m => m.joinedYear <= selectedYear).length;
    totalSubscription = activeInYearCount * monthlyFee * 12;

    // Auto-calculate Building Income if 2025 or 2026
    if (selectedYear === 2025) totalMiscIncome += 3000 * 12;
    else if (selectedYear === 2026) totalMiscIncome += 4500 * 12;

    // Process Manual Records
    financials.forEach(f => {
        if (f.year === selectedYear) {
            if (f.type === 'income') {
                totalMiscIncome += f.amount;
            } else {
                // If it's a death benefit payment, we also COLLECT 150 from others
                if (f.category.toLowerCase().includes('death')) {
                    const collectionFromOthers = (activeInYearCount - 1) * 150;
                    totalDeathContrib += collectionFromOthers;
                }
                totalExpenses += f.amount;
            }
        }
    });

    document.getElementById('totalFees').textContent = `Rs. ${totalSubscription.toLocaleString()}`;
    document.getElementById('totalDeathPay').textContent = `Rs. ${totalDeathContrib.toLocaleString()}`;
    document.getElementById('totalBuildingIncome').textContent = `Rs. ${totalMiscIncome.toLocaleString()}`;
    
    const grandBalance = (totalSubscription + totalMiscIncome + totalDeathContrib) - totalExpenses;
    document.getElementById('yearlyBalance').textContent = `Rs. ${grandBalance.toLocaleString()}`;
    document.getElementById('yearlyBalance').style.color = grandBalance >= 0 ? 'var(--success)' : 'var(--danger)';

    if (typeof renderFinanceRecords === 'function') renderFinanceRecords();
}

function renderFinanceRecords() {
    const tbody = document.getElementById('financeRecordsBody');
    tbody.innerHTML = '';
    const filterYear = parseInt(document.getElementById('recordFilterYear').value) || currentYear;
    
    const filteredRecords = financials.map((f, i) => ({f, i})).filter(x => x.f.year === filterYear);
    
    filteredRecords.slice(-10).reverse().forEach((item) => {
        const f = item.f;
        const index = item.i;
        const tr = document.createElement('tr');
        const displayDate = f.date ? f.date : f.year;
        tr.innerHTML = `
            <td>${displayDate}</td>
            <td>${f.category}</td>
            <td>${f.amount}</td>
            <td class="admin-only"><button class="btn btn-danger btn-sm" onclick="deleteFinance('${f.fbId}')"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteFinance(fbId) {
    if (confirm(t("Delete this record?"))) {
        db.collection('financials').doc(fbId).delete();
    }
}

document.getElementById('financeForm').onsubmit = (e) => {
    e.preventDefault();
    const dateVal = document.getElementById('financeDate').value;
    const yearVal = dateVal ? parseInt(dateVal.split('-')[0]) : currentYear;

    const selectVal = document.getElementById('financeCategorySelect').value;
    const customVal = document.getElementById('financeCategory').value;
    const finalCategory = (selectVal === 'Custom' || selectVal.includes('වෙනත්')) ? customVal : selectVal;

    const record = {
        date: dateVal,
        year: yearVal,
        type: document.getElementById('financeType').value,
        category: finalCategory,
        amount: parseInt(document.getElementById('financeAmount').value)
    };
    db.collection('financials').add(record).catch(e => console.error(e));
    e.target.reset();
    
    // reset form updates
    document.getElementById('financeDate').value = new Date().toISOString().split('T')[0];
    updateFinanceCategories();
};

window.updateFinanceCategories = function() {
    const type = document.getElementById('financeType').value;
    const select = document.getElementById('financeCategorySelect');
    if (!select) return;
    select.innerHTML = '';
    
    let options = [];
    if (type === 'income') {
        options = [
            'සාමාජික ගාස්තු / Member Fees', 
            'ගොඩනැගිලි කුලිය / Building Rent', 
            'වෙළඳාම / Trade', 
            'වෙනත් 1 / Other 1',
            'වෙනත් 2 / Other 2',
            'වෙනත් 3 / Other 3',
            'වෙනත් 4 / Other 4',
            'වෙනත් 5 / Other 5',
            'Custom'
        ];
    } else {
        options = [
            'විදුලිය / Electricity',
            'මරණාධාර / Death Donations',
            'ගමන් වියදම් / Travel Expenses',
            'මුද්‍රණ කටයුතු / Printing',
            'ලිපිද්‍රව්‍ය / Stationery',
            'වෙනත් 1 / Other 1',
            'වෙනත් 2 / Other 2',
            'වෙනත් 3 / Other 3',
            'වෙනත් 4 / Other 4',
            'වෙනත් 5 / Other 5',
            'Custom'
        ];
    }

    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt;
        el.textContent = opt;
        select.appendChild(el);
    });
    toggleFinanceCustomCategory();
};

window.toggleFinanceCustomCategory = function() {
    const select = document.getElementById('financeCategorySelect');
    const customInput = document.getElementById('financeCategory');
    if (select.value === 'Custom' || select.value.includes('වෙනත්')) {
        customInput.style.display = 'block';
        customInput.required = true;
        if (select.value !== 'Custom') {
            const matches = select.value.match(/වෙනත් \d+/);
            const prefix = matches ? matches[0] : select.value.split('/')[0].trim();
            if (!customInput.value.startsWith(prefix)) {
                customInput.value = prefix + ' - ';
            }
        } else {
            customInput.value = '';
        }
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
};

// Gallery Management
function renderGallery() {
    const container = document.getElementById('photoGallery');
    container.innerHTML = '';
    
    gallery.forEach(p => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <img src="${p.url}" alt="${p.title}">
            <div class="gallery-overlay">
                <strong>${p.title}</strong><br>
                <small>${p.date}</small>
                <button class="admin-only" onclick="deletePhoto('${p.fbId}')" style="background:transparent;border:none;color:white;cursor:pointer;float:right;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
}

document.getElementById('addPhotoBtn').onclick = () => {
    const title = prompt(t("Enter Event Name:"));
    const date = prompt(t("Enter Date (YYYY/MM/DD):"), new Date().toISOString().split('T')[0]);
    const url = prompt(t("Enter Image URL (or use a sample URL):"), "https://picsum.photos/400/300?random=" + Math.random());
    
    if (title && url) {
        db.collection('gallery').add({ title, date, url });
    }
};

function deletePhoto(fbId) {
    if (confirm(t("Delete this photo?"))) {
        db.collection('gallery').doc(fbId).delete();
    }
}

// Notice Templates
function prepareTemplate(type) {
    const msgArea = document.getElementById('noticeMessage');
    const msg = {
        fee: "Samagi Society: Reminder for monthly fee Rs. 100. Please pay to the Treasurer.",
        death: "Samagi Society: Urgent notice of a death. Collection of Rs. 150 from each member. Pls contribute.",
        meeting: "Samagi Society: General meeting will be held this Sunday at 4.00 PM at the society building."
    };
    msgArea.value = msg[type] || "";
}

document.getElementById('sendToAllBtn').onclick = () => {
    const msg = encodeURIComponent(document.getElementById('noticeMessage').value);
    if (members.length === 0) return alert(t("No members found."));
    
    const choice = confirm(t("Send via WhatsApp? (Click 'Cancel' for SMS)"));
    const firstMember = members[0].whatsapp || members[0].phone;
    
    if (choice) {
        window.open(`https://wa.me/${firstMember}?text=${msg}`, '_blank');
    } else {
        window.open(`sms:${firstMember}?body=${msg}`, '_blank');
    }
};

// Theme Toggle
document.getElementById('themeToggle').onclick = () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    document.querySelector('#themeToggle i').className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

// Manual Page Refresh
document.getElementById('refreshBtn').onclick = () => {
    window.location.reload();
};


// Logo Upload
document.getElementById('logo-container').onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            db.collection('settings').doc('logo').set({ url: reader.result });
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

function updateFavicon(src) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = src;
}

// Home Data Management
function loadHomeData() {
    document.getElementById('edit-president').value = homeData.pres || '';
    document.getElementById('edit-president-wa').value = homeData.presWA || '';
    document.getElementById('edit-secretary').value = homeData.sec || '';
    document.getElementById('edit-secretary-wa').value = homeData.secWA || '';
    document.getElementById('edit-treasurer').value = homeData.tres || '';
    document.getElementById('edit-treasurer-wa').value = homeData.tresWA || '';
    document.getElementById('society-address').textContent = homeData.addr || '';
}

document.getElementById('saveHomeBtn').onclick = () => {
    const updatedHomeData = {
        pres: document.getElementById('edit-president').value,
        presWA: document.getElementById('edit-president-wa').value,
        sec: document.getElementById('edit-secretary').value,
        secWA: document.getElementById('edit-secretary-wa').value,
        tres: document.getElementById('edit-treasurer').value,
        tresWA: document.getElementById('edit-treasurer-wa').value,
        addr: document.getElementById('society-address').textContent
    };
    db.collection('settings').doc('home').set(updatedHomeData).then(() => {
        alert(t("Home page details saved!"));
    });
};

// Committee Management
function renderCommittee() {
    const tbody = document.getElementById('committee-tbody');
    tbody.innerHTML = '';
    committee.forEach((c, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${c.pos}" onchange="updateCommittee('${c.fbId}', 'pos', this.value)" style="width:100%; border:none; background:transparent;"></td>
            <td><input type="text" value="${c.name}" onchange="updateCommittee('${c.fbId}', 'name', this.value)" style="width:100%; border:none; background:transparent;"></td>
            <td><input type="text" value="${c.wa}" onchange="updateCommittee('${c.fbId}', 'wa', this.value)" style="width:100%; border:none; background:transparent;"></td>
            <td class="admin-only"><button class="btn btn-danger btn-sm" onclick="deleteCommittee('${c.fbId}')"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addCommitteeRow() {
    db.collection('committee').add({ pos: 'New Role', name: '-', wa: '-', order: committee.length });
}

function updateCommittee(fbId, field, value) {
    db.collection('committee').doc(fbId).update({ [field]: value });
}

function deleteCommittee(fbId) {
    if (confirm(t("Delete this official?"))) {
        db.collection('committee').doc(fbId).delete();
    }
}

