/**
 * MLB Money Maker v2 - Interactions Module
 * Handles sliders, mini-games with targeted unlocks, and drag-drop
 */

const Interactions = {
    // Mini-game state
    miniGameState: {
        active: null,
        timer: null,
        timeLeft: 0,
        score: 0,
        data: null
    },

    /**
     * Initialize all slider interactions
     */
    initSliders() {
        // Allocation sliders
        const allocationSliders = document.querySelectorAll('.allocation-slider');
        allocationSliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.handleAllocationSlider(e));
        });

        // Detail sliders
        const detailSliders = document.querySelectorAll('.detail-slider');
        detailSliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.handleDetailSlider(e));
        });
    },

    /**
     * Handle allocation slider changes
     */
    handleAllocationSlider(e) {
        // Take snapshot before first change for undo
        if (!Game.state.previousSnapshot && Game.state.undosUsed === 0) {
            Game.takeSnapshot();
            const undoBtn = document.getElementById('undo-btn');
            if (undoBtn) undoBtn.disabled = false;
        }

        const slider = e.target;
        const stakeholder = slider.id.replace('-slider', '');
        const value = parseFloat(slider.value);

        // Update game state
        Game.state.allocation[stakeholder] = value;

        // Update UI
        UI.updateAllocationDisplay(stakeholder, value);

        // Recalculate total and check validity
        this.validateAllocation();

        // Update all satisfactions
        Game.updateSatisfactions();
    },

    /**
     * Validate that allocations sum to $8B
     */
    validateAllocation() {
        const total = Game.state.allocation.players +
                      Game.state.allocation.owners +
                      Game.state.allocation.networks +
                      Game.state.allocation.league;

        const warning = document.getElementById('allocation-warning');
        const isValid = Math.abs(total - 8.0) <= 0.1;

        if (warning) {
            warning.style.display = isValid ? 'none' : 'flex';
        }

        return isValid;
    },

    /**
     * Handle detail slider changes
     */
    handleDetailSlider(e) {
        // Take snapshot before first change for undo
        if (!Game.state.previousSnapshot && Game.state.undosUsed === 0) {
            Game.takeSnapshot();
            const undoBtn = document.getElementById('undo-btn');
            if (undoBtn) undoBtn.disabled = false;
        }

        const slider = e.target;
        const id = slider.id;
        const value = parseFloat(slider.value);

        // Update game state based on slider
        switch (id) {
            case 'min-salary-slider':
                Game.state.minSalary = value;
                UI.updateSliderDisplay('min-salary', `$${value}K`);
                break;

            case 'revenue-share-slider':
                Game.state.revenueShare = value;
                UI.updateSliderDisplay('revenue-share', `${value}%`);
                UI.updateCompetitiveBalance(value);
                break;

            case 'start-time-slider':
                Game.state.startTime = value;
                const timeData = MLBData.startTimes[value];
                UI.updateSliderDisplay('start-time', timeData.time);
                UI.updateStartTimeImpact(timeData.impact);
                break;

            case 'streaming-slider':
                Game.state.streaming = value;
                UI.updateSliderDisplay('streaming', `${value}%`);
                UI.updateViewerSplit(value);
                break;

            case 'salary-share-slider':
                Game.state.salaryShare = value;
                UI.updateSliderDisplay('salary-share', `${value}%`);
                break;
        }

        // Update satisfactions
        Game.updateSatisfactions();
    },

    /**
     * Initialize mini-game triggers
     */
    initMiniGames() {
        // Mini-game button
        const miniGameBtn = document.getElementById('mini-game-btn');
        if (miniGameBtn) {
            miniGameBtn.addEventListener('click', () => this.showMiniGameSelect());
        }

        // Close button
        const closeBtn = document.getElementById('close-mini-game');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMiniGame());
        }

        // Mini-game options
        const options = document.querySelectorAll('.mini-game-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.startMiniGame(gameType);
            });
        });

        // Done buttons — each passes back the game type
        [
            { id: 'salary-match-done', game: 'salary-match' },
            { id: 'network-click-done', game: 'network-click' },
            { id: 'stadium-puzzle-done', game: 'stadium-puzzle' },
            { id: 'cap-calculator-done', game: 'cap-calculator' }
        ].forEach(({ id, game }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.completeMiniGame(game));
            }
        });
    },

    /**
     * Show mini-game selection modal
     */
    showMiniGameSelect() {
        const modal = document.getElementById('mini-game-modal');
        const selectSection = document.getElementById('mini-game-select');

        document.querySelectorAll('.mini-game-section').forEach(s => {
            s.style.display = 'none';
        });

        selectSection.style.display = 'block';
        modal.classList.add('active');
    },

    /**
     * Close mini-game modal
     */
    closeMiniGame() {
        const modal = document.getElementById('mini-game-modal');
        modal.classList.remove('active');

        if (this.miniGameState.timer) {
            clearInterval(this.miniGameState.timer);
        }

        this.miniGameState = {
            active: null,
            timer: null,
            timeLeft: 0,
            score: 0,
            data: null
        };
    },

    /**
     * Start a specific mini-game
     */
    startMiniGame(gameType) {
        document.getElementById('mini-game-select').style.display = 'none';

        const gameSection = document.getElementById(`${gameType}-game`);
        if (gameSection) {
            gameSection.style.display = 'block';
        }

        this.miniGameState.active = gameType;

        switch (gameType) {
            case 'salary-match':
                this.initSalaryMatchGame();
                break;
            case 'network-click':
                this.initNetworkClickGame();
                break;
            case 'stadium-puzzle':
                this.initStadiumPuzzleGame();
                break;
            case 'cap-calculator':
                this.initCapCalculatorGame();
                break;
        }
    },

    /**
     * Complete mini-game and apply targeted bonus
     */
    completeMiniGame(gameType) {
        const correct = this.miniGameState.score;
        const total = this.miniGameState.data?.total || 5;

        // Apply targeted bonus based on game type
        Game.applyMiniGameBonus(gameType, correct, total);

        this.closeMiniGame();
    },

    // ===== SALARY MATCH GAME =====

    initSalaryMatchGame() {
        const playerCards = document.getElementById('player-cards');
        const result = document.getElementById('salary-match-result');
        result.style.display = 'none';

        const players = getRandomPlayers(8);
        this.miniGameState.data = {
            players: players,
            placed: 0,
            correct: 0,
            total: players.length
        };
        this.miniGameState.score = 0;

        playerCards.innerHTML = '';

        ['superstar', 'allstar', 'midtier', 'minimum'].forEach(tier => {
            document.getElementById(`tier-${tier}`).innerHTML = '';
        });

        players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card-mini';
            card.draggable = true;
            card.dataset.index = index;
            card.dataset.tier = player.tier;
            card.dataset.salary = player.salary;

            card.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-team">${MLBData.teams[player.team]?.abbr || ''}</div>
            `;

            card.addEventListener('dragstart', (e) => this.handleDragStart(e, 'salary'));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));

            playerCards.appendChild(card);
        });

        document.querySelectorAll('.salary-tier').forEach(tier => {
            const dropzone = tier.querySelector('.tier-dropzone');
            dropzone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropzone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropzone.addEventListener('drop', (e) => this.handleSalaryDrop(e, tier.dataset.tier));
        });

        this.startTimer(30, 'salary-match-timer');
    },

    handleSalaryDrop(e, targetTier) {
        e.preventDefault();
        e.currentTarget.parentElement.classList.remove('drag-over');

        const cardIndex = e.dataTransfer.getData('text/plain');
        const card = document.querySelector(`.player-card-mini[data-index="${cardIndex}"]`);
        if (!card) return;

        const actualTier = card.dataset.tier;
        const dropzone = e.currentTarget;

        dropzone.appendChild(card);
        card.draggable = false;

        const isCorrect = actualTier === targetTier;
        card.style.borderColor = isCorrect ? '#22c55e' : '#ef4444';
        card.style.opacity = '0.85';

        this.miniGameState.data.placed++;
        if (isCorrect) {
            this.miniGameState.data.correct++;
            this.miniGameState.score++;
        }

        if (this.miniGameState.data.placed >= this.miniGameState.data.total) {
            this.finishSalaryMatchGame();
        }
    },

    finishSalaryMatchGame() {
        if (this.miniGameState.timer) clearInterval(this.miniGameState.timer);

        const result = document.getElementById('salary-match-result');
        const resultText = result.querySelector('.result-text');
        const correct = this.miniGameState.data.correct;
        const total = this.miniGameState.data.total;
        const isHigh = correct / total >= 0.8;

        resultText.innerHTML = `You got ${correct}/${total} correct!` +
            (isHigh ? ' <strong>UNLOCK EARNED: Salary Boost</strong>' : '');
        resultText.className = correct >= total * 0.6 ? 'result-text success' : 'result-text partial';
        result.style.display = 'block';
    },

    // ===== NETWORK CLICK GAME =====

    initNetworkClickGame() {
        const sequenceDiv = document.getElementById('network-sequence');
        const buttonsDiv = document.getElementById('network-buttons');
        const result = document.getElementById('network-click-result');
        result.style.display = 'none';

        const networks = MLBData.networks.map(n => n.id);
        const sequence = [];
        for (let i = 0; i < 5; i++) {
            sequence.push(networks[Math.floor(Math.random() * networks.length)]);
        }

        this.miniGameState.data = {
            sequence: sequence,
            currentIndex: 0,
            correct: 0,
            total: 5
        };
        this.miniGameState.score = 0;

        sequenceDiv.innerHTML = sequence.map((network, i) => {
            const name = MLBData.networks.find(n => n.id === network)?.logo || network;
            return `<span class="network-item" data-index="${i}">${name}</span>`;
        }).join('');

        sequenceDiv.querySelector('[data-index="0"]').classList.add('active');
        document.getElementById('click-progress-text').textContent = '0 / 5';

        buttonsDiv.querySelectorAll('.network-btn').forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.onclick = (e) => this.handleNetworkClick(e.target.dataset.network);
        });

        this.startTimer(20, 'network-click-timer');
    },

    handleNetworkClick(clickedNetwork) {
        const data = this.miniGameState.data;
        const expected = data.sequence[data.currentIndex];
        const btn = document.querySelector(`.network-btn[data-network="${clickedNetwork}"]`);
        const sequenceItem = document.querySelector(`.network-item[data-index="${data.currentIndex}"]`);

        if (clickedNetwork === expected) {
            btn.classList.add('correct');
            setTimeout(() => btn.classList.remove('correct'), 300);

            sequenceItem.classList.remove('active');
            sequenceItem.classList.add('completed');

            data.correct++;
            data.currentIndex++;
            this.miniGameState.score = data.correct;

            document.getElementById('click-progress-text').textContent =
                `${data.currentIndex} / 5`;

            if (data.currentIndex < 5) {
                const nextItem = document.querySelector(`.network-item[data-index="${data.currentIndex}"]`);
                if (nextItem) nextItem.classList.add('active');
            } else {
                this.finishNetworkClickGame();
            }
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 300);
        }
    },

    finishNetworkClickGame() {
        if (this.miniGameState.timer) clearInterval(this.miniGameState.timer);

        const result = document.getElementById('network-click-result');
        const resultText = result.querySelector('.result-text');
        const correct = this.miniGameState.data.correct;
        const isHigh = correct / 5 >= 0.8;

        resultText.innerHTML = `You completed ${correct}/5 in order!` +
            (isHigh ? ' <strong>UNLOCK EARNED: Prime Time Guarantee</strong>' : '');
        resultText.className = correct >= 4 ? 'result-text success' : 'result-text partial';
        result.style.display = 'block';
    },

    // ===== STADIUM PUZZLE GAME =====

    initStadiumPuzzleGame() {
        const teamsDiv = document.getElementById('market-teams');
        const result = document.getElementById('stadium-puzzle-result');
        result.style.display = 'none';

        const smallTeams = MLBData.teamsByMarket.small.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        const mediumTeams = MLBData.teamsByMarket.medium.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        const largeTeams = MLBData.teamsByMarket.large.slice().sort(() => Math.random() - 0.5).slice(0, 2);

        const allTeams = [...smallTeams, ...mediumTeams, ...largeTeams]
            .sort(() => Math.random() - 0.5);

        this.miniGameState.data = {
            teams: allTeams.map(key => ({
                key,
                market: this.getTeamMarket(key)
            })),
            placed: 0,
            correct: 0,
            total: 6
        };
        this.miniGameState.score = 0;

        teamsDiv.innerHTML = '';
        ['small', 'medium', 'large'].forEach(market => {
            document.getElementById(`${market}-market-zone`).innerHTML = '';
        });

        allTeams.forEach((teamKey, index) => {
            const team = MLBData.teams[teamKey];
            if (!team) return;

            const chip = document.createElement('div');
            chip.className = 'team-chip';
            chip.draggable = true;
            chip.dataset.index = index;
            chip.dataset.market = this.getTeamMarket(teamKey);
            chip.style.borderColor = team.colors.primary;
            chip.textContent = team.abbr;

            chip.addEventListener('dragstart', (e) => this.handleDragStart(e, 'stadium'));
            chip.addEventListener('dragend', (e) => this.handleDragEnd(e));

            teamsDiv.appendChild(chip);
        });

        document.querySelectorAll('.market-bucket').forEach(bucket => {
            const dropzone = bucket.querySelector('.bucket-dropzone');
            dropzone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropzone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropzone.addEventListener('drop', (e) => this.handleStadiumDrop(e, bucket.dataset.market));
        });

        this.startTimer(30, 'stadium-timer');
    },

    getTeamMarket(teamKey) {
        if (MLBData.teamsByMarket.small.includes(teamKey)) return 'small';
        if (MLBData.teamsByMarket.large.includes(teamKey)) return 'large';
        return 'medium';
    },

    handleStadiumDrop(e, targetMarket) {
        e.preventDefault();
        e.currentTarget.parentElement.classList.remove('drag-over');

        const chipIndex = e.dataTransfer.getData('text/plain');
        const chip = document.querySelector(`.team-chip[data-index="${chipIndex}"]`);
        if (!chip) return;

        const actualMarket = chip.dataset.market;
        const dropzone = e.currentTarget;

        dropzone.appendChild(chip);
        chip.draggable = false;

        const isCorrect = actualMarket === targetMarket;
        chip.style.backgroundColor = isCorrect ? '#22c55e' : '#ef4444';
        chip.style.color = 'white';

        this.miniGameState.data.placed++;
        if (isCorrect) {
            this.miniGameState.data.correct++;
            this.miniGameState.score++;
        }

        if (this.miniGameState.data.placed >= this.miniGameState.data.total) {
            this.finishStadiumPuzzleGame();
        }
    },

    finishStadiumPuzzleGame() {
        if (this.miniGameState.timer) clearInterval(this.miniGameState.timer);

        const result = document.getElementById('stadium-puzzle-result');
        const resultText = result.querySelector('.result-text');
        const correct = this.miniGameState.data.correct;
        const total = this.miniGameState.data.total;
        const isHigh = correct / total >= 0.8;

        resultText.innerHTML = `You categorized ${correct}/${total} teams correctly!` +
            (isHigh ? ' <strong>UNLOCK EARNED: Market Flexibility</strong>' : '');
        resultText.className = correct >= total * 0.6 ? 'result-text success' : 'result-text partial';
        result.style.display = 'block';
    },

    // ===== CAP CALCULATOR GAME =====

    initCapCalculatorGame() {
        const problemsDiv = document.getElementById('calculator-problems');
        const result = document.getElementById('cap-calculator-result');
        result.style.display = 'none';

        const problems = [];
        for (let i = 0; i < 3; i++) {
            const revenue = (Math.floor(Math.random() * 5) + 6) * 100; // 600-1000M
            const playerShare = 50;
            const answer = Math.round((revenue * (playerShare / 100)) / 30);
            problems.push({ revenue, playerShare, answer, answered: false });
        }

        this.miniGameState.data = {
            problems,
            currentProblem: 0,
            correct: 0,
            total: 3
        };
        this.miniGameState.score = 0;

        problemsDiv.innerHTML = problems.map((p, i) => `
            <div class="calc-problem" data-index="${i}">
                <p class="calc-question">
                    If MLB makes <strong>$${p.revenue}M</strong> in revenue and players get
                    <strong>${p.playerShare}%</strong>, what is each team's salary cap?
                    <br><small>(Revenue × ${p.playerShare}% ÷ 30 teams)</small>
                </p>
                <div class="calc-input-group">
                    <span>$</span>
                    <input type="number" class="calc-input" data-index="${i}" placeholder="?">
                    <span>M</span>
                    <button class="calc-submit" data-index="${i}">Check</button>
                </div>
                <div class="calc-result" id="calc-result-${i}"></div>
            </div>
        `).join('');

        problemsDiv.querySelectorAll('.calc-submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.checkCalculatorAnswer(parseInt(e.target.dataset.index));
            });
        });

        problemsDiv.querySelectorAll('.calc-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkCalculatorAnswer(parseInt(e.target.dataset.index));
                }
            });
        });

        document.getElementById('calc-score').textContent = '0 / 3 Correct';
    },

    checkCalculatorAnswer(index) {
        const data = this.miniGameState.data;
        const problem = data.problems[index];
        if (problem.answered) return;

        const input = document.querySelector(`.calc-input[data-index="${index}"]`);
        const resultDiv = document.getElementById(`calc-result-${index}`);
        const userAnswer = parseInt(input.value);

        problem.answered = true;
        input.disabled = true;

        const isCorrect = Math.abs(userAnswer - problem.answer) <= 1;

        if (isCorrect) {
            data.correct++;
            this.miniGameState.score++;
            resultDiv.textContent = `Correct! The answer is $${problem.answer}M`;
            resultDiv.className = 'calc-result correct';
        } else {
            resultDiv.textContent = `The answer was $${problem.answer}M`;
            resultDiv.className = 'calc-result incorrect';
        }

        document.getElementById('calc-score').textContent =
            `${data.correct} / 3 Correct`;

        if (data.problems.every(p => p.answered)) {
            this.finishCapCalculatorGame();
        }
    },

    finishCapCalculatorGame() {
        const result = document.getElementById('cap-calculator-result');
        const resultText = result.querySelector('.result-text');
        const correct = this.miniGameState.data.correct;
        const isHigh = correct >= 3;

        resultText.innerHTML = `You got ${correct}/3 calculations correct!` +
            (isHigh ? ' <strong>UNLOCK EARNED: League Credibility +5</strong>' : '');
        resultText.className = correct >= 2 ? 'result-text success' : 'result-text partial';
        result.style.display = 'block';
    },

    // ===== DRAG AND DROP UTILITIES =====

    handleDragStart(e, gameType) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
    },

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.parentElement.classList.add('drag-over');
    },

    handleDragLeave(e) {
        e.currentTarget.parentElement.classList.remove('drag-over');
    },

    // ===== TIMER =====

    startTimer(seconds, elementId) {
        this.miniGameState.timeLeft = seconds;
        const timerEl = document.getElementById(elementId);

        if (timerEl) {
            timerEl.textContent = seconds;
        }

        this.miniGameState.timer = setInterval(() => {
            this.miniGameState.timeLeft--;

            if (timerEl) {
                timerEl.textContent = this.miniGameState.timeLeft;
            }

            if (this.miniGameState.timeLeft <= 0) {
                clearInterval(this.miniGameState.timer);
                this.handleTimeUp();
            }
        }, 1000);
    },

    handleTimeUp() {
        switch (this.miniGameState.active) {
            case 'salary-match':
                this.finishSalaryMatchGame();
                break;
            case 'network-click':
                this.finishNetworkClickGame();
                break;
            case 'stadium-puzzle':
                this.finishStadiumPuzzleGame();
                break;
        }
    }
};

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interactions;
}
