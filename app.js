/**
 * PowerSorted - Electricity Cost Calculator
 */

// Municipality Tariffs (R per kWh) - Feb 2026
const TARIFFS = {
  'cpt': { name: 'City of Cape Town', rate: 3.48 },
  'jhb': { name: 'City of Johannesburg', rate: 3.38 },
  'ekurhuleni': { name: 'Ekurhuleni', rate: 3.35 },
  'ethekwini': { name: 'eThekwini (Durban)', rate: 3.29 },
  'tshwane': { name: 'City of Tshwane (Pretoria)', rate: 3.42 },
  'nelson-mandela': { name: 'Nelson Mandela Bay', rate: 3.31 },
  'eskom': { name: 'Eskom Direct', rate: 3.32 }
};

// Appliance Database
const APPLIANCES = {
  // Heating & Cooling
  'geyser-3000': { name: 'Geyser (3kW)', watts: 3000, category: 'heating' },
  'geyser-4500': { name: 'Geyser (4.5kW)', watts: 4500, category: 'heating' },
  'aircon-1500': { name: 'Air Conditioner (1.5kW)', watts: 1500, category: 'cooling' },
  'aircon-2000': { name: 'Air Conditioner (2kW)', watts: 2000, category: 'cooling' },
  'heater-2000': { name: 'Electric Heater (2kW)', watts: 2000, category: 'heating' },
  'underfloor': { name: 'Underfloor Heating (per 10m²)', watts: 1500, category: 'heating' },
  
  // Kitchen
  'stove-2000': { name: 'Stove Plate (2kW)', watts: 2000, category: 'kitchen' },
  'oven-2400': { name: 'Oven (2.4kW)', watts: 2400, category: 'kitchen' },
  'kettle-2200': { name: 'Kettle (2.2kW)', watts: 2200, category: 'kitchen' },
  'microwave-1000': { name: 'Microwave (1kW)', watts: 1000, category: 'kitchen' },
  'fridge-150': { name: 'Fridge (150W)', watts: 150, category: 'kitchen' },
  'freezer-200': { name: 'Chest Freezer (200W)', watts: 200, category: 'kitchen' },
  'dishwasher-1800': { name: 'Dishwasher (1.8kW)', watts: 1800, category: 'kitchen' },
  
  // Laundry
  'washing-machine-2000': { name: 'Washing Machine (2kW)', watts: 2000, category: 'laundry' },
  'tumble-dryer-2400': { name: 'Tumble Dryer (2.4kW)', watts: 2400, category: 'laundry' },
  'iron-2000': { name: 'Iron (2kW)', watts: 2000, category: 'laundry' },
  
  // Electronics
  'tv-100': { name: 'TV (100W)', watts: 100, category: 'electronics' },
  'tv-200': { name: 'TV Large (200W)', watts: 200, category: 'electronics' },
  'computer-300': { name: 'Desktop Computer (300W)', watts: 300, category: 'electronics' },
  'laptop-60': { name: 'Laptop (60W)', watts: 60, category: 'electronics' },
  'router-10': { name: 'WiFi Router (10W)', watts: 10, category: 'electronics' },
  'decoder-20': { name: 'DSTV Decoder (20W)', watts: 20, category: 'electronics' },
  'gaming-console-150': { name: 'Gaming Console (150W)', watts: 150, category: 'electronics' },
  
  // Lighting
  'led-bulb-10': { name: 'LED Bulb (10W)', watts: 10, category: 'lighting' },
  'led-bulb-15': { name: 'LED Bulb (15W)', watts: 15, category: 'lighting' },
  'cfl-bulb-20': { name: 'CFL Bulb (20W)', watts: 20, category: 'lighting' },
  'incandescent-60': { name: 'Incandescent Bulb (60W)', watts: 60, category: 'lighting' },
  
  // Pool & Garden
  'pool-pump-750': { name: 'Pool Pump (750W)', watts: 750, category: 'pool' },
  'pool-pump-1100': { name: 'Pool Pump (1.1kW)', watts: 1100, category: 'pool' },
  'borehole-750': { name: 'Borehole Pump (750W)', watts: 750, category: 'garden' }
};

// State
let currentTariff = TARIFFS['eskom'].rate;
let appliances = [];
let applianceCounter = 0;

// DOM Elements
const municipalitySelect = document.getElementById('municipality');
const currentTariffEl = document.getElementById('current-tariff');
const applianceSelect = document.getElementById('appliance-select');
const usageAmountInput = document.getElementById('usage-amount');
const usageTypeSelect = document.getElementById('usage-type');
const timesPerDayInput = document.getElementById('times-per-day');
const addApplianceBtn = document.getElementById('add-appliance-btn');
const applianceList = document.getElementById('appliance-list');
const calculateBtn = document.getElementById('calculate-btn');
const resultsSummary = document.getElementById('results-summary');
const priorityList = document.getElementById('priority-list');
const loadsheddingSection = document.getElementById('loadshedding-section');

// Event Listeners
municipalitySelect.addEventListener('change', updateTariff);
usageTypeSelect.addEventListener('change', toggleUsageMode);
addApplianceBtn.addEventListener('click', addAppliance);
calculateBtn.addEventListener('click', calculateCosts);

// Initialize
updateTariff();
toggleUsageMode();

function updateTariff() {
  const municipality = municipalitySelect.value;
  currentTariff = TARIFFS[municipality].rate;
  currentTariffEl.textContent = `R ${currentTariff.toFixed(2)}/kWh`;
  
  // Recalculate if appliances exist
  if (appliances.length > 0) {
    calculateCosts();
  }
}

function toggleUsageMode() {
  const usageType = usageTypeSelect.value;
  if (usageType === 'minutes') {
    timesPerDayInput.style.display = 'block';
    usageAmountInput.placeholder = 'Minutes';
  } else {
    timesPerDayInput.style.display = 'none';
    usageAmountInput.placeholder = 'Hours';
  }
}

function addAppliance() {
  const applianceId = applianceSelect.value;
  const usageAmount = parseFloat(usageAmountInput.value);
  const usageType = usageTypeSelect.value;
  const timesPerDay = usageType === 'minutes' ? parseFloat(timesPerDayInput.value) : 1;
  
  if (!applianceId || !usageAmount || usageAmount <= 0) {
    alert('Please select an appliance and enter valid usage');
    return;
  }
  
  if (usageType === 'minutes' && (!timesPerDay || timesPerDay <= 0)) {
    alert('Please enter how many times per day you use this appliance');
    return;
  }
  
  const applianceData = APPLIANCES[applianceId];
  if (!applianceData) return;
  
  // Convert to hours per day for calculations
  let hoursPerDay;
  let displayUsage;
  
  if (usageType === 'minutes') {
    hoursPerDay = (usageAmount / 60) * timesPerDay;
    displayUsage = `${usageAmount} min × ${timesPerDay} times/day`;
  } else {
    hoursPerDay = usageAmount;
    displayUsage = `${usageAmount} hours/day`;
  }
  
  const appliance = {
    id: applianceCounter++,
    applianceId: applianceId,
    name: applianceData.name,
    watts: applianceData.watts,
    hoursPerDay: hoursPerDay,
    displayUsage: displayUsage,
    category: applianceData.category
  };
  
  appliances.push(appliance);
  renderApplianceList();
  
  // Reset inputs
  usageAmountInput.value = 1;
  timesPerDayInput.value = 1;
}

function removeAppliance(id) {
  appliances = appliances.filter(a => a.id !== id);
  renderApplianceList();
  
  // Hide results if no appliances
  if (appliances.length === 0) {
    resultsSummary.classList.add('hidden');
    priorityList.classList.add('hidden');
    loadsheddingSection.classList.add('hidden');
  }
}

function renderApplianceList() {
  if (appliances.length === 0) {
    applianceList.innerHTML = '';
    calculateBtn.disabled = true;
    return;
  }
  
  calculateBtn.disabled = false;
  
  applianceList.innerHTML = appliances.map(a => {
    const dailyCost = calculateApplianceCost(a.watts, a.hoursPerDay);
    return `
      <div class="appliance-item">
        <div class="appliance-info">
          <div class="appliance-name">${a.name}</div>
          <div class="appliance-details">${a.watts}W × ${a.displayUsage}</div>
        </div>
        <div class="appliance-cost">R ${dailyCost.toFixed(2)}/day</div>
        <button class="btn-remove" onclick="removeAppliance(${a.id})" title="Remove">×</button>
      </div>
    `;
  }).join('');
}

function calculateApplianceCost(watts, hoursPerDay) {
  const kWh = (watts / 1000) * hoursPerDay;
  return kWh * currentTariff;
}

function calculateCosts() {
  if (appliances.length === 0) {
    alert('Please add at least one appliance');
    return;
  }
  
  let totalDailyCost = 0;
  let totalDailyKwh = 0;
  
  appliances.forEach(a => {
    const cost = calculateApplianceCost(a.watts, a.hoursPerDay);
    const kwh = (a.watts / 1000) * a.hoursPerDay;
    totalDailyCost += cost;
    totalDailyKwh += kwh;
    
    // Store for priority ranking
    a.dailyCost = cost;
    a.dailyKwh = kwh;
  });
  
  const monthlyCost = totalDailyCost * 30;
  const yearlyCost = totalDailyCost * 365;
  const monthlyKwh = totalDailyKwh * 30;
  
  // Display results
  document.getElementById('cost-daily').textContent = `R ${totalDailyCost.toFixed(2)}`;
  document.getElementById('cost-monthly').textContent = `R ${monthlyCost.toFixed(2)}`;
  document.getElementById('cost-yearly').textContent = `R ${yearlyCost.toFixed(2)}`;
  document.getElementById('total-kwh').textContent = `${monthlyKwh.toFixed(1)} kWh`;
  
  resultsSummary.classList.remove('hidden');
  
  // Generate priority list
  generatePriorityList();
  
  // Calculate load shedding "savings"
  calculateLoadSheddingSavings(totalDailyCost);
  
  // Scroll to results
  resultsSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generatePriorityList() {
  // Sort by daily cost (highest first)
  const sorted = [...appliances].sort((a, b) => b.dailyCost - a.dailyCost);
  
  const priorityItems = document.getElementById('priority-items');
  priorityItems.innerHTML = sorted.map((a, index) => {
    const monthlyCost = a.dailyCost * 30;
    const savings = `R ${monthlyCost.toFixed(0)}/month`;
    
    return `
      <div class="priority-item">
        <div class="priority-rank">${index + 1}</div>
        <div class="priority-info">
          <div class="priority-name">${a.name}</div>
          <div class="priority-impact">${a.watts}W × ${a.displayUsage} = ${a.dailyKwh.toFixed(2)} kWh/day</div>
        </div>
        <div class="priority-cost">${savings}</div>
      </div>
    `;
  }).join('');
  
  priorityList.classList.remove('hidden');
}

function calculateLoadSheddingSavings(totalDailyCost) {
  // Assume Stage 2 load shedding: 4 hours/day
  // Appliances that would be off during those hours save money
  // Simplification: assume 20% of daily usage would be during load shedding
  const dailySavings = totalDailyCost * 0.20;
  const monthlySavings = dailySavings * 30;
  
  document.getElementById('loadshedding-savings').textContent = `R ${monthlySavings.toFixed(2)}`;
  loadsheddingSection.classList.remove('hidden');
}

function formatCurrency(amount) {
  return `R ${amount.toFixed(2)}`;
}

// Make removeAppliance globally accessible
window.removeAppliance = removeAppliance;

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
