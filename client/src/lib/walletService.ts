// Scalable Wallet Management Service
// Designed for future web3 wallet integration (e.g., Phantom)

export interface WalletTransaction {
  id: string;
  type: 'win' | 'loss' | 'allocation' | 'bonus' | 'transfer';
  amount: number;
  description: string;
  timestamp: string;
  gameId?: string;
  fromAddress?: string; // For future web3 integration
  toAddress?: string;   // For future web3 integration
  txHash?: string;      // For future blockchain transaction hash
}

export interface WalletState {
  address: string;        // User ID (future: wallet address)
  balance: number;        // Current token balance
  totalEarned: number;    // Lifetime earnings
  totalSpent: number;     // Lifetime spending
  transactions: WalletTransaction[];
  isConnected: boolean;   // Future: web3 wallet connection status
  walletType?: 'internal' | 'phantom' | 'metamask'; // Future wallet types
}

export class WalletService {
  private static instance: WalletService;
  private wallets: Map<string, WalletState> = new Map();

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Initialize user wallet with 0 balance (no monetary value)
  initializeWallet(userId: string): WalletState {
    const existingWallet = this.wallets.get(userId);
    if (existingWallet) {
      return existingWallet;
    }

    const newWallet: WalletState = {
      address: userId,
      balance: 0,              // Always start with 0 balance
      totalEarned: 0,
      totalSpent: 0,
      transactions: [],
      isConnected: true,       // Internal wallet always "connected"
      walletType: 'internal'   // Default to internal gaming tokens
    };

    this.wallets.set(userId, newWallet);
    return newWallet;
  }

  // Get wallet state
  getWallet(userId: string): WalletState | null {
    return this.wallets.get(userId) || null;
  }

  // Add tokens to wallet (earnings, bonuses, etc.)
  creditTokens(userId: string, amount: number, description: string, gameId?: string): boolean {
    const wallet = this.wallets.get(userId);
    if (!wallet || amount <= 0) return false;

    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'win',
      amount,
      description,
      timestamp: new Date().toISOString(),
      gameId
    };

    wallet.balance += amount;
    wallet.totalEarned += amount;
    wallet.transactions.unshift(transaction);
    
    return true;
  }

  // Deduct tokens from wallet (allocations, purchases, etc.)
  debitTokens(userId: string, amount: number, description: string, gameId?: string): boolean {
    const wallet = this.wallets.get(userId);
    if (!wallet || amount <= 0 || wallet.balance < amount) return false;

    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'allocation',
      amount: -amount,
      description,
      timestamp: new Date().toISOString(),
      gameId
    };

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.transactions.unshift(transaction);
    
    return true;
  }

  // Future: Connect external web3 wallet (Phantom, MetaMask, etc.)
  async connectExternalWallet(walletType: 'phantom' | 'metamask', userId: string): Promise<boolean> {
    // Future implementation for web3 wallet integration
    // This method will handle:
    // - Wallet connection
    // - Address verification
    // - Token migration from internal to external wallet
    // - Signature verification
    
    console.log(`Future implementation: Connect ${walletType} wallet for user ${userId}`);
    return false; // Not implemented yet
  }

  // Future: Disconnect external wallet
  async disconnectExternalWallet(userId: string): Promise<boolean> {
    // Future implementation for web3 wallet disconnection
    console.log(`Future implementation: Disconnect external wallet for user ${userId}`);
    return false; // Not implemented yet
  }

  // Get transaction history
  getTransactionHistory(userId: string, limit?: number): WalletTransaction[] {
    const wallet = this.wallets.get(userId);
    if (!wallet) return [];
    
    return limit ? wallet.transactions.slice(0, limit) : wallet.transactions;
  }

  // Check if user has sufficient balance
  hasInsufficientBalance(userId: string, amount: number): boolean {
    const wallet = this.wallets.get(userId);
    return !wallet || wallet.balance < amount;
  }

  // Get wallet summary for UI display
  getWalletSummary(userId: string) {
    const wallet = this.wallets.get(userId);
    if (!wallet) return null;

    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      netGain: wallet.totalEarned - wallet.totalSpent,
      recentTransactions: wallet.transactions.slice(0, 5),
      isConnected: wallet.isConnected,
      walletType: wallet.walletType
    };
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();

// Helper functions for common wallet operations
export const initializeUserWallet = (userId: string) => walletService.initializeWallet(userId);
export const getUserWallet = (userId: string) => walletService.getWallet(userId);
export const creditUserTokens = (userId: string, amount: number, description: string, gameId?: string) => 
  walletService.creditTokens(userId, amount, description, gameId);
export const debitUserTokens = (userId: string, amount: number, description: string, gameId?: string) => 
  walletService.debitTokens(userId, amount, description, gameId);