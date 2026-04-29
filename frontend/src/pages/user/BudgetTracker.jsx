// ============================================================================
// BudgetTracker — Track actual expenses against the planned trip budget
// ============================================================================
//
// WHY THIS EXISTS:
// Pilgrims plan a budget when generating their itinerary, but during the trip
// they need to track what they're actually spending. This page shows planned
// vs. spent vs. remaining in real time, with a gentle warning when spending
// approaches the budget limit.
//
// STORAGE:
// Expenses are stored in localStorage keyed by itinerary ID. This means:
//   - Works offline (critical for remote pilgrimage sites with no connectivity)
//   - No backend changes needed
//   - Each trip has its own expense log
//
// The 90% warning threshold is chosen because it gives pilgrims time to
// adjust their spending for the remaining days without panicking.
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itineraryService } from '../../services/itinerary.service';
import { ArrowLeft, Plus, Trash2, Wallet, AlertTriangle } from 'lucide-react';

// Warning triggers at 90% of budget spent — enough buffer to adjust
const WARNING_THRESHOLD = 0.9;

// Expense categories relevant to pilgrimage travel
const CATEGORIES = [
  { value: 'transport', label: '🚗 Transport', color: 'bg-blue-50 text-blue-700' },
  { value: 'food', label: '🍽 Food', color: 'bg-green-50 text-green-700' },
  { value: 'accommodation', label: '🏨 Stay', color: 'bg-purple-50 text-purple-700' },
  { value: 'entry_fee', label: '🎫 Entry Fee', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'offering', label: '🙏 Offering', color: 'bg-orange-50 text-orange-700' },
  { value: 'shopping', label: '🛍 Shopping', color: 'bg-pink-50 text-pink-700' },
  { value: 'other', label: '📦 Other', color: 'bg-gray-50 text-gray-700' }
];

/**
 * Returns the localStorage key for a given itinerary's expenses.
 * @param {string} id - Itinerary MongoDB ID
 */
const getStorageKey = (id) => `budget_tracker_${id}`;

/**
 * Budget tracker page — shows planned vs actual spending with per-category breakdown.
 * Route: /trip/:itineraryId/tracker
 */
const BudgetTracker = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New expense form state
  const [newCategory, setNewCategory] = useState('food');
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Load itinerary metadata and saved expenses
  useEffect(() => {
    const load = async () => {
      try {
        const data = await itineraryService.getItineraryById(itineraryId);
        setItinerary(data);
      } catch {
        // Offline — try to get from cached itinerary
        const cached = localStorage.getItem(`saved_itinerary_${itineraryId}`);
        if (cached) setItinerary(JSON.parse(cached));
      }

      // Load saved expenses from localStorage
      try {
        const saved = localStorage.getItem(getStorageKey(itineraryId));
        if (saved) setExpenses(JSON.parse(saved));
      } catch {
        // Corrupted data — start fresh
      }

      setLoading(false);
    };
    load();
  }, [itineraryId]);

  // Persist expenses to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(getStorageKey(itineraryId), JSON.stringify(expenses));
      } catch {
        console.warn('Could not save expenses to localStorage');
      }
    }
  }, [expenses, itineraryId, loading]);

  /**
   * Adds a new expense entry to the list.
   */
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    if (!amount || amount <= 0) return;

    const expense = {
      id: Date.now().toString(),
      category: newCategory,
      amount,
      note: newNote.trim(),
      date: new Date().toISOString()
    };

    setExpenses(prev => [expense, ...prev]);
    setNewAmount('');
    setNewNote('');
    setShowForm(false);
  };

  /**
   * Removes an expense by ID.
   */
  const handleDeleteExpense = (expenseId) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-32">
        <div className="px-6 py-3 rounded-lg bg-input-bg border border-border text-text-muted font-medium animate-pulse">
          Loading budget tracker...
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-text">Itinerary not found</h2>
        <button onClick={() => navigate('/my-itineraries')} className="mt-4 text-primary underline">
          Back to My Trips
        </button>
      </div>
    );
  }

  const plannedBudget = itinerary.budget || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = plannedBudget - totalSpent;
  const spentPercent = plannedBudget > 0 ? (totalSpent / plannedBudget) * 100 : 0;
  const isOverBudget = totalSpent > plannedBudget;
  const isNearLimit = spentPercent >= WARNING_THRESHOLD * 100 && !isOverBudget;

  // Category breakdown for the summary
  const categoryTotals = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0);

  const getCategoryInfo = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[6];

  return (
    <div className="px-6 py-3 max-w-3xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        to={`/itinerary/${itineraryId}`}
        className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium"
        aria-label="Back to itinerary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to itinerary
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text tracking-tight">
          Budget Tracker
        </h1>
        <p className="text-text-muted mt-1">
          {itinerary.destination} • {itinerary.days} days • {itinerary.groupSize} travelers
        </p>
      </div>

      {/* Budget overview card */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-text">
              ₹{totalSpent.toLocaleString('en-IN')} spent
            </span>
            <span className="text-text-muted">
              of ₹{plannedBudget.toLocaleString('en-IN')} planned
            </span>
          </div>

          <div
            className="h-3 w-full rounded-full bg-input-bg overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.min(spentPercent, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(spentPercent)}% of budget spent`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(spentPercent, 100)}%`,
                background: isOverBudget
                  ? '#ef4444'
                  : isNearLimit
                    ? '#f59e0b'
                    : 'var(--gradient-primary)'
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Planned</p>
            <p className="text-lg font-bold text-text">₹{plannedBudget.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Spent</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-500' : 'text-text'}`}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Remaining</p>
            <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
              ₹{Math.abs(remaining).toLocaleString('en-IN')}
              {remaining < 0 && ' over'}
            </p>
          </div>
        </div>

        {/* Warning banner */}
        {isNearLimit && (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg px-4 py-3 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You've spent {Math.round(spentPercent)}% of your budget — consider reviewing remaining expenses.
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You've exceeded your planned budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}.
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">Spending by Category</h2>
          <div className="space-y-2">
            {categoryTotals.map(cat => (
              <div key={cat.value} className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${cat.color}`}>
                  {cat.label}
                </span>
                <span className="text-sm font-bold text-text">
                  ₹{cat.total.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add expense button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-text-muted font-medium hover:border-primary hover:text-primary transition-colors"
          aria-label="Add new expense"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      ) : (
        <form
          onSubmit={handleAddExpense}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-text">New Expense</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                aria-label="Expense category"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-3 py-2 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                aria-label="Expense amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Note (optional)</label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Auto from Dashashwamedh to Sarnath"
              className="w-full px-3 py-2 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              aria-label="Expense note"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 rounded-lg border border-border text-text-muted font-medium text-sm hover:bg-input-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
            All Expenses ({expenses.length})
          </h2>
          {expenses.map((expense) => {
            const catInfo = getCategoryInfo(expense.category);
            return (
              <div
                key={expense.id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md shrink-0 ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text">₹{expense.amount.toLocaleString('en-IN')}</p>
                    {expense.note && (
                      <p className="text-xs text-text-muted truncate">{expense.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-text-muted">
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-1.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label={`Delete expense: ${catInfo.label} ₹${expense.amount}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
