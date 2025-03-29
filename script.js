document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transactionsContainer = document.getElementById('transactions-container');
    const transactionForm = document.getElementById('transaction-form');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const modal = document.getElementById('transaction-modal');
    const closeBtn = document.querySelector('.close-btn');
    const monthFilter = document.getElementById('month-filter');
    const typeFilter = document.getElementById('type-filter');
    const exportBtn = document.getElementById('export-btn');
    const balanceAmount = document.getElementById('balance-amount');
    const incomeAmount = document.getElementById('income-amount');
    const expenseAmount = document.getElementById('expense-amount');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Initialize transactions from localStorage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Event Listeners
    addTransactionBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    transactionForm.addEventListener('submit', addTransaction);
    monthFilter.addEventListener('change', filterTransactions);
    typeFilter.addEventListener('change', filterTransactions);
    themeToggle.addEventListener('click', toggleTheme);
    document.getElementById('export-btn').addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat PDF...';
        
        try {
          await exportToPDF();
        } catch (error) {
          console.error(error);
          alert('Gagal membuat PDF');
        } finally {
          this.disabled = false;
          this.innerHTML = '<i class="fas fa-file-pdf"></i> Ekspor PDF';
        }
      });
    // Initial render
    updateSummary();
    renderTransactions();
    
    // Functions
    function openModal() {
        modal.style.display = 'flex';
        document.getElementById('transaction-date').valueAsDate = new Date();
    }
    
    function closeModal() {
        modal.style.display = 'none';
        transactionForm.reset();
    }
    
    function addTransaction(e) {
        e.preventDefault();
        
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;
        const source = document.getElementById('transaction-source').value;
        const destination = document.getElementById('transaction-destination').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const type = document.querySelector('input[name="transaction-type"]:checked').value;
        
        const transaction = {
            id: Date.now(),
            date,
            description,
            source,
            destination,
            amount,
            type
        };
        
        transactions.push(transaction);
        saveTransactions();
        renderTransactions();
        updateSummary();
        closeModal();
        
        // Add animation to new transaction
        const newTransaction = document.querySelector(`[data-id="${transaction.id}"]`);
        if (newTransaction) {
            newTransaction.classList.add('highlight');
            setTimeout(() => {
                newTransaction.classList.remove('highlight');
            }, 1000);
        }
    }
    
    function deleteTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        renderTransactions();
        updateSummary();
    }
    
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    function renderTransactions() {
        const month = monthFilter.value;
        const type = typeFilter.value;
        
        let filteredTransactions = [...transactions];
        
        // Filter by month
        if (month !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => {
                const transactionMonth = new Date(transaction.date).getMonth() + 1;
                return transactionMonth.toString() === month;
            });
        }
        
        // Filter by type
        if (type !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.type === type);
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredTransactions.length === 0) {
            transactionsContainer.innerHTML = '<p class="no-transactions">Tidak ada transaksi yang ditemukan</p>';
            return;
        }
        
        transactionsContainer.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-details">
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div>
                        <span class="transaction-source">${transaction.source}</span>
                        <span class="transaction-destination">→ ${transaction.destination}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}Rp${formatNumber(transaction.amount)}
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    
    function filterTransactions() {
        renderTransactions();
    }
    
    function updateSummary() {
        const income = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        const expense = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        const balance = income - expense;
        
        balanceAmount.textContent = `Rp${formatNumber(balance)}`;
        incomeAmount.textContent = `Rp${formatNumber(income)}`;
        expenseAmount.textContent = `Rp${formatNumber(expense)}`;
        
        // Add animation to summary cards when values change
        [balanceAmount, incomeAmount, expenseAmount].forEach(el => {
            el.classList.add('value-updated');
            setTimeout(() => {
                el.classList.remove('value-updated');
            }, 500);
        });
    }
    
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }
    
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Make deleteTransaction available globally
function deleteTransaction(id) {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Get the transactions array from localStorage again to ensure we have the latest
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Trigger a re-render by simulating the DOMContentLoaded event
    document.dispatchEvent(event);
}
if (!localStorage.getItem('demo_start')) {
    localStorage.setItem('demo_start', new Date());
  }
  const demoDays = 7;
  const expiryDate = new Date(localStorage.getItem('demo_start'));
  expiryDate.setDate(expiryDate.getDate() + demoDays);
  
  if (new Date() > expiryDate) {
    alert("Demo berakhir!");
  }