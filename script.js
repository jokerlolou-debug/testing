// Get elements
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboardPage = document.getElementById('dashboardPage');
const trackingPage = document.getElementById('trackingPage');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const siasatanForm = document.getElementById('siasatanForm');
const trackingForm = document.getElementById('trackingForm');
const modalSearchForm = document.getElementById('modalSearchForm');
const logoutBtn = document.getElementById('logoutBtn');
const backToDashboard = document.getElementById('backToDashboard');

const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Modal elements
const searchModal = document.getElementById('searchModal');
const closeModal = document.getElementById('closeModal');

// Initialize users from localStorage
let siasatanRecords = JSON.parse(localStorage.getItem('siasatanRecords')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Storage limit constants (2GB in bytes)
const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
const WARNING_THRESHOLD = 0.8; // 80%

// Function to calculate localStorage size
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total * 2; // UTF-16 uses 2 bytes per character
}

// Function to check storage and show warning
function checkStorageLimit() {
    const currentSize = getLocalStorageSize();
    const usagePercent = (currentSize / STORAGE_LIMIT) * 100;
    
    if (usagePercent >= WARNING_THRESHOLD * 100) {
        const remainingMB = ((STORAGE_LIMIT - currentSize) / (1024 * 1024)).toFixed(2);
        alert(`⚠️ AMARAN PENYIMPANAN!\n\nPenggunaan penyimpanan: ${usagePercent.toFixed(1)}%\nBaki ruang: ${remainingMB} MB\n\nSila padam rekod lama jika perlu.`);
    }
}

// Function to format bytes to readable format
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to update storage display
function updateStorageDisplay() {
    const storageBar = document.getElementById('storageBar');
    const storageText = document.getElementById('storageText');
    
    if (storageBar && storageText) {
        const currentSize = getLocalStorageSize();
        const usagePercent = (currentSize / STORAGE_LIMIT) * 100;
        const usedMB = (currentSize / (1024 * 1024)).toFixed(2);
        const totalGB = (STORAGE_LIMIT / (1024 * 1024 * 1024)).toFixed(1);
        
        storageBar.style.width = Math.min(usagePercent, 100) + '%';
        
        // Change color based on usage
        if (usagePercent >= 90) {
            storageBar.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        } else if (usagePercent >= WARNING_THRESHOLD * 100) {
            storageBar.style.background = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
        } else {
            storageBar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        storageText.textContent = `${usedMB} MB digunakan daripada ${totalGB} GB (${usagePercent.toFixed(1)}%)`;
    }
}

// Show page function
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
}

// Show register page
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(registerPage);
});

// Show login page
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(loginPage);
});

// Handle registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const namaPegawai = document.getElementById('namaPegawai').value.trim();
    const noBadan = document.getElementById('noBadan').value.trim();
    const bahagian = document.getElementById('bahagian').value.trim();
    
    // Check if user already exists
    const existingUser = users.find(user => user.noBadan === noBadan);
    
    if (existingUser) {
        alert('No. Badan ini sudah didaftarkan!');
        return;
    }
    
    // Add new user
    const newUser = {
        namaPegawai,
        noBadan,
        bahagian
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Pendaftaran berjaya! Sila log masuk menggunakan No. Badan anda.');
    
    // Clear form
    registerForm.reset();
    
    // Show login page
    showPage(loginPage);
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const loginBadan = document.getElementById('loginBadan').value.trim();
    
    // Find user
    const user = users.find(u => u.noBadan === loginBadan);
    
    if (user) {
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Display user info
        document.getElementById('displayNama').textContent = user.namaPegawai;
        document.getElementById('displayBadan').textContent = user.noBadan;
        document.getElementById('displayBahagian').textContent = user.bahagian;
        
        // Clear form
        loginForm.reset();
        
        // Show dashboard
        showPage(dashboardPage);
        
        // Display records
        displayRecords();
    } else {
        alert('No. Badan tidak dijumpai! Sila daftar terlebih dahulu.');
    }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    showPage(loginPage);
});

// Generate QR Code on page load
window.addEventListener('DOMContentLoaded', function() {
    generateSearchQRCode();
});

// Function to generate QR code for search
function generateSearchQRCode() {
    const qrcodeDiv = document.getElementById('qrcode');
    if (qrcodeDiv) {
        // Clear existing QR code
        qrcodeDiv.innerHTML = '';
        
        // Get current page URL
        const currentURL = window.location.href.split('?')[0];
        const qrURL = currentURL + '?action=search';
        
        // Generate QR code
        const qrcode = new QRCode(qrcodeDiv, {
            text: qrURL,
            width: 200,
            height: 200,
            colorDark: "#667eea",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Add click event to QR code
        qrcodeDiv.addEventListener('click', function() {
            openSearchModal();
        });
    }
}

// Open search modal
function openSearchModal() {
    searchModal.style.display = 'block';
    // Focus on input after modal opens
    setTimeout(() => {
        document.getElementById('modalSearchKS').focus();
    }, 100);
}

// Close modal when clicking X
closeModal.addEventListener('click', function() {
    searchModal.style.display = 'none';
    document.getElementById('modalSearchForm').reset();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === searchModal) {
        searchModal.style.display = 'none';
        document.getElementById('modalSearchForm').reset();
    }
});

// Check if page was opened via QR code
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'search') {
        openSearchModal();
    }
});

// Handle modal search form submission
modalSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const searchBadan = document.getElementById('modalSearchKS').value.trim();
    
    // Close modal
    searchModal.style.display = 'none';
    
    // Perform search
    performSearch(searchBadan);
});

// Handle search function (original search logic)
function performSearch(searchBadan) {
    const searchResult = document.getElementById('searchResult');
    const loginCard = document.querySelector('.login-card');
    const searchCard = document.querySelector('.search-card');
    
    // Find all records by No. Badan
    const records = siasatanRecords.filter(r => r.noBadan.toLowerCase() === searchBadan.toLowerCase());
    
    if (records.length > 0) {
        // Hide login card and search card
        if (loginCard) {
            loginCard.style.display = 'none';
        }
        if (searchCard) {
            searchCard.style.display = 'none';
        }
        
        searchResult.style.display = 'block';
        searchResult.style.background = '#ffffff';
        searchResult.style.border = '1px solid #c3e6cb';
        searchResult.style.color = '#155724';
        searchResult.style.padding = '20px';
        
        // Get user info from the first record
        const userInfo = records[0];
        
        let recordsHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #155724;">${records.length} Kertas Siasatan Dijumpai</h4>
                <button id="btnKembaliSearch" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">Kembali</button>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 1rem;"><strong style="color: #667eea;">Nama Pegawai:</strong> ${userInfo.submittedBy}</p>
                <p style="margin: 0 0 8px 0; font-size: 1rem;"><strong style="color: #667eea;">No. Badan:</strong> ${userInfo.noBadan}</p>
                <p style="margin: 0; font-size: 1rem;"><strong style="color: #667eea;">Bahagian:</strong> ${userInfo.bahagian}</p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">BIL</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">NO. KERTAS SIASATAN</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">TARIKH K/S</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">NO. REPORT</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">SEKSYEN</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">PERGERAKAN AKHIR</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">TARIKH KEMASKINI</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        records.forEach((record, index) => {
            // Get last tracking entry
            let pergerakanAkhir = '-';
            let tarikhKemaskini = record.timestamp;
            let lastUpdateDate = new Date(record.timestamp.replace(' (Dikemaskini)', ''));
            
            if (record.tracking && record.tracking.length > 0) {
                const lastTracking = record.tracking[record.tracking.length - 1];
                
                // Determine the last position based on which field has data (in order)
                const fieldOrder = [
                    { key: 'lainLain', label: 'Lain-lain' },
                    { key: 'kusFile', label: 'KUS/FILE' },
                    { key: 'mahkamah', label: 'Mahkamah' },
                    { key: 'tpr', label: 'TPR' },
                    { key: 'ipk', label: 'IPK' },
                    { key: 'sio', label: 'SIO' },
                    { key: 'io', label: 'IO' },
                    { key: 'pergerakan', label: 'Pergerakan' }
                ];
                
                // Find the last field with data
                for (const field of fieldOrder) {
                    if (lastTracking[field.key] && lastTracking[field.key].trim() !== '' && lastTracking[field.key].trim() !== '-') {
                        pergerakanAkhir = field.label;
                        break;
                    }
                }
                
                tarikhKemaskini = record.timestamp + ' (Dikemaskini)';
            }
            
            // Check if 3 months have passed since last update
            const currentDate = new Date();
            const monthsDiff = (currentDate.getFullYear() - lastUpdateDate.getFullYear()) * 12 + 
                             (currentDate.getMonth() - lastUpdateDate.getMonth());
            const isOverdue = monthsDiff >= 3;
            const dateColor = isOverdue ? '#dc3545' : '#333';
            const dateFontWeight = isOverdue ? 'bold' : 'normal';
            
            recordsHTML += `
                <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #333;">${index + 1}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${record.noKertasSiasatan}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #333; font-size: 0.9rem;">${record.timestamp}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${record.noReport}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${record.seksyen}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${pergerakanAkhir}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: ${dateColor}; font-size: 0.9rem; font-weight: ${dateFontWeight};">${tarikhKemaskini}</td>
                </tr>
            `;
        });
        
        recordsHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        searchResult.innerHTML = recordsHTML;
        
        // Add event listener to Kembali button
        const btnKembaliSearch = document.getElementById('btnKembaliSearch');
        if (btnKembaliSearch) {
            btnKembaliSearch.addEventListener('click', () => {
                searchResult.style.display = 'none';
                searchResult.innerHTML = '';
                // Show login card and search card again
                const loginCard = document.querySelector('.login-card');
                const searchCard = document.querySelector('.search-card');
                if (loginCard) {
                    loginCard.style.display = 'block';
                }
                if (searchCard) {
                    searchCard.style.display = 'block';
                }
            });
        }
    } else {
        searchResult.style.display = 'block';
        searchResult.style.background = '#f8d7da';
        searchResult.style.border = '1px solid #f5c6cb';
        searchResult.style.color = '#721c24';
        searchResult.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 50px; color: #dc3545; margin-bottom: 15px;"></i>
                <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">Tiada Kertas Siasatan dijumpai untuk No. Badan ini.</p>
                <p style="margin: 10px 0 0 0; font-size: 0.9rem;">Sila semak semula No. Badan.</p>
                <button id="btnKembaliNotFound" style="margin-top: 20px; padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600;">Kembali</button>
            </div>
        `;
        
        // Add event listener to Kembali button
        const btnKembaliNotFound = document.getElementById('btnKembaliNotFound');
        if (btnKembaliNotFound) {
            btnKembaliNotFound.addEventListener('click', () => {
                searchResult.style.display = 'none';
                searchResult.innerHTML = '';
            });
        }
    }
    
    // Clear modal form
    document.getElementById('modalSearchForm').reset();
}

// Handle kertas siasatan form
siasatanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (editingRecordId) {
        // Update existing record
        const recordIndex = siasatanRecords.findIndex(r => r.id === editingRecordId);
        
        if (recordIndex !== -1) {
            siasatanRecords[recordIndex] = {
                ...siasatanRecords[recordIndex],
                pegawaiPenyiasat: document.getElementById('pegawaiPenyiasat').value.trim(),
                noKertasSiasatan: document.getElementById('noKertasSiasatan').value.trim(),
                noReport: document.getElementById('noReport').value.trim(),
                seksyen: document.getElementById('seksyen').value.trim(),
                timestamp: new Date().toLocaleString('ms-MY') + ' (Dikemaskini)'
            };
            
            localStorage.setItem('siasatanRecords', JSON.stringify(siasatanRecords));
            alert('Rekod berjaya dikemaskini!');
            
            // Check storage limit
            checkStorageLimit();
        }
        
        // Reset editing mode
        editingRecordId = null;
        const submitBtn = siasatanForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Simpan Rekod';
        submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
    } else {
        // Create new record
        const newRecord = {
            id: Date.now(),
            pegawaiPenyiasat: document.getElementById('pegawaiPenyiasat').value.trim(),
            noKertasSiasatan: document.getElementById('noKertasSiasatan').value.trim(),
            noReport: document.getElementById('noReport').value.trim(),
            seksyen: document.getElementById('seksyen').value.trim(),
            submittedBy: currentUser.namaPegawai,
            noBadan: currentUser.noBadan,
            bahagian: currentUser.bahagian,
            timestamp: new Date().toLocaleString('ms-MY')
        };
        
        siasatanRecords.push(newRecord);
        localStorage.setItem('siasatanRecords', JSON.stringify(siasatanRecords));
        alert('Rekod berjaya disimpan!');
        
        // Check storage limit
        checkStorageLimit();
    }
    
    // Clear form
    siasatanForm.reset();
    
    // Refresh records display
    displayRecords();
});

// Function to display records
function displayRecords() {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter records for current user only
    const userRecords = siasatanRecords.filter(record => record.noBadan === currentUser.noBadan);
    
    if (userRecords.length === 0) {
        recordsList.innerHTML = '<p style="text-align: center; color: #999;">Tiada rekod lagi.</p>';
        return;
    }
    
    // Display records in reverse order (newest first)
    userRecords.slice().reverse().forEach((record) => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record-card';
        recordDiv.style.cssText = `
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        `;
        
        const qrId = `qr-${record.id}`;
        const recordData = `
Pegawai Penyiasat: ${record.pegawaiPenyiasat}
No. Kertas Siasatan: ${record.noKertasSiasatan}
No. Report: ${record.noReport}
Seksyen: ${record.seksyen}
Dikemukakan oleh: ${record.submittedBy}
Bahagian: ${record.bahagian}
Tarikh: ${record.timestamp}
        `.trim();
        
        recordDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
                <div style="flex: 1;">
                    <p style="margin-bottom: 10px;"><strong style="color: #667eea;">Pegawai Penyiasat:</strong> ${record.pegawaiPenyiasat}</p>
                    <p style="margin-bottom: 10px;"><strong style="color: #667eea;">No. Kertas Siasatan:</strong> ${record.noKertasSiasatan}</p>
                    <p style="margin-bottom: 10px;"><strong style="color: #667eea;">No. Report:</strong> ${record.noReport}</p>
                    <p style="margin-bottom: 10px;"><strong style="color: #667eea;">Seksyen:</strong> ${record.seksyen}</p>
                    <p style="margin-bottom: 10px; font-size: 0.9rem; color: #666;"><strong>Dikemukakan oleh:</strong> ${record.submittedBy} (${record.noBadan})</p>
                    <p style="margin-bottom: 10px; font-size: 0.9rem; color: #666;"><strong>Bahagian:</strong> ${record.bahagian}</p>
                    <p style="font-size: 0.85rem; color: #999;"><strong>Tarikh:</strong> ${record.timestamp}</p>
                    <button class="btn-edit" data-id="${record.id}" style="margin-top: 15px; padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Kemaskini</button>
                </div>
                <div style="text-align: center;">
                    <div id="${qrId}" style="background: white; padding: 10px; border-radius: 5px;"></div>
                    <p style="font-size: 0.75rem; color: #666; margin-top: 5px;">Imbas QR Code</p>
                    <button class="btn-print-qr" data-qr-id="${qrId}" data-ks="${record.noKertasSiasatan}" style="margin-top: 10px; padding: 6px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; display: block; width: 100%;">Cetak QR</button>
                    <button class="btn-delete" data-id="${record.id}" data-ks="${record.noKertasSiasatan}" style="margin-top: 5px; padding: 6px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; display: block; width: 100%;">Padam</button>
                </div>
            </div>
        `;
        
        recordsList.appendChild(recordDiv);
        
        // Generate QR code with URL to tracking page
        const trackingUrl = `${window.location.origin}${window.location.pathname}?track=${record.id}`;
        new QRCode(document.getElementById(qrId), {
            text: trackingUrl,
            width: 120,
            height: 120,
            colorDark: "#667eea",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            editRecord(recordId);
        });
    
    // Add event listeners to print QR buttons
    document.querySelectorAll('.btn-print-qr').forEach(btn => {
        btn.addEventListener('click', function() {
            const qrId = this.getAttribute('data-qr-id');
            const ksNumber = this.getAttribute('data-ks');
            printQRCode(qrId, ksNumber);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            const ksNumber = this.getAttribute('data-ks');
            deleteRecord(recordId, ksNumber);
        });
    });
    });
}

// Variable to track if we're editing
let editingRecordId = null;
let currentTrackingRecordId = null;

// Function to print QR code
function printQRCode(qrId, ksNumber) {
    const qrElement = document.getElementById(qrId);
    
    if (qrElement) {
        const printWindow = window.open('', '', 'width=400,height=500');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak QR Code - ${ksNumber}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    h2 {
                        color: #667eea;
                        margin-bottom: 10px;
                    }
                    .qr-container {
                        background: white;
                        padding: 20px;
                        border: 2px solid #667eea;
                        border-radius: 10px;
                        text-align: center;
                    }
                    p {
                        margin-top: 15px;
                        font-size: 14px;
                        color: #666;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <h2>REKOD MANUAL KEPADA KECEMERLANGAN DIGITAL</h2>
                <div class="qr-container">
                    ${qrElement.innerHTML}
                </div>
                <p><strong>No. Kertas Siasatan:</strong> ${ksNumber}</p>
                <p style="font-size: 12px; margin-top: 20px;">Imbas QR Code untuk kemaskini pergerakan</p>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Function to delete a record
function deleteRecord(recordId, ksNumber) {
    if (confirm(`Adakah anda pasti mahu memadam Kertas Siasatan ${ksNumber}?\n\nAmaran: Tindakan ini tidak boleh dibatalkan!`)) {
        // Find and remove the record
        const recordIndex = siasatanRecords.findIndex(r => r.id === recordId);
        
        if (recordIndex !== -1) {
            siasatanRecords.splice(recordIndex, 1);
            localStorage.setItem('siasatanRecords', JSON.stringify(siasatanRecords));
            alert('Rekod berjaya dipadam!');
            
            // Refresh records display
            displayRecords();
        } else {
            alert('Ralat: Rekod tidak dijumpai!');
        }
    }
}

// Function to edit a record (opens tracking page)
function editRecord(recordId) {
    const record = siasatanRecords.find(r => r.id === recordId);
    
    if (record) {
        currentTrackingRecordId = recordId;
        
        // Initialize tracking array if doesn't exist
        if (!record.tracking) {
            record.tracking = [];
        }
        
        // Display record info
        document.getElementById('trackingNoKS').textContent = record.noKertasSiasatan;
        document.getElementById('trackingPegawai').textContent = record.pegawaiPenyiasat;
        
        // Display tracking table
        displayTrackingTable(record.tracking);
        
        // Show tracking page
        showPage(trackingPage);
    }
}

// Function to display tracking table
function displayTrackingTable(trackingData) {
    const tbody = document.getElementById('trackingTableBody');
    tbody.innerHTML = '';
    
    if (trackingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; text-align: center; color: #999;">Tiada pergerakan lagi.</td></tr>';
        return;
    }
    
    trackingData.forEach((track, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-index', index);
        row.innerHTML = `
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="pergerakan">${track.pergerakan}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="io">${track.io}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="sio">${track.sio}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="ipk">${track.ipk}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="tpr">${track.tpr}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="mahkamah">${track.mahkamah}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="kusFile">${track.kusFile}</td>
            <td style="padding: 12px; border: 1px solid #ddd;" data-field="lainLain">${track.lainLain || '-'}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                <button class="btn-edit-row" onclick="editTrackingRow(${index})" style="padding: 6px 12px; background: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-right: 5px;">Edit</button>
                <button class="btn-save-row" onclick="saveTrackingRow(${index})" style="display: none; padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-right: 5px;">Simpan</button>
                <button class="btn-cancel-row" onclick="cancelEditTrackingRow(${index})" style="display: none; padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Batal</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Handle tracking form submission
trackingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const record = siasatanRecords.find(r => r.id === currentTrackingRecordId);
    
    if (record) {
        const newTracking = {
            pergerakan: document.getElementById('pergerakan').value.trim(),
            io: document.getElementById('io').value.trim(),
            sio: document.getElementById('sio').value.trim(),
            ipk: document.getElementById('ipk').value.trim(),
            tpr: document.getElementById('tpr').value.trim(),
            mahkamah: document.getElementById('mahkamah').value.trim(),
            kusFile: document.getElementById('kusFile').value.trim(),
            lainLain: document.getElementById('lainLain').value.trim()
        };
        
        if (!record.tracking) {
            record.tracking = [];
        }
        
        record.tracking.push(newTracking);
        localStorage.setItem('siasatanRecords', JSON.stringify(siasatanRecords));
        
        alert('Pergerakan berjaya ditambah!');
        trackingForm.reset();
        displayTrackingTable(record.tracking);
        
        // Check storage limit
        checkStorageLimit();
    }
});

// Back to dashboard button
backToDashboard.addEventListener('click', () => {
    showPage(dashboardPage);
    displayRecords();
});

// Check if user is already logged in
window.addEventListener('load', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Check for tracking parameter in URL (from QR code scan)
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('track');
    
    if (currentUser) {
        document.getElementById('displayNama').textContent = currentUser.namaPegawai;
        document.getElementById('displayBadan').textContent = currentUser.noBadan;
        document.getElementById('displayBahagian').textContent = currentUser.bahagian;
        showPage(dashboardPage);
        displayRecords();
        
        // If tracking ID exists, open tracking page
        if (trackId) {
            const recordId = parseInt(trackId);
            const record = siasatanRecords.find(r => r.id === recordId);
            
            if (record) {
                // Small delay to ensure page is loaded
                setTimeout(() => {
                    editRecord(recordId);
                    // Clear URL parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 100);
            }
        }
    } else if (trackId) {
        // If not logged in but has tracking ID, verify user first
        const noBadanInput = prompt('Sila masukkan No. Badan anda untuk akses:');
        
        if (noBadanInput) {
            const trimmedInput = noBadanInput.trim();
            const userExists = users.find(u => u.noBadan === trimmedInput);
            
            if (userExists) {
                const recordId = parseInt(trackId);
                const record = siasatanRecords.find(r => r.id === recordId);
                
                if (record) {
                    currentTrackingRecordId = recordId;
                    
                    // Initialize tracking array if doesn't exist
                    if (!record.tracking) {
                        record.tracking = [];
                    }
                    
                    // Display record info
                    document.getElementById('trackingNoKS').textContent = record.noKertasSiasatan;
                    document.getElementById('trackingPegawai').textContent = record.pegawaiPenyiasat;
                    
                    // Display tracking table
                    displayTrackingTable(record.tracking);
                    
                    // Show tracking page
                    showPage(trackingPage);
                    
                    // Clear URL parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    alert('Rekod tidak dijumpai.');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                alert('No. Badan tidak sah atau belum didaftar. Sila daftar terlebih dahulu.');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            // User cancelled or didn't enter anything
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});

// Function to edit tracking row
function editTrackingRow(index) {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (!row) return;
    
    const cells = row.querySelectorAll('td[data-field]');
    const originalValues = {};
    
    cells.forEach(cell => {
        const field = cell.getAttribute('data-field');
        const value = cell.textContent === '-' ? '' : cell.textContent;
        originalValues[field] = value;
        
        // Replace cell content with input
        cell.innerHTML = `<input type="text" value="${value}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">`;
    });
    
    // Store original values in row dataset
    row.dataset.originalValues = JSON.stringify(originalValues);
    
    // Toggle buttons
    row.querySelector('.btn-edit-row').style.display = 'none';
    row.querySelector('.btn-save-row').style.display = 'inline-block';
    row.querySelector('.btn-cancel-row').style.display = 'inline-block';
}

// Function to save tracking row
function saveTrackingRow(index) {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (!row) return;
    
    const record = siasatanRecords.find(r => r.id === currentTrackingRecordId);
    if (!record || !record.tracking[index]) return;
    
    const cells = row.querySelectorAll('td[data-field]');
    const updatedValues = {};
    
    cells.forEach(cell => {
        const field = cell.getAttribute('data-field');
        const input = cell.querySelector('input');
        const value = input ? input.value.trim() : cell.textContent;
        updatedValues[field] = value;
        
        // Replace input with text
        cell.textContent = value || '-';
    });
    
    // Update the tracking data
    record.tracking[index] = updatedValues;
    localStorage.setItem('siasatanRecords', JSON.stringify(siasatanRecords));
    
    // Toggle buttons
    row.querySelector('.btn-edit-row').style.display = 'inline-block';
    row.querySelector('.btn-save-row').style.display = 'none';
    row.querySelector('.btn-cancel-row').style.display = 'none';
    
    alert('Pergerakan berjaya dikemaskini!');
    
    // Check storage limit
    checkStorageLimit();
}

// Function to cancel edit tracking row
function cancelEditTrackingRow(index) {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (!row) return;
    
    const originalValues = JSON.parse(row.dataset.originalValues || '{}');
    const cells = row.querySelectorAll('td[data-field]');
    
    cells.forEach(cell => {
        const field = cell.getAttribute('data-field');
        const value = originalValues[field] || '-';
        cell.textContent = value;
    });
    
    // Toggle buttons
    row.querySelector('.btn-edit-row').style.display = 'inline-block';
    row.querySelector('.btn-save-row').style.display = 'none';
    row.querySelector('.btn-cancel-row').style.display = 'none';
}
