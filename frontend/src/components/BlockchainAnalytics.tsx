import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Calendar, 
  Shield, 
  BarChart3,
  ExternalLink,
  Coins,
  Clock,
  Target,
  Trophy,
  Database,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCardanoContext } from '../contexts/CardanoContext';
import ThemeToggle from './ThemeToggle';

interface TransactionRecord {
  id: number;
  user_id: number;
  item_id: number;
  item_type: 'note' | 'todo';
  action: string;
  item_title: string;
  ada_amount: number | string; // 🔥 ALLOW BOTH NUMBER AND STRING
  tx_hash: string;
  created_at: string;
}

interface AnalyticsData {
  totalTransactions: number;
  totalADASpent: number;
  avgTransactionAmount: number;
  mostExpensiveTransaction: TransactionRecord | null;
  firstTransaction: TransactionRecord | null;
  latestTransaction: TransactionRecord | null;
  monthlySpending: { [key: string]: number };
  actionBreakdown: { [key: string]: number };
  securityLevels: { [key: string]: number };
}

const BlockchainAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet } = useCardanoContext();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | 'all'>('all');

  // 🔥 HELPER FUNCTION TO SAFELY CONVERT TO NUMBER
  const safeToFixed = (value: number | string | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(decimals);
  };

  // 🔥 REAL DATA FETCHING
  useEffect(() => {
    fetchRealAnalytics();
  }, [selectedTimeRange]);

  const fetchRealAnalytics = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch analytics data
      const analyticsResponse = await fetch('http://localhost:5000/api/blockchain/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch recent transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/blockchain/transactions?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (analyticsResponse.ok && transactionsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const transactionsData = await transactionsResponse.json();
        
        console.log('📊 Analytics data:', analyticsData);
        console.log('🔗 Transactions data:', transactionsData);
        
        setAnalytics(analyticsData);
        setTransactions(transactionsData);
      } else {
        // Show empty state if no data
        setAnalytics({
          totalTransactions: 0,
          totalADASpent: 0,
          avgTransactionAmount: 0,
          mostExpensiveTransaction: null,
          firstTransaction: null,
          latestTransaction: null,
          monthlySpending: {},
          actionBreakdown: {},
          securityLevels: {}
        });
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Show empty state on error
      setAnalytics({
        totalTransactions: 0,
        totalADASpent: 0,
        avgTransactionAmount: 0,
        mostExpensiveTransaction: null,
        firstTransaction: null,
        latestTransaction: null,
        monthlySpending: {},
        actionBreakdown: {},
        securityLevels: {}
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const openCardanoScan = (txHash: string) => {
    window.open(`https://preview.cardanoscan.io/transaction/${txHash}`, '_blank');
  };

  const getSecurityLevelIcon = (level: string) => {
    if (level.includes('Bronze')) return '🥉';
    if (level.includes('Silver')) return '🥈';
    if (level.includes('Gold')) return '🥇';
    return '💎';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      case 'COMPLETE': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700';
      case 'REOPEN': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/20 dark:text-gray-300 dark:border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark-light flex items-center justify-center">
        <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <span className="text-text-primary dark:text-text-dark-primary text-xl font-semibold">
              Analyzing blockchain data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark-light">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-background-card dark:bg-background-dark-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 rounded-xl transition-colors flex-shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary dark:text-text-dark-primary" />
              </button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-text-primary dark:text-text-dark-primary truncate">
                  Blockchain Analytics 📊
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-text-dark-secondary hidden sm:block">
                  Complete analysis of your Web3 security investments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
              <ThemeToggle />
              {wallet && (
                <div className="bg-green-100 dark:bg-green-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-700">
                  <span className="text-green-800 dark:text-green-300 font-semibold text-xs sm:text-sm">
                    🔗 <span className="hidden sm:inline">Wallet </span>Connected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {analytics?.totalTransactions === 0 ? (
          /* Empty State */
          <div className="bg-background-card dark:bg-background-dark-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-3 sm:mb-4">
              No Blockchain Data Yet
            </h2>
            <p className="text-sm sm:text-base text-text-secondary dark:text-text-dark-secondary mb-4 sm:mb-6 max-w-md mx-auto">
              Start creating notes and todos with blockchain security to see your analytics here. 
              Connect your Cardano wallet and secure your first item!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              Go Create Your First Secure Item
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
              {/* Total ADA Spent */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-green-200 dark:border-green-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-green-800 dark:text-green-300 font-semibold mb-1 text-xs sm:text-base">Total ADA Invested</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-200">
                  ₳{safeToFixed(analytics?.totalADASpent)}
                </p>
                <p className="text-green-700 dark:text-green-400 text-xs sm:text-sm mt-1 sm:mt-2">
                  Securing your digital assets
                </p>
              </div>

              {/* Total Transactions */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1 text-xs sm:text-base">Blockchain Transactions</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200">
                  {analytics?.totalTransactions || 0}
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-2">
                  Immutable records created
                </p>
              </div>

              {/* Average Transaction */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-purple-800 dark:text-purple-300 font-semibold mb-1 text-xs sm:text-base">Avg Security Level</h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-200">
                  ₳{safeToFixed(analytics?.avgTransactionAmount)}
                </p>
                <p className="text-purple-700 dark:text-purple-400 text-xs sm:text-sm mt-1 sm:mt-2">
                  Per blockchain proof
                </p>
              </div>

              {/* Most Expensive - 🔥 FIXED THIS LINE */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-200 dark:border-orange-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-orange-800 dark:text-orange-300 font-semibold mb-1 text-xs sm:text-base">Highest Security</h3>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-200">
                  ₳{safeToFixed(analytics?.mostExpensiveTransaction?.ada_amount)}
                </p>
                <p className="text-orange-700 dark:text-orange-400 text-xs sm:text-sm mt-1 sm:mt-2 truncate">
                  {analytics?.mostExpensiveTransaction?.item_title || 'No transactions yet'}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-background-card dark:bg-background-dark-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 mb-4 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <span>Recent Blockchain Transactions</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-text-secondary dark:text-text-dark-secondary" />
                  <span className="text-text-secondary dark:text-text-dark-secondary text-sm">Live from Cardano</span>
                </div>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary dark:text-text-dark-secondary">
                    No blockchain transactions yet. Start securing your notes and todos!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="bg-secondary/5 dark:bg-text-dark-secondary/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-secondary/10 dark:border-text-dark-secondary/10">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getActionColor(tx.action)}`}>
                            {tx.action}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary dark:text-text-dark-primary">
                              {tx.item_title}
                            </p>
                            <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
                              {new Date(tx.created_at).toLocaleDateString()} • {tx.item_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-bold text-primary">₳{safeToFixed(tx.ada_amount)}</p>
                            <button
                              onClick={() => openCardanoScan(tx.tx_hash)}
                              className="text-text-secondary dark:text-text-dark-secondary hover:text-primary text-xs flex items-center space-x-1 transition-colors"
                            >
                              <span>Verify</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Levels Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Action Breakdown */}
              <div className="bg-background-card dark:bg-background-dark-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20">
                <h2 className="text-base sm:text-xl font-bold text-text-primary dark:text-text-dark-primary mb-4 sm:mb-6 flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-primary" />
                  <span>Action Breakdown</span>
                </h2>
                <div className="space-y-4">
                  {Object.entries(analytics?.actionBreakdown || {}).length === 0 ? (
                    <p className="text-text-secondary dark:text-text-dark-secondary text-center py-4">
                      No action data available
                    </p>
                  ) : (
                    Object.entries(analytics?.actionBreakdown || {}).map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            action === 'CREATE' ? 'bg-green-500' :
                            action === 'UPDATE' ? 'bg-blue-500' :
                            action === 'DELETE' ? 'bg-red-500' : 
                            action === 'COMPLETE' ? 'bg-purple-500' :
                            action === 'REOPEN' ? 'bg-orange-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-text-primary dark:text-text-dark-primary font-medium">{action}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-text-secondary dark:text-text-dark-secondary">{count} transactions</span>
                          <div className="w-20 bg-secondary/20 dark:bg-text-dark-secondary/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                action === 'CREATE' ? 'bg-green-500' :
                                action === 'UPDATE' ? 'bg-blue-500' :
                                action === 'DELETE' ? 'bg-red-500' : 
                                action === 'COMPLETE' ? 'bg-purple-500' :
                                action === 'REOPEN' ? 'bg-orange-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${(count / (analytics?.totalTransactions || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Levels */}
              <div className="bg-background-card dark:bg-background-dark-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20">
                <h2 className="text-base sm:text-xl font-bold text-text-primary dark:text-text-dark-primary mb-4 sm:mb-6 flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <span>Security Investment Levels</span>
                </h2>
                <div className="space-y-4">
                  {Object.entries(analytics?.securityLevels || {}).length === 0 ? (
                    <p className="text-text-secondary dark:text-text-dark-secondary text-center py-4">
                      No security level data available
                    </p>
                  ) : (
                    Object.entries(analytics?.securityLevels || {}).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getSecurityLevelIcon(level)}</span>
                          <span className="text-text-primary dark:text-text-dark-primary font-medium">{level}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-text-secondary dark:text-text-dark-secondary">{count} items</span>
                          <div className="w-20 bg-secondary/20 dark:bg-text-dark-secondary/20 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                              style={{ width: `${(count / (analytics?.totalTransactions || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-4 sm:mt-8 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/5 dark:to-purple-500/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary/20 dark:border-primary/10">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
                  🎉 Blockchain Security Pioneer!
                </h3>
                <p className="text-xs sm:text-base text-text-secondary dark:text-text-dark-secondary mb-3 sm:mb-4">
                  You've successfully created <strong>{analytics?.totalTransactions} immutable blockchain records</strong> securing your digital assets with <strong>₳{safeToFixed(analytics?.totalADASpent)} ADA</strong>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="font-bold text-primary">First Secured</p>
                    <p className="text-text-secondary dark:text-text-dark-secondary">
                      {analytics?.firstTransaction ? new Date(analytics.firstTransaction.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-primary">Latest Activity</p>
                    <p className="text-text-secondary dark:text-text-dark-secondary">
                      {analytics?.latestTransaction ? new Date(analytics.latestTransaction.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-primary">Carbon Footprint</p>
                    <p className="text-text-secondary dark:text-text-dark-secondary">99% less than AWS</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlockchainAnalytics;