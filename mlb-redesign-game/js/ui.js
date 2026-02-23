/**
 * MLB Money Maker v2 - UI Module
 * Tabs, news ticker, stakeholder cards, demand modal, collapse drama,
 * advisor tips, animated results, historical comparison
 */

const UI = {
    // Heartbeat / animation state
    heartbeatAnimationId: null,
    heartbeatPhase: 0,

    // Active news headline index
    newsIndex: 0,
    newsTimer: null,

    /**
     * Initialize all UI components
     */
    init() {
        this.initPieChart();
        this.initTabs();
    },

    // ===== SCREEN MANAGEMENT =====

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    },

    hideLoading() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => { loading.style.display = 'none'; }, 500);
        }
    },

    // ===== TABS =====

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    },

    switchTab(tabName) {
        // Deactivate all
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        // Activate selected
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        if (btn) btn.classList.add('active');
        if (panel) panel.classList.add('active');
    },

    setDetailsTabLocked(locked) {
        const notice = document.getElementById('details-locked-notice');
        const content = document.getElementById('detail-sliders-content');
        const detailSliders = document.querySelectorAll('.detail-slider');
        const detailTabBtn = document.getElementById('details-tab-btn');

        if (locked) {
            if (notice) notice.style.display = 'block';
            if (content) content.style.display = 'none';
            detailSliders.forEach(s => s.disabled = true);
            if (detailTabBtn) {
                detailTabBtn.style.opacity = '0.5';
                detailTabBtn.title = 'Complete Round 1 first';
            }
        } else {
            if (notice) notice.style.display = 'none';
            if (content) content.style.display = 'flex';
            detailSliders.forEach(s => s.disabled = false);
            if (detailTabBtn) {
                detailTabBtn.style.opacity = '1';
                detailTabBtn.title = '';
            }
        }
    },

    // ===== ROUND INDICATOR =====

    updateRoundIndicator(round) {
        document.querySelectorAll('.round-step').forEach(step => {
            const stepNum = parseInt(step.dataset.round);
            step.classList.remove('active', 'completed');
            if (stepNum === round) {
                step.classList.add('active');
            } else if (stepNum < round) {
                step.classList.add('completed');
            }
        });
    },

    updateRoundButton(round) {
        const btn = document.getElementById('lock-round-btn');
        if (!btn) return;
        if (round < 3) {
            btn.textContent = `LOCK IN ROUND ${round}`;
        } else {
            btn.textContent = 'FINALIZE THE DEAL';
        }
    },

    showRoundTransition(newRound) {
        // Create/show a brief centered overlay
        let el = document.getElementById('round-transition-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'round-transition-toast';
            el.className = 'round-transition-toast';
            el.innerHTML = `
                <div class="round-transition-num" id="rt-num"></div>
                <div class="round-transition-label" id="rt-label"></div>
            `;
            document.body.appendChild(el);
        }

        const roundData = MLBData.rounds[newRound - 1];
        document.getElementById('rt-num').textContent = `Round ${newRound}`;
        document.getElementById('rt-label').textContent = roundData ? roundData.label : 'Next Round';

        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2000);
    },

    // ===== ALLOCATION DISPLAY =====

    updateAllocationDisplay(stakeholder, value) {
        const amountEl = document.getElementById(`${stakeholder}-amount`);
        const percentEl = document.getElementById(`${stakeholder}-percent`);

        if (amountEl) amountEl.textContent = `$${value.toFixed(1)}B`;
        if (percentEl) percentEl.textContent = `${Math.round(value / 8.0 * 100)}%`;

        this.updatePieChart();
    },

    // ===== SLIDER DISPLAYS =====

    updateSliderDisplay(sliderId, value) {
        const el = document.getElementById(`${sliderId}-value`);
        if (el) el.textContent = value;
    },

    updateCompetitiveBalance(revenueShare) {
        const fill = document.getElementById('balance-fill');
        const text = document.getElementById('balance-text');

        if (fill) {
            const position = ((revenueShare - 10) / 50) * 100;
            fill.style.left = `calc(${position}% - 5px)`;
        }
        if (text) {
            text.textContent = Calculations.getBalanceText(revenueShare);
        }
    },

    updateStartTimeImpact(impact) {
        const el = document.getElementById('start-time-impact');
        if (el) el.textContent = impact;
    },

    updateViewerSplit(streaming) {
        const cable = document.getElementById('cable-viewers');
        const stream = document.getElementById('streaming-viewers');
        const cablePct = 100 - streaming;

        if (cable) {
            cable.style.width = `${cablePct}%`;
            const span = cable.querySelector('span');
            if (span) span.textContent = `Cable ${cablePct}%`;
        }
        if (stream) {
            stream.style.width = `${streaming}%`;
            const span = stream.querySelector('span');
            if (span) span.textContent = `Stream ${streaming}%`;
        }
    },

    // ===== RESTORE SLIDERS (for undo) =====

    restoreSliders(snapshot) {
        // Allocation sliders
        const allocationMap = {
            'players-slider': snapshot.allocation.players,
            'owners-slider':  snapshot.allocation.owners,
            'networks-slider': snapshot.allocation.networks,
            'league-slider':  snapshot.allocation.league
        };
        Object.entries(allocationMap).forEach(([id, val]) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = val;
            const key = id.replace('-slider', '');
            this.updateAllocationDisplay(key, val);
        });

        // Detail sliders
        const detailMap = {
            'min-salary-slider':   { val: snapshot.minSalary,    display: () => `$${snapshot.minSalary}K` },
            'revenue-share-slider':{ val: snapshot.revenueShare, display: () => `${snapshot.revenueShare}%` },
            'start-time-slider':   { val: snapshot.startTime,    display: () => MLBData.startTimes[snapshot.startTime]?.time || '7:30 PM' },
            'streaming-slider':    { val: snapshot.streaming,    display: () => `${snapshot.streaming}%` },
            'salary-share-slider': { val: snapshot.salaryShare,  display: () => `${snapshot.salaryShare}%` }
        };

        Object.entries(detailMap).forEach(([id, { val, display }]) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = val;
        });

        this.updateSliderDisplay('min-salary', `$${snapshot.minSalary}K`);
        this.updateSliderDisplay('revenue-share', `${snapshot.revenueShare}%`);
        this.updateSliderDisplay('start-time', MLBData.startTimes[snapshot.startTime]?.time || '7:30 PM');
        this.updateSliderDisplay('streaming', `${snapshot.streaming}%`);
        this.updateSliderDisplay('salary-share', `${snapshot.salaryShare}%`);
        this.updateCompetitiveBalance(snapshot.revenueShare);
        this.updateViewerSplit(snapshot.streaming);
    },

    // ===== SATISFACTION DISPLAY =====

    updateSatisfactions(satisfactions) {
        Object.keys(satisfactions).forEach(stakeholder => {
            this.updateStakeholderCard(stakeholder, satisfactions[stakeholder]);
        });

        const overall = Calculations.calculateOverallScore(satisfactions);
        this.updateOverallScore(overall, satisfactions);

        const stability = Calculations.checkStability(satisfactions);
        this.updateStabilityPill(stability);
    },

    updateStakeholderCard(stakeholder, satisfaction) {
        // Bar fill
        const bar = document.getElementById(`${stakeholder}-satisfaction`);
        if (bar) bar.style.width = `${satisfaction}%`;

        // Percent text
        const pct = document.getElementById(`${stakeholder}-sat-percent`);
        if (pct) pct.textContent = `${satisfaction}%`;

        // Emoji face
        const face = document.getElementById(`${stakeholder}-face`);
        if (face) face.textContent = Calculations.getEmoji(satisfaction);

        // Comment
        const comment = document.getElementById(`${stakeholder}-comment`);
        if (comment) comment.textContent = `"${Calculations.getComment(stakeholder, satisfaction)}"`;

        // Card risk state
        const card = document.getElementById(`card-${stakeholder}`);
        if (card) {
            card.classList.remove('at-risk', 'warning-risk');
            if (satisfaction < 50) card.classList.add('at-risk');
            else if (satisfaction < 60) card.classList.add('warning-risk');
        }

        // Bar color: override via CSS class already handled, but also sync pct color
        if (pct) {
            pct.style.color = satisfaction < 50 ? 'var(--red)' :
                              satisfaction < 65 ? 'var(--yellow)' : '';
        }
    },

    updateOverallScore(overall, satisfactions) {
        const scoreEl = document.getElementById('overall-score');
        const tierEl = document.getElementById('score-tier');

        if (scoreEl) scoreEl.textContent = `${overall}%`;
        if (tierEl) {
            const tierInfo = Calculations.determineTier(satisfactions);
            tierEl.textContent = tierInfo.label || tierInfo.tier.toUpperCase();
            tierEl.className = `score-tier ${tierInfo.tier}`;
        }
    },

    updateStabilityPill(stability) {
        const pill = document.getElementById('stability-pill');
        const label = document.getElementById('stability-status');

        if (!pill || !label) return;

        pill.className = `stability-pill ${stability}`;

        const labels = {
            stable: 'STABLE',
            warning: 'WARNING',
            danger: 'DANGER',
            collapsed: 'COLLAPSED'
        };
        label.textContent = labels[stability] || 'STABLE';
    },

    // ===== PROGRESS BAR =====

    updateProgress(percent) {
        const fill = document.getElementById('game-progress');
        if (fill) fill.style.width = `${percent}%`;
    },

    // ===== PIE CHART =====

    initPieChart() {
        this.updatePieChart();
    },

    updatePieChart() {
        const canvas = document.getElementById('money-pie-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 8;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const allocations = Game.state.allocation;
        const total = allocations.players + allocations.owners + allocations.networks + allocations.league;

        const colors = {
            players: '#3b82f6',
            owners:  '#a855f7',
            networks:'#f59e0b',
            league:  '#6b7280'
        };

        let startAngle = -Math.PI / 2;

        Object.keys(allocations).forEach(key => {
            const sliceAngle = (allocations[key] / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = colors[key];
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            startAngle += sliceAngle;
        });

        // Donut center
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.58, 0, 2 * Math.PI);
        ctx.fillStyle = '#06080f';
        ctx.fill();
    },

    // ===== HEARTBEAT (kept for compatibility, now minimal) =====

    stopHeartbeat() {
        if (this.heartbeatAnimationId) {
            cancelAnimationFrame(this.heartbeatAnimationId);
        }
    },

    // ===== BREAKING NEWS TICKER =====

    updateNewsTicker(state, satisfactions) {
        const tickerEl = document.getElementById('news-ticker');
        if (!tickerEl) return;

        // Find applicable headlines (conditions check)
        const satObj = satisfactions ? {
            overall: Calculations.calculateOverallScore(satisfactions),
            players: satisfactions.players,
            owners:  satisfactions.owners,
            networks:satisfactions.networks,
            fans:    satisfactions.fans
        } : null;

        const applicable = MLBData.newsHeadlines.filter(h => {
            try { return h.condition(state, satObj); } catch(e) { return false; }
        });

        if (applicable.length === 0) return;

        // Pick a varied headline (cycle through applicable ones)
        const idx = Math.floor(Date.now() / 8000) % applicable.length;
        const headline = applicable[idx].text;

        if (tickerEl.textContent !== headline) {
            tickerEl.style.opacity = '0';
            setTimeout(() => {
                tickerEl.textContent = headline;
                tickerEl.style.opacity = '1';
                // Reset animation
                tickerEl.style.animation = 'none';
                tickerEl.offsetHeight; // reflow
                tickerEl.style.animation = '';
            }, 300);
        }
    },

    // ===== ADVISOR TIPS =====

    updateAdvisorTips(state, satisfactions) {
        const container = document.getElementById('advisor-tips-list');
        if (!container) return;

        const satObj = satisfactions ? {
            overall: Calculations.calculateOverallScore(satisfactions),
            ...satisfactions
        } : null;

        // Find top-priority applicable tips (max 3)
        const applicable = MLBData.advisorTips
            .filter(t => {
                try { return t.condition(state, satObj); } catch(e) { return false; }
            })
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3);

        if (applicable.length === 0) return;

        const playersPercent = Math.round((state.allocation.players / 8.0) * 100);

        container.innerHTML = applicable.map(tip => {
            const text = tip.text.replace('{{playersPercent}}', playersPercent);
            return `
                <div class="advisor-tip">
                    <span class="tip-icon">${tip.icon}</span>
                    <span class="tip-text">${text}</span>
                </div>
            `;
        }).join('');

        // Update unlock badges
        this.updateUnlockBadges(state.unlockedBoosts);
    },

    updateUnlockBadges(boosts) {
        if (!boosts) return;

        const badges = {
            'unlock-salary-badge': boosts.salaryBoost,
            'unlock-primetime-badge': boosts.primeTimeGuarantee,
            'unlock-market-badge': boosts.marketFlexibility,
            'unlock-credibility-badge': boosts.leagueCredibility > 0
        };

        Object.entries(badges).forEach(([id, unlocked]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = unlocked ? 'ACTIVE' : 'LOCKED';
            el.className = `unlock-badge ${unlocked ? 'unlocked' : 'locked'}`;
        });
    },

    // ===== DEMAND MODAL =====

    showDemandModal(demand) {
        const modal = document.getElementById('demand-modal');
        if (!modal) return;

        // Stakeholder avatar emojis
        const avatars = {
            players:  '&#9918;',
            owners:   '&#127970;',
            networks: '&#128250;',
            fans:     '&#127944;'
        };

        const avatarEl = document.getElementById('demand-avatar');
        if (avatarEl) avatarEl.innerHTML = avatars[demand.stakeholder] || '&#9918;';

        const nameEl = document.getElementById('demand-stakeholder-name');
        if (nameEl) nameEl.textContent = demand.name;

        const quoteEl = document.getElementById('demand-quote');
        if (quoteEl) quoteEl.textContent = `"${demand.demand}"`;

        const fixEl = document.getElementById('demand-fix');
        if (fixEl) fixEl.textContent = demand.fix;

        modal.style.display = 'flex';
        modal.classList.add('active');
    },

    closeDemandModal() {
        const modal = document.getElementById('demand-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    // ===== COLLAPSE DRAMA =====

    triggerCollapseWarning(lowestStakeholder) {
        // Show full-screen flash overlay
        const overlay = document.getElementById('collapse-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 2000);
        }

        // Show collapse modal
        const modal = document.getElementById('collapse-modal');
        const body = document.getElementById('collapse-body');

        if (body) {
            body.textContent = `${lowestStakeholder.name} has left the table (${lowestStakeholder.value}% satisfaction). ` +
                'Fix this immediately or the deal will collapse.';
        }

        setTimeout(() => {
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        }, 1800);
    },

    closeCollapseModal() {
        const modal = document.getElementById('collapse-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    // ===== RESULTS SCREEN =====

    showResults(result, satisfactions, gameState) {
        const tierDisplay = CodeGenerator.getTierDisplay(result.tier);

        document.getElementById('result-badge').textContent = tierDisplay.emoji;
        document.getElementById('results-title').textContent = tierDisplay.title;
        document.getElementById('results-subtitle').textContent = tierDisplay.subtitle;
        document.getElementById('results-subtitle').className = `results-subtitle ${result.tier}`;

        document.getElementById('results-message').querySelector('p').textContent = result.message;

        // Animate bars from 0 to final
        this.animateFinalBars(satisfactions);

        // Summary
        document.getElementById('summary-players').textContent = `$${gameState.allocation.players.toFixed(1)}B`;
        document.getElementById('summary-owners').textContent = `$${gameState.allocation.owners.toFixed(1)}B`;
        document.getElementById('summary-min-salary').textContent = `$${gameState.minSalary}K`;
        document.getElementById('summary-revenue-share').textContent = `${gameState.revenueShare}%`;
        document.getElementById('summary-streaming').textContent = `${gameState.streaming}%`;
        document.getElementById('summary-salary-share').textContent = `${gameState.salaryShare}%`;

        // Key decisions
        this.populateKeyDecisions(gameState.keyDecisions || []);

        // Historical comparison
        this.populateHistoricalComparison(gameState);

        // Claim code
        const claimSection = document.getElementById('claim-code-section');
        const failedSection = document.getElementById('failed-section');

        if (result.success && result.code) {
            claimSection.style.display = 'block';
            claimSection.className = `claim-code-section ${result.tier}`;
            document.getElementById('claim-code').textContent = result.code;
            failedSection.style.display = 'none';
        } else {
            claimSection.style.display = 'none';
            failedSection.style.display = 'block';
            const lowest = Calculations.getLowestStakeholder(satisfactions);
            document.getElementById('failed-reason').textContent =
                `${lowest.name} walked away from negotiations (${lowest.value}% satisfaction).`;
        }

        this.showScreen('results-screen');
    },

    animateFinalBars(satisfactions) {
        // Start at 0, animate to final value
        const keys = ['players', 'owners', 'networks', 'fans'];
        keys.forEach(k => {
            const bar = document.getElementById(`final-${k}-bar`);
            const pct = document.getElementById(`final-${k}-percent`);
            if (bar) bar.style.width = '0%';
            if (pct) pct.textContent = '0%';
        });

        setTimeout(() => {
            keys.forEach(k => {
                const bar = document.getElementById(`final-${k}-bar`);
                const pct = document.getElementById(`final-${k}-percent`);
                if (bar) bar.style.width = `${satisfactions[k]}%`;
                if (pct) pct.textContent = `${satisfactions[k]}%`;
            });
        }, 400);
    },

    populateKeyDecisions(decisions) {
        const section = document.getElementById('key-decisions-section');
        const list = document.getElementById('key-decisions-list');
        if (!list) return;

        if (!decisions || decisions.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';

        list.innerHTML = decisions.map(d => {
            const isPositive = d.includes('balanced') || d.includes('sweet spot') || d.includes('helped') || d.includes('good') || d.includes('balance');
            return `<li class="${isPositive ? 'positive' : ''}">${d}</li>`;
        }).join('');
    },

    populateHistoricalComparison(gameState) {
        const container = document.getElementById('comparison-grid');
        const section = document.getElementById('historical-comparison');
        if (!container || !section) return;

        const current = MLBData.historicalDeals.current;
        const userPlayerPct = Math.round((gameState.allocation.players / 8.0) * 100);
        const currentPlayerPct = Math.round((current.playerPool / 8.0) * 100);

        const comparisons = [
            {
                label: 'Player Allocation',
                user: `${userPlayerPct}%`,
                baseline: `${currentPlayerPct}%`,
                higher: userPlayerPct > currentPlayerPct
            },
            {
                label: 'Min Salary',
                user: `$${gameState.minSalary}K`,
                baseline: `$${current.minSalary}K`,
                higher: gameState.minSalary > current.minSalary
            },
            {
                label: 'Revenue Sharing',
                user: `${gameState.revenueShare}%`,
                baseline: `${current.revenueShare}%`,
                higher: gameState.revenueShare > current.revenueShare
            },
            {
                label: 'Player Salary Share',
                user: `${gameState.salaryShare}%`,
                baseline: `${current.salaryShare}%`,
                higher: gameState.salaryShare > current.salaryShare
            }
        ];

        container.innerHTML = comparisons.map(c => `
            <div class="comparison-item">
                <span class="comparison-label">${c.label}</span>
                <div class="comparison-row">
                    <span class="comp-key">Your Deal</span>
                    <span class="comp-val ${c.higher ? 'higher' : 'lower'}">${c.user}</span>
                </div>
                <div class="comparison-row">
                    <span class="comp-key">Current MLB</span>
                    <span class="comp-val">${c.baseline}</span>
                </div>
            </div>
        `).join('');

        section.style.display = 'block';
    },

    // ===== TOAST NOTIFICATIONS =====

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // ===== FLASH UTILITY =====

    flashElement(elementId, type = 'success') {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.classList.add(`flash-${type}`);
        setTimeout(() => el.classList.remove(`flash-${type}`), 500);
    }
};

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
