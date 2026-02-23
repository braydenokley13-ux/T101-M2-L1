/**
 * MLB Money Maker v2 - Calculations Module
 * Satisfaction scoring algorithms, demand generation, and unlock boosts
 */

const Calculations = {
    // Weight factors for each stakeholder
    weights: {
        players: {
            allocation: 0.35,      // How much of the $8B goes to players
            minSalary: 0.20,       // Minimum salary level
            salaryShare: 0.30,     // Player share of revenue
            competitiveBalance: 0.15  // Revenue sharing affects player opportunities
        },
        owners: {
            allocation: 0.40,      // Their profit share
            salaryShare: 0.25,     // Lower player share = more profit
            streaming: 0.15,       // Streaming deals can be more profitable
            revenueShare: 0.20     // Revenue sharing costs them money
        },
        networks: {
            allocation: 0.25,      // Rights value
            startTime: 0.35,       // Prime time matters most
            streaming: 0.25,       // Streaming exclusives
            viewership: 0.15      // Competitive balance affects viewership
        },
        fans: {
            competitiveBalance: 0.35,  // Want parity
            startTime: 0.25,       // Watchable times
            streaming: 0.20,       // Access to games
            minSalary: 0.20        // Want players paid fairly
        }
    },

    /**
     * Calculate player satisfaction based on all inputs
     */
    calculatePlayerSatisfaction(state) {
        const weights = this.weights.players;
        let score = 0;

        // Allocation score (ideal: 40-50% of deal)
        const allocationPercent = (state.allocation.players / state.totalDeal) * 100;
        const allocationScore = this.mapRange(allocationPercent, 25, 55, 0, 100);
        score += allocationScore * weights.allocation;

        // Minimum salary score (ideal: $1M+)
        // Apply unlock boost if active
        const effectiveMinSalary = state.unlockedBoosts?.salaryBoost
            ? state.minSalary + 100
            : state.minSalary;
        const minSalaryScore = this.mapRange(effectiveMinSalary, 400, 1500, 30, 100);
        score += minSalaryScore * weights.minSalary;

        // Salary share score (ideal: 50%+)
        const salaryShareScore = this.mapRange(state.salaryShare, 40, 65, 20, 100);
        score += salaryShareScore * weights.salaryShare;

        // Competitive balance (more sharing = more opportunities)
        const balanceScore = this.mapRange(state.revenueShare, 10, 60, 40, 100);
        score += balanceScore * weights.competitiveBalance;

        // Apply demand bonus/penalty
        const demandAdj = this.getDemandAdjustment('players', state);
        return Math.min(100, Math.max(0, Math.round(score + demandAdj)));
    },

    /**
     * Calculate owner satisfaction based on all inputs
     */
    calculateOwnerSatisfaction(state) {
        const weights = this.weights.owners;
        let score = 0;

        // Allocation score (ideal: 30-40% of deal)
        const allocationPercent = (state.allocation.owners / state.totalDeal) * 100;
        const allocationScore = this.mapRange(allocationPercent, 15, 45, 20, 100);
        score += allocationScore * weights.allocation;

        // Salary share (inverse - lower player share = higher owner profit)
        const salaryShareScore = this.mapRange(state.salaryShare, 70, 40, 0, 100);
        score += salaryShareScore * weights.salaryShare;

        // Streaming (more streaming = potentially more revenue)
        const streamingScore = this.mapRange(state.streaming, 0, 60, 50, 90);
        score += streamingScore * weights.streaming;

        // Revenue sharing (inverse - less sharing = more profit for big markets)
        // Apply market flexibility unlock: if unlocked, owner penalty for high rev share is reduced
        const effectiveRevenueShare = state.unlockedBoosts?.marketFlexibility
            ? Math.min(state.revenueShare, 50)  // cap the penalty at 50%
            : state.revenueShare;
        const revenueScore = this.bellCurve(effectiveRevenueShare, 30, 20);
        score += revenueScore * weights.revenueShare;

        // Apply demand bonus/penalty
        const demandAdj = this.getDemandAdjustment('owners', state);
        return Math.min(100, Math.max(0, Math.round(score + demandAdj)));
    },

    /**
     * Calculate network satisfaction based on all inputs
     */
    calculateNetworkSatisfaction(state) {
        const weights = this.weights.networks;
        let score = 0;

        // Allocation score (ideal: 15-25% of deal for rights)
        const allocationPercent = (state.allocation.networks / state.totalDeal) * 100;
        const allocationScore = this.mapRange(allocationPercent, 5, 30, 30, 100);
        score += allocationScore * weights.allocation;

        // Start time (prefer 7-8 PM prime time)
        const startTimeScore = this.bellCurve(state.startTime, 2, 1.5) * 100;
        score += startTimeScore * weights.startTime;

        // Streaming (some streaming is good, too much hurts traditional ratings)
        const streamingScore = this.bellCurve(state.streaming, 35, 25) * 100;
        score += streamingScore * weights.streaming;

        // Competitive balance affects viewership
        const viewershipScore = this.mapRange(state.revenueShare, 10, 50, 50, 90);
        score += viewershipScore * weights.viewership;

        // Prime time guarantee unlock adds a flat bonus
        if (state.unlockedBoosts?.primeTimeGuarantee) {
            score += 8;
        }

        // Apply demand bonus/penalty
        const demandAdj = this.getDemandAdjustment('networks', state);
        return Math.min(100, Math.max(0, Math.round(score + demandAdj)));
    },

    /**
     * Calculate fan satisfaction based on all inputs
     */
    calculateFanSatisfaction(state) {
        const weights = this.weights.fans;
        let score = 0;

        // Competitive balance (fans want parity)
        const balanceScore = this.mapRange(state.revenueShare, 10, 60, 30, 100);
        score += balanceScore * weights.competitiveBalance;

        // Start time (prefer earlier for families, not too late)
        const startTimeScore = this.bellCurve(state.startTime, 1.5, 1.5) * 100;
        score += startTimeScore * weights.startTime;

        // Streaming (mixed - some want it, some don't have access)
        const streamingScore = this.bellCurve(state.streaming, 30, 30) * 100;
        score += streamingScore * weights.streaming;

        // Minimum salary (fans like fair player wages)
        const minSalaryScore = this.mapRange(state.minSalary, 400, 1200, 50, 100);
        score += minSalaryScore * weights.minSalary;

        // Apply demand bonus/penalty
        const demandAdj = this.getDemandAdjustment('fans', state);
        return Math.min(100, Math.max(0, Math.round(score + demandAdj)));
    },

    /**
     * Calculate all satisfactions at once
     */
    calculateAllSatisfactions(state) {
        return {
            players: this.calculatePlayerSatisfaction(state),
            owners: this.calculateOwnerSatisfaction(state),
            networks: this.calculateNetworkSatisfaction(state),
            fans: this.calculateFanSatisfaction(state)
        };
    },

    /**
     * Calculate overall score (average of all satisfactions)
     */
    calculateOverallScore(satisfactions) {
        const total = satisfactions.players + satisfactions.owners +
                      satisfactions.networks + satisfactions.fans;
        return Math.round(total / 4);
    },

    /**
     * Determine tier based on satisfactions
     */
    determineTier(satisfactions) {
        const overall = this.calculateOverallScore(satisfactions);
        const minSatisfaction = Math.min(
            satisfactions.players,
            satisfactions.owners,
            satisfactions.networks,
            satisfactions.fans
        );

        // Check for deal collapse (any stakeholder below 40%)
        if (minSatisfaction < 40) {
            return {
                tier: 'fail',
                overall: overall,
                minSatisfaction: minSatisfaction,
                ...MLBData.tiers.fail
            };
        }

        // Determine tier based on overall and minimum scores
        if (overall >= 90 && minSatisfaction >= 75) {
            return { tier: 'gold', overall, minSatisfaction, ...MLBData.tiers.gold };
        } else if (overall >= 80 && minSatisfaction >= 60) {
            return { tier: 'silver', overall, minSatisfaction, ...MLBData.tiers.silver };
        } else if (overall >= 70 && minSatisfaction >= 45) {
            return { tier: 'bronze', overall, minSatisfaction, ...MLBData.tiers.bronze };
        } else {
            return { tier: 'fail', overall, minSatisfaction, ...MLBData.tiers.fail };
        }
    },

    /**
     * Check deal stability
     * Returns: 'stable', 'warning', 'danger', or 'collapsed'
     */
    checkStability(satisfactions) {
        const minSat = Math.min(
            satisfactions.players,
            satisfactions.owners,
            satisfactions.networks,
            satisfactions.fans
        );

        const belowThreshold = Object.values(satisfactions).filter(s => s < 50).length;

        if (minSat < 40) return 'collapsed';
        if (minSat < 50 || belowThreshold >= 2) return 'danger';
        if (minSat < 60 || belowThreshold >= 1) return 'warning';
        return 'stable';
    },

    /**
     * Get the lowest stakeholder for failure message
     */
    getLowestStakeholder(satisfactions) {
        let lowest = { name: '', value: 100 };

        for (const [key, value] of Object.entries(satisfactions)) {
            if (value < lowest.value) {
                lowest = { name: key, value: value };
            }
        }

        const names = {
            players: 'Players Union',
            owners: 'Team Owners',
            networks: 'Broadcast Networks',
            fans: 'Baseball Fans'
        };

        return {
            key: lowest.name,
            name: names[lowest.name],
            value: lowest.value
        };
    },

    /**
     * Get emoji based on satisfaction level
     */
    getEmoji(satisfaction) {
        if (satisfaction >= 80) return '😄';
        if (satisfaction >= 65) return '😊';
        if (satisfaction >= 50) return '😐';
        if (satisfaction >= 40) return '😟';
        return '😠';
    },

    /**
     * Get comment based on satisfaction level
     */
    getComment(stakeholder, satisfaction) {
        const comments = MLBData.stakeholders[stakeholder].comments;

        if (satisfaction >= 85) return comments.veryHappy;
        if (satisfaction >= 70) return comments.happy;
        if (satisfaction >= 55) return comments.neutral;
        if (satisfaction >= 40) return comments.unhappy;
        return comments.veryUnhappy;
    },

    /**
     * Calculate competitive balance text
     */
    getBalanceText(revenueShare) {
        if (revenueShare >= 50) return 'Very Fair';
        if (revenueShare >= 40) return 'Fair';
        if (revenueShare >= 30) return 'Moderate';
        if (revenueShare >= 20) return 'Uneven';
        return 'Very Uneven';
    },

    /**
     * Get start time impact text
     */
    getStartTimeImpact(startTimeValue) {
        const time = MLBData.startTimes.find(t => t.value === startTimeValue);
        return time ? time.impact : '';
    },

    // ===== V2: DEMAND SYSTEM =====

    /**
     * Generate a demand for the given stakeholder based on current state.
     * Returns the first applicable demand template, or null if none.
     */
    generateDemand(stakeholder, state) {
        const templates = MLBData.demandTemplates[stakeholder];
        if (!templates) return null;

        // Find first condition that is currently true (demand not yet met)
        for (const template of templates) {
            if (template.condition(state) && !template.check(state)) {
                return {
                    stakeholder,
                    name: MLBData.stakeholders[stakeholder].name,
                    demand: template.demand,
                    fix: template.fix,
                    check: template.check,
                    bonusIfMet: 8,
                    penaltyIfIgnored: 5
                };
            }
        }
        return null;
    },

    /**
     * Get active demand adjustments from state.pendingDemands
     * Returns the total satisfaction adjustment for a stakeholder
     */
    getDemandAdjustment(stakeholder, state) {
        if (!state.demandOutcomes) return 0;
        return state.demandOutcomes[stakeholder] || 0;
    },

    /**
     * Evaluate all pending demands and compute outcomes
     * Call this when locking in a round.
     * Returns an object: { stakeholder: adjustment, ... }
     */
    evaluateDemandOutcomes(demands, state) {
        const outcomes = {};
        demands.forEach(demand => {
            if (!demand) return;
            const met = demand.check(state);
            outcomes[demand.stakeholder] = met ? demand.bonusIfMet : -demand.penaltyIfIgnored;
        });
        return outcomes;
    },

    // ===== MINI-GAME BONUS =====

    /**
     * Calculate basic mini-game bonus (legacy, kept for reference)
     */
    calculateMiniGameBonus(correct, total) {
        const percentage = correct / total;
        if (percentage >= 0.8) return 5;
        if (percentage >= 0.6) return 3;
        if (percentage >= 0.4) return 1;
        return 0;
    },

    /**
     * Determine if mini-game was completed at 80%+ threshold
     */
    isHighScore(correct, total) {
        return (correct / total) >= 0.8;
    },

    // ===== UTILITY FUNCTIONS =====

    /**
     * Map a value from one range to another
     */
    mapRange(value, inMin, inMax, outMin, outMax) {
        const mapped = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
        return Math.min(outMax, Math.max(outMin, mapped));
    },

    /**
     * Bell curve function for optimal values
     * Returns 0-1 based on how close value is to optimal
     */
    bellCurve(value, optimal, spread) {
        const diff = value - optimal;
        return Math.exp(-(diff * diff) / (2 * spread * spread));
    },

    /**
     * Validate allocation (must equal total deal)
     */
    validateAllocation(allocation, totalDeal, tolerance = 0.1) {
        const sum = allocation.players + allocation.owners +
                    allocation.networks + allocation.league;
        return Math.abs(sum - totalDeal) <= tolerance;
    },

    /**
     * Calculate salary cap from revenue
     * Used in mini-game
     */
    calculateSalaryCap(revenue, playerShare) {
        return Math.round((revenue * (playerShare / 100)) / 30); // Divided among 30 teams
    }
};

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
}
