/**
 * MLB Money Maker v2 - Main Game Module
 * Core state management, negotiation rounds, undo, and demand system
 */

const Game = {
    // Game state
    state: {
        // Current screen
        currentScreen: 'intro',

        // Allocation (in billions)
        allocation: {
            players: 3.6,
            owners: 2.4,
            networks: 1.2,
            league: 0.8
        },

        // Total deal value
        totalDeal: 8.0,

        // Detail settings
        minSalary: 750,      // $750K
        revenueShare: 35,    // 35%
        startTime: 2,        // Index (7:30 PM)
        streaming: 25,       // 25%
        salaryShare: 48.5,   // 48.5%

        // Satisfactions
        satisfactions: {
            players: 70,
            owners: 65,
            networks: 60,
            fans: 68
        },

        // Stability status
        stability: 'stable',

        // === V2: ROUNDS SYSTEM ===
        round: 1,            // Current round (1, 2, 3)
        roundLocked: false,  // Whether current round has been locked in
        roundSatisfactions: [], // Snapshots of satisfactions per round

        // === V2: UNDO SYSTEM ===
        previousSnapshot: null,
        undosUsed: 0,        // Per-round undo counter (max 1 per round)

        // === V2: DEMAND SYSTEM ===
        pendingDemands: [],      // Active demands shown this round
        demandOutcomes: {},      // Adjustment map: { stakeholder: +/-N }
        demandFulfilled: {},     // Track which stakeholders' demands were met

        // === V2: UNLOCK BOOSTS ===
        unlockedBoosts: {
            salaryBoost: false,        // From Salary Match game
            primeTimeGuarantee: false, // From Network Click game
            marketFlexibility: false,  // From Stadium Puzzle game
            leagueCredibility: 0       // From Cap Calculator (+5 added to final overall)
        },

        // === V2: KEY DECISIONS ===
        keyDecisions: [],    // Array of decision strings for results screen

        // Game progress (0-100)
        progress: 0,

        // Interaction tracking
        interactions: 0
    },

    /**
     * Initialize the game
     */
    init() {
        // Initialize UI components
        UI.init();

        // Initialize interactions
        Interactions.initSliders();
        Interactions.initMiniGames();

        // Set up button listeners
        this.setupEventListeners();

        // Calculate initial satisfactions
        this.updateSatisfactions();

        // Hide loading screen
        setTimeout(() => {
            UI.hideLoading();
        }, 1000);
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Start button
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Continue to game button
        const continueBtn = document.getElementById('continue-to-game-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.showGameScreen());
        }

        // Lock round / Finalize button
        const lockBtn = document.getElementById('lock-round-btn');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => this.handleRoundButton());
        }

        // Undo button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLastMove());
        }

        // Try again button
        const tryAgainBtn = document.getElementById('try-again-btn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => this.restartGame());
        }

        // Share results button
        const shareBtn = document.getElementById('share-results-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResults());
        }

        // Collapse modal buttons
        const recoverBtn = document.getElementById('recover-btn');
        if (recoverBtn) {
            recoverBtn.addEventListener('click', () => this.recoverFromCollapse());
        }

        const acceptCollapseBtn = document.getElementById('accept-collapse-btn');
        if (acceptCollapseBtn) {
            acceptCollapseBtn.addEventListener('click', () => this.finalizeDeal(true));
        }

        // Demand modal buttons
        const demandAckBtn = document.getElementById('demand-acknowledge-btn');
        if (demandAckBtn) {
            demandAckBtn.addEventListener('click', () => UI.closeDemandModal());
        }
    },

    /**
     * Start the game - show role screen
     */
    startGame() {
        UI.showScreen('role-screen');
        this.state.currentScreen = 'role';
    },

    /**
     * Show main game screen
     */
    showGameScreen() {
        UI.showScreen('game-screen');
        this.state.currentScreen = 'game';
        UI.updateRoundIndicator(this.state.round);
        UI.updateRoundButton(this.state.round);
        // Round 1: only allocation tab is active, details locked
        UI.setDetailsTabLocked(this.state.round < 2);
        this.startProgressTracking();
    },

    /**
     * Handle round lock / finalize button
     */
    handleRoundButton() {
        if (this.state.round < 3) {
            this.lockRound();
        } else {
            this.finalizeDeal(false);
        }
    },

    /**
     * Lock in the current round and advance
     */
    lockRound() {
        // Snapshot satisfactions for this round
        const snapshot = { ...this.state.satisfactions };
        this.state.roundSatisfactions.push(snapshot);

        // Record key decision for this round
        this.recordKeyDecisions();

        // Evaluate any pending demands
        if (this.state.pendingDemands.length > 0) {
            const outcomes = Calculations.evaluateDemandOutcomes(
                this.state.pendingDemands, this.state
            );
            // Accumulate outcomes
            Object.keys(outcomes).forEach(k => {
                this.state.demandOutcomes[k] = (this.state.demandOutcomes[k] || 0) + outcomes[k];
            });
            this.state.pendingDemands = [];
        }

        // Advance to next round
        this.state.round++;
        this.state.roundLocked = false;
        this.state.undosUsed = 0;
        this.state.previousSnapshot = null;

        // Update UI for new round
        UI.updateRoundIndicator(this.state.round);
        UI.updateRoundButton(this.state.round);

        // Unlock details tab in round 2+
        UI.setDetailsTabLocked(false);

        // Recalculate with demand outcomes applied
        this.updateSatisfactions();

        // Generate demand for the least-satisfied stakeholder in round 2+
        if (this.state.round <= 3) {
            this.generateAndShowDemand();
        }

        // Show round transition
        UI.showRoundTransition(this.state.round);
        UI.showToast(`Round ${this.state.round - 1} locked! Moving to Round ${this.state.round}`, 'success');
    },

    /**
     * Generate a demand from the least-satisfied stakeholder and show it
     */
    generateAndShowDemand() {
        const sats = this.state.satisfactions;
        // Find lowest
        let lowestKey = 'fans';
        let lowestVal = 100;
        Object.entries(sats).forEach(([k, v]) => {
            if (v < lowestVal) { lowestVal = v; lowestKey = k; }
        });

        const demand = Calculations.generateDemand(lowestKey, this.state);
        if (demand) {
            this.state.pendingDemands = [demand];
            UI.showDemandModal(demand);
        }
    },

    /**
     * Record notable decisions for the results screen
     */
    recordKeyDecisions() {
        const s = this.state;
        const decisions = [];

        // Check streaming
        if (s.streaming > 60) {
            decisions.push(`Set streaming to ${s.streaming}% — this hurt fan and network satisfaction`);
        } else if (s.streaming < 10) {
            decisions.push(`Set streaming to only ${s.streaming}% — missed revenue opportunity`);
        } else if (s.streaming >= 20 && s.streaming <= 40) {
            decisions.push(`Streaming at ${s.streaming}% was a balanced choice that helped networks`);
        }

        // Check start time
        if (s.startTime >= 4) {
            decisions.push(`Late game times (9 PM+) cost fans and network viewership`);
        } else if (s.startTime <= 1) {
            decisions.push(`Early start times (6-7 PM) limited prime TV revenue`);
        } else if (s.startTime === 2) {
            decisions.push(`7:30 PM start time balanced East and West Coast audiences`);
        }

        // Check revenue sharing
        if (s.revenueShare < 20) {
            decisions.push(`Low revenue sharing (${s.revenueShare}%) hurt small-market competitiveness`);
        } else if (s.revenueShare > 50) {
            decisions.push(`High revenue sharing (${s.revenueShare}%) cost owner satisfaction`);
        }

        // Check player allocation
        const playerPct = Math.round((s.allocation.players / 8.0) * 100);
        if (playerPct > 55) {
            decisions.push(`Allocated ${playerPct}% to players — owners felt shortchanged`);
        } else if (playerPct < 37) {
            decisions.push(`Low player allocation (${playerPct}%) angered the Players Union`);
        } else {
            decisions.push(`Player allocation of ${playerPct}% was near the sweet spot`);
        }

        // Add unique decisions to the overall list (avoid duplicates)
        decisions.forEach(d => {
            if (!this.state.keyDecisions.includes(d)) {
                this.state.keyDecisions.push(d);
            }
        });

        // Keep only the 3 most recent/relevant
        if (this.state.keyDecisions.length > 4) {
            this.state.keyDecisions = this.state.keyDecisions.slice(-4);
        }
    },

    /**
     * Track game progress based on interactions
     */
    startProgressTracking() {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('change', () => {
                this.state.interactions++;
                this.updateProgress();
            });
        });
    },

    /**
     * Update game progress based on rounds
     */
    updateProgress() {
        const roundProgress = ((this.state.round - 1) / 3) * 100;
        const interactionBonus = Math.min(30, this.state.interactions * 2);
        this.state.progress = Math.min(100, roundProgress + interactionBonus);
        UI.updateProgress(this.state.progress);
    },

    /**
     * Take a state snapshot for undo
     */
    takeSnapshot() {
        this.state.previousSnapshot = {
            allocation: { ...this.state.allocation },
            minSalary: this.state.minSalary,
            revenueShare: this.state.revenueShare,
            startTime: this.state.startTime,
            streaming: this.state.streaming,
            salaryShare: this.state.salaryShare
        };
    },

    /**
     * Undo the last slider change (max 1 per round)
     */
    undoLastMove() {
        if (!this.state.previousSnapshot) {
            UI.showToast('Nothing to undo', 'info');
            return;
        }
        if (this.state.undosUsed >= 1) {
            UI.showToast('Only 1 undo per round allowed', 'warning');
            return;
        }

        const snap = this.state.previousSnapshot;

        // Restore state
        this.state.allocation = { ...snap.allocation };
        this.state.minSalary = snap.minSalary;
        this.state.revenueShare = snap.revenueShare;
        this.state.startTime = snap.startTime;
        this.state.streaming = snap.streaming;
        this.state.salaryShare = snap.salaryShare;

        // Restore slider DOM values
        UI.restoreSliders(snap);

        // Clear snapshot
        this.state.previousSnapshot = null;
        this.state.undosUsed++;

        // Update satisfactions
        this.updateSatisfactions();

        // Disable undo button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = true;

        UI.showToast('Last move undone', 'info');
    },

    /**
     * Update all satisfactions based on current state
     */
    updateSatisfactions() {
        const satisfactions = Calculations.calculateAllSatisfactions(this.state);
        this.state.satisfactions = satisfactions;

        // Check stability
        const prevStability = this.state.stability;
        this.state.stability = Calculations.checkStability(satisfactions);

        // Trigger collapse drama if newly collapsed
        if (this.state.stability === 'collapsed' && prevStability !== 'collapsed') {
            UI.triggerCollapseWarning(Calculations.getLowestStakeholder(satisfactions));
        }

        // Update UI
        UI.updateSatisfactions(satisfactions);

        // Update news ticker
        UI.updateNewsTicker(this.state, satisfactions);

        // Update advisor tips
        UI.updateAdvisorTips(this.state, satisfactions);

        // Update round progress
        this.updateProgress();
    },

    /**
     * Apply targeted mini-game bonus based on game type
     */
    applyMiniGameBonus(gameType, correct, total) {
        const isHighScore = Calculations.isHighScore(correct, total);

        switch (gameType) {
            case 'salary-match':
                if (isHighScore) {
                    this.state.unlockedBoosts.salaryBoost = true;
                    UI.showToast('UNLOCK: Minimum Salary Boost activated! (+$100K effective salary floor)', 'success');
                } else {
                    // Partial score: small uniform boost
                    const bonus = Calculations.calculateMiniGameBonus(correct, total);
                    if (bonus > 0) UI.showToast(`+${bonus} player satisfaction bonus`, 'success');
                }
                break;

            case 'network-click':
                if (isHighScore) {
                    this.state.unlockedBoosts.primeTimeGuarantee = true;
                    UI.showToast('UNLOCK: Prime Time Guarantee! Networks get +8 satisfaction flat', 'success');
                } else {
                    const bonus = Calculations.calculateMiniGameBonus(correct, total);
                    if (bonus > 0) UI.showToast(`+${bonus} network satisfaction bonus`, 'success');
                }
                break;

            case 'stadium-puzzle':
                if (isHighScore) {
                    this.state.unlockedBoosts.marketFlexibility = true;
                    UI.showToast('UNLOCK: Market Flexibility! High revenue sharing no longer penalizes owners', 'success');
                } else {
                    const bonus = Calculations.calculateMiniGameBonus(correct, total);
                    if (bonus > 0) UI.showToast(`+${bonus} owner/fan satisfaction bonus`, 'success');
                }
                break;

            case 'cap-calculator':
                if (correct >= 3) {
                    this.state.unlockedBoosts.leagueCredibility = 5;
                    UI.showToast('UNLOCK: League Credibility! +5 added to your final overall score', 'success');
                } else {
                    const bonus = Calculations.calculateMiniGameBonus(correct, total);
                    if (bonus > 0) UI.showToast(`+${bonus} overall satisfaction bonus`, 'success');
                }
                break;
        }

        // Recalculate with new unlocks
        this.updateSatisfactions();
    },

    /**
     * Finalize the deal and show results
     */
    finalizeDeal(forced = false) {
        // Close collapse modal if open
        UI.closeCollapseModal();

        // Record final decisions
        this.recordKeyDecisions();

        // Calculate final satisfactions
        const satisfactions = Calculations.calculateAllSatisfactions(this.state);

        // Apply league credibility boost to overall
        let finalSatisfactions = { ...satisfactions };
        if (this.state.unlockedBoosts.leagueCredibility > 0) {
            const boost = this.state.unlockedBoosts.leagueCredibility;
            Object.keys(finalSatisfactions).forEach(k => {
                finalSatisfactions[k] = Math.min(100, finalSatisfactions[k] + boost);
            });
        }

        // Determine tier
        const tierInfo = Calculations.determineTier(finalSatisfactions);

        // Generate result with claim code
        const result = CodeGenerator.generateResult(tierInfo, this.state, finalSatisfactions);

        // Store result
        CodeGenerator.storeResult(result);

        // Stop heartbeat animation
        UI.stopHeartbeat();

        // Show results screen
        UI.showResults(result, finalSatisfactions, this.state);

        this.state.currentScreen = 'results';
    },

    /**
     * Recover from a collapse warning (go back to game)
     */
    recoverFromCollapse() {
        UI.closeCollapseModal();
        // Don't change state — let user fix it
    },

    /**
     * Restart the game
     */
    restartGame() {
        // Reset state
        this.state = {
            currentScreen: 'intro',
            allocation: {
                players: 3.6,
                owners: 2.4,
                networks: 1.2,
                league: 0.8
            },
            totalDeal: 8.0,
            minSalary: 750,
            revenueShare: 35,
            startTime: 2,
            streaming: 25,
            salaryShare: 48.5,
            satisfactions: {
                players: 70,
                owners: 65,
                networks: 60,
                fans: 68
            },
            stability: 'stable',
            round: 1,
            roundLocked: false,
            roundSatisfactions: [],
            previousSnapshot: null,
            undosUsed: 0,
            pendingDemands: [],
            demandOutcomes: {},
            demandFulfilled: {},
            unlockedBoosts: {
                salaryBoost: false,
                primeTimeGuarantee: false,
                marketFlexibility: false,
                leagueCredibility: 0
            },
            keyDecisions: [],
            progress: 0,
            interactions: 0
        };

        // Reset sliders to default values
        this.resetSliders();

        // Reinitialize UI
        UI.init();
        UI.updateRoundIndicator(1);
        UI.updateRoundButton(1);
        UI.setDetailsTabLocked(true);
        this.updateSatisfactions();

        // Show intro screen
        UI.showScreen('intro-screen');
    },

    /**
     * Reset all sliders to default values
     */
    resetSliders() {
        const allocationDefaults = {
            'players-slider': 3.6,
            'owners-slider': 2.4,
            'networks-slider': 1.2,
            'league-slider': 0.8
        };

        Object.keys(allocationDefaults).forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = allocationDefaults[id];
            }
        });

        const detailDefaults = {
            'min-salary-slider': 750,
            'revenue-share-slider': 35,
            'start-time-slider': 2,
            'streaming-slider': 25,
            'salary-share-slider': 48.5
        };

        Object.keys(detailDefaults).forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = detailDefaults[id];
            }
        });

        // Update displays
        Object.keys(this.state.allocation).forEach(key => {
            UI.updateAllocationDisplay(key, this.state.allocation[key]);
        });

        UI.updateSliderDisplay('min-salary', '$750K');
        UI.updateSliderDisplay('revenue-share', '35%');
        UI.updateSliderDisplay('start-time', '7:30 PM');
        UI.updateSliderDisplay('streaming', '25%');
        UI.updateSliderDisplay('salary-share', '48.5%');
        UI.updateCompetitiveBalance(35);
        UI.updateViewerSplit(25);
        UI.updateProgress(0);

        // Reset undo button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = true;
    },

    /**
     * Share results (copy to clipboard)
     */
    shareResults() {
        const code = document.getElementById('claim-code')?.textContent;
        const tier = this.state.satisfactions ?
            Calculations.determineTier(this.state.satisfactions).tier : 'unknown';

        const shareText = `I just completed MLB Money Maker with a ${tier.toUpperCase()} tier deal!\nClaim Code: ${code}\nCan you do better?`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                UI.showToast('Results copied to clipboard!', 'success');
            }).catch(() => {
                UI.showToast('Could not copy to clipboard', 'error');
            });
        } else {
            alert(shareText);
        }
    },

    /**
     * Get current game state (for debugging)
     */
    getState() {
        return { ...this.state };
    }
};

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Also handle window load for any late-loading resources
window.addEventListener('load', () => {
    setTimeout(() => {
        UI.hideLoading();
    }, 500);
});

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
