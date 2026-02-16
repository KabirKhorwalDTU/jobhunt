// Sample data for variants
let variants = [
    {
        id: 1,
        internalName: 'upi_promo_v1',
        displayName: 'UPI Promotion Banner',
        bannerCount: 5,
        view: 'BOTTOM',
        status: 'active',
        states: ['maharashtra', 'karnataka'],
        cities: ['mumbai', 'bangalore'],
        warehouses: ['wh_mumbai_01'],
        clusters: ['cluster_west'],
        userRanks: ['gold', 'platinum'],
        bannerIds: 'BNR001, BNR002, BNR003, BNR004, BNR005'
    },
    {
        id: 2,
        internalName: 'card_offer_test',
        displayName: 'Card Offer Test',
        bannerCount: 3,
        view: 'TOP',
        status: 'draft',
        states: ['delhi'],
        cities: ['delhi'],
        warehouses: [],
        clusters: [],
        userRanks: ['new_user'],
        bannerIds: 'BNR010, BNR011, BNR012'
    },
    {
        id: 3,
        internalName: 'gpay_activation',
        displayName: 'Google Pay Activation',
        bannerCount: 8,
        view: 'BOTTOM',
        status: 'active',
        states: ['tamil_nadu', 'karnataka'],
        cities: ['chennai', 'bangalore'],
        warehouses: ['wh_chennai_01', 'wh_bangalore_01'],
        clusters: ['cluster_south'],
        userRanks: ['silver', 'gold'],
        bannerIds: 'BNR020, BNR021, BNR022, BNR023, BNR024, BNR025, BNR026, BNR027'
    },
    {
        id: 4,
        internalName: 'wallet_promo_north',
        displayName: 'Wallet Promo North',
        bannerCount: 4,
        view: 'FLOATING',
        status: 'inactive',
        states: ['uttar_pradesh', 'rajasthan'],
        cities: ['jaipur'],
        warehouses: [],
        clusters: ['cluster_north'],
        userRanks: ['bronze', 'silver'],
        bannerIds: 'BNR030, BNR031, BNR032, BNR033'
    },
    {
        id: 5,
        internalName: 'cod_to_online',
        displayName: 'COD to Online Payment',
        bannerCount: 6,
        view: 'MIDDLE',
        status: 'active',
        states: ['gujarat', 'maharashtra'],
        cities: ['ahmedabad', 'pune'],
        warehouses: ['wh_mumbai_02'],
        clusters: ['cluster_west', 'cluster_central'],
        userRanks: ['new_user', 'bronze'],
        bannerIds: 'BNR040, BNR041, BNR042, BNR043, BNR044, BNR045'
    },
    {
        id: 6,
        internalName: 'bnpl_awareness',
        displayName: 'Buy Now Pay Later',
        bannerCount: 7,
        view: 'BOTTOM',
        status: 'active',
        states: ['karnataka', 'telangana'],
        cities: ['bangalore', 'hyderabad'],
        warehouses: ['wh_bangalore_01', 'wh_hyderabad_01'],
        clusters: ['cluster_south'],
        userRanks: ['gold', 'platinum', 'vip'],
        bannerIds: 'BNR050, BNR051, BNR052, BNR053, BNR054, BNR055, BNR056'
    },
    {
        id: 7,
        internalName: 'paytm_cashback',
        displayName: 'Paytm Cashback Banner',
        bannerCount: 2,
        view: 'TOP',
        status: 'draft',
        states: ['delhi', 'uttar_pradesh'],
        cities: ['delhi'],
        warehouses: ['wh_delhi_01'],
        clusters: ['cluster_north'],
        userRanks: ['silver'],
        bannerIds: 'BNR060, BNR061'
    },
    {
        id: 8,
        internalName: 'phonepe_exclusive',
        displayName: 'PhonePe Exclusive',
        bannerCount: 10,
        view: 'BOTTOM',
        status: 'active',
        states: ['maharashtra', 'karnataka', 'tamil_nadu'],
        cities: ['mumbai', 'bangalore', 'chennai'],
        warehouses: [],
        clusters: ['cluster_south', 'cluster_west'],
        userRanks: ['platinum', 'vip'],
        bannerIds: 'BNR070, BNR071, BNR072, BNR073, BNR074, BNR075, BNR076, BNR077, BNR078, BNR079'
    }
];

let currentEditId = null;
let deleteId = null;

// DOM Elements
const listView = document.getElementById('listView');
const formView = document.getElementById('formView');
const variantsTableBody = document.getElementById('variantsTableBody');
const searchInput = document.getElementById('searchInput');
const createVariantBtn = document.getElementById('createVariantBtn');
const backBtn = document.getElementById('backBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const variantForm = document.getElementById('variantForm');
const formTitle = document.getElementById('formTitle');
const toast = document.getElementById('toast');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    setupEventListeners();
});

// Render table
function renderTable(data = variants) {
    variantsTableBody.innerHTML = data.map(variant => `
        <tr>
            <td><strong>${variant.internalName}</strong></td>
            <td class="banner-count">${variant.bannerCount} banners</td>
            <td><span class="view-badge">${variant.view}</span></td>
            <td><span class="status-badge ${variant.status}">${capitalizeFirst(variant.status)}</span></td>
            <td>
                <button class="action-btn" onclick="editVariant(${variant.id})" title="Edit">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn" onclick="duplicateVariant(${variant.id})" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn delete" onclick="showDeleteModal(${variant.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = variants.filter(v =>
            v.internalName.toLowerCase().includes(query) ||
            v.displayName.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

    // Create new variant
    createVariantBtn.addEventListener('click', () => {
        currentEditId = null;
        formTitle.textContent = 'Create New Variant';
        document.querySelector('.card-subtitle').textContent = 'Configure a new payment banner variant';
        resetForm();
        showFormView();
    });

    // Back button
    backBtn.addEventListener('click', showListView);

    // Cancel button
    cancelBtn.addEventListener('click', showListView);

    // Save draft
    saveDraftBtn.addEventListener('click', () => {
        document.getElementById('status').value = 'draft';
        saveVariant();
    });

    // Form submit
    variantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveVariant();
    });

    // Delete confirmation
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteId !== null) {
            variants = variants.filter(v => v.id !== deleteId);
            renderTable();
            closeDeleteModal();
            showToast('Variant deleted successfully!');
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }
    });

    // Banner IDs input - update preview
    document.getElementById('bannerIds').addEventListener('input', updateBannerPreview);
}

// View switching
function showListView() {
    listView.classList.remove('hidden');
    formView.classList.add('hidden');
}

function showFormView() {
    listView.classList.add('hidden');
    formView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Edit variant
function editVariant(id) {
    currentEditId = id;
    const variant = variants.find(v => v.id === id);
    if (!variant) return;

    formTitle.textContent = 'Edit Variant';
    document.querySelector('.card-subtitle').textContent = 'Update payment banner variant settings';

    // Fill form
    document.getElementById('internalName').value = variant.internalName;
    document.getElementById('displayName').value = variant.displayName;
    document.getElementById('viewPosition').value = variant.view;
    document.getElementById('status').value = variant.status;
    document.getElementById('bannerIds').value = variant.bannerIds;

    // Set multi-select values
    setMultiSelectValues('statesDropdown', variant.states);
    setMultiSelectValues('citiesDropdown', variant.cities);
    setMultiSelectValues('warehousesDropdown', variant.warehouses);
    setMultiSelectValues('clustersDropdown', variant.clusters);
    setMultiSelectValues('userRanksDropdown', variant.userRanks);

    updateBannerPreview();
    showFormView();
}

// Duplicate variant
function duplicateVariant(id) {
    const variant = variants.find(v => v.id === id);
    if (!variant) return;

    const newVariant = {
        ...variant,
        id: Math.max(...variants.map(v => v.id)) + 1,
        internalName: variant.internalName + '_copy',
        displayName: variant.displayName + ' (Copy)',
        status: 'draft'
    };

    variants.push(newVariant);
    renderTable();
    showToast('Variant duplicated successfully!');
}

// Save variant
function saveVariant() {
    const internalName = document.getElementById('internalName').value;
    const displayName = document.getElementById('displayName').value;
    const viewPosition = document.getElementById('viewPosition').value;
    const status = document.getElementById('status').value;
    const bannerIds = document.getElementById('bannerIds').value;

    if (!internalName || !displayName) {
        showToast('Please fill in required fields!');
        return;
    }

    const variantData = {
        internalName,
        displayName,
        view: viewPosition,
        status,
        bannerIds,
        bannerCount: bannerIds.split(',').filter(b => b.trim()).length,
        states: getMultiSelectValues('statesDropdown'),
        cities: getMultiSelectValues('citiesDropdown'),
        warehouses: getMultiSelectValues('warehousesDropdown'),
        clusters: getMultiSelectValues('clustersDropdown'),
        userRanks: getMultiSelectValues('userRanksDropdown')
    };

    if (currentEditId !== null) {
        // Update existing
        const index = variants.findIndex(v => v.id === currentEditId);
        if (index !== -1) {
            variants[index] = { ...variants[index], ...variantData };
        }
        showToast('Variant updated successfully!');
    } else {
        // Create new
        variantData.id = Math.max(...variants.map(v => v.id), 0) + 1;
        variants.push(variantData);
        showToast('Variant created successfully!');
    }

    renderTable();
    showListView();
}

// Delete modal
function showDeleteModal(id) {
    deleteId = id;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    deleteId = null;
    deleteModal.classList.add('hidden');
}

// Multi-select functions
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const wasHidden = dropdown.classList.contains('hidden');

    // Close all other dropdowns
    document.querySelectorAll('.multi-select-dropdown').forEach(d => {
        d.classList.add('hidden');
    });

    if (wasHidden) {
        dropdown.classList.remove('hidden');
    }
}

function filterDropdown(input, dropdownId) {
    const query = input.value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    const labels = dropdown.querySelectorAll('.dropdown-options label');

    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        if (text.includes(query) || label.querySelector('input').value === 'all') {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
}

function selectAll(checkbox, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const checkboxes = dropdown.querySelectorAll('.dropdown-options input[type="checkbox"]:not([value="all"])');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    updateSelectedText(dropdownId);
}

function updateSelectedText(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const multiSelect = dropdown.closest('.multi-select');
    const selectedText = multiSelect.querySelector('.selected-text');
    const checked = dropdown.querySelectorAll('.dropdown-options input[type="checkbox"]:checked:not([value="all"])');

    if (checked.length === 0) {
        selectedText.textContent = 'Select...';
        selectedText.classList.remove('has-selection');
    } else if (checked.length === 1) {
        selectedText.textContent = checked[0].parentElement.textContent.trim();
        selectedText.classList.add('has-selection');
    } else {
        selectedText.textContent = `${checked.length} selected`;
        selectedText.classList.add('has-selection');
    }
}

function getMultiSelectValues(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const checked = dropdown.querySelectorAll('.dropdown-options input[type="checkbox"]:checked:not([value="all"])');
    return Array.from(checked).map(cb => cb.value);
}

function setMultiSelectValues(dropdownId, values) {
    const dropdown = document.getElementById(dropdownId);
    const checkboxes = dropdown.querySelectorAll('.dropdown-options input[type="checkbox"]');

    checkboxes.forEach(cb => {
        cb.checked = values.includes(cb.value);
    });

    updateSelectedText(dropdownId);
}

// Add change listeners to all checkboxes
document.querySelectorAll('.dropdown-options input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
        const dropdown = this.closest('.multi-select-dropdown');
        updateSelectedText(dropdown.id);
    });
});

// Banner preview
function updateBannerPreview() {
    const bannerIds = document.getElementById('bannerIds').value;
    const container = document.getElementById('bannerPreviewContainer');

    const ids = bannerIds.split(',').map(id => id.trim()).filter(id => id);

    if (ids.length === 0) {
        container.innerHTML = '<p class="helper-text">Enter banner IDs to see preview</p>';
        return;
    }

    const bannerTypes = ['UPI Payment', 'Card Offer', 'Wallet', 'BNPL', 'Cashback'];
    const gradients = [
        'linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335)',
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)'
    ];

    container.innerHTML = ids.slice(0, 5).map((id, index) => `
        <div class="banner-preview-item">
            <div class="banner-preview-card">
                <div class="banner-image" style="background: ${gradients[index % gradients.length]}">
                    <div class="banner-placeholder">
                        <i class="fas fa-image"></i>
                        <span>${id}</span>
                    </div>
                </div>
                <div class="banner-info">
                    <span class="banner-id">${id}</span>
                    <span class="banner-type">${bannerTypes[index % bannerTypes.length]}</span>
                </div>
            </div>
        </div>
    `).join('') + (ids.length > 5 ? `<div class="banner-preview-item"><p class="helper-text">+${ids.length - 5} more</p></div>` : '');
}

// Reset form
function resetForm() {
    variantForm.reset();
    document.querySelectorAll('.dropdown-options input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.multi-select-dropdown').forEach(dropdown => {
        updateSelectedText(dropdown.id);
    });
    updateBannerPreview();
}

// Toast notification
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Utility
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
