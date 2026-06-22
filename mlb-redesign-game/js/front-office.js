/* ============================================================
   FRONT OFFICE: THE HOMESTAND  — case engine
   A simple, deterministic choose-your-own-adventure.
   No randomness: every outcome comes from fixed business logic.
   ============================================================ */
(function () {
  "use strict";

  /* ---- The 4 metrics students manage (0–100) ---- */
  var METRICS = [
    { key: "fan",     name: "Fan Energy" },
    { key: "budget",  name: "Budget" },
    { key: "revenue", name: "Revenue" },
    { key: "trust",   name: "Trust" }
  ];

  var START = { fan: 45, budget: 60, revenue: 50, trust: 65 };

  var state = {
    metrics: { fan: 45, budget: 60, revenue: 50, trust: 65 },
    picks: {} // roundId -> optionId
  };

  /* ---- "What worked / tradeoff" copy keyed by metric ---- */
  var WORKED = {
    fan:     "Fans showed up and the building felt alive again.",
    budget:  "You kept the budget healthy, with room to spend on the next surprise.",
    revenue: "You built strong, steady ways for the team to earn money each game.",
    trust:   "Fans and the community trust where the team is headed."
  };
  var TRADEOFF = {
    fan:     "Fan energy stayed shaky — some seats are still empty.",
    budget:  "The budget got tight. There's little room left if something goes wrong.",
    revenue: "You're leaving money on the table — the team isn't earning all it could.",
    trust:   "Some fans feel the team chased dollars more than it chased them."
  };

  /* ---- Decision rounds ---- */
  var ROUNDS = {
    round1: {
      options: [
        {
          id: "r1a",
          title: "Lower family ticket prices",
          blurb: "Cut the price on family four-packs so a night at the game fits a normal budget.",
          upside: "More families can afford to come, so seats fill back up.",
          risk: "You make less money on every ticket you sell.",
          helps: "Families & casual fans",
          weakens: "Money per ticket",
          deltas: { fan: 18, revenue: -12, trust: 10, budget: -4 },
          consequence: {
            headline: "The building filled back up.",
            paras: [
              "Cheaper four-packs worked fast. Families came back, the lower bowl looked full again, and the crowd got loud.",
              "But every ticket now brings in less cash, so the money side feels tighter even with more people in the seats."
            ],
            pressure: "More fans, less money per fan. Now you need a way to earn more without scaring them off.",
            takeaway: "Lower prices fill seats — but you have to make up the money somewhere else."
          }
        },
        {
          id: "r1b",
          title: "Add a giveaway night",
          blurb: "Hand out free jerseys and bobbleheads at the next big home game to create buzz.",
          upside: "A free-giveaway night creates real excitement and buzz.",
          risk: "You pay for all the giveaways up front, before any fans show up.",
          helps: "Excitement & game-night energy",
          weakens: "Budget right now",
          deltas: { fan: 16, budget: -16, revenue: 6, trust: 4 },
          consequence: {
            headline: "The hype was real.",
            paras: [
              "The giveaway night sold out fast. Fans posted photos, the arena buzzed, and people who hadn't come in years showed up.",
              "It worked — but you spent real money on jerseys before a single ticket was sold, and the budget took the hit."
            ],
            pressure: "The buzz is loud, but the bank account is lighter. You need money coming back in soon.",
            takeaway: "Buzz is powerful, but you pay for it up front and hope it pays you back."
          }
        },
        {
          id: "r1c",
          title: "Upgrade food & arena experience",
          blurb: "Better food, shorter lines, and more fun stuff to do — make the whole night worth it.",
          upside: "A better night out makes games worth coming back to again and again.",
          risk: "It costs money now and pays off slowly over time.",
          helps: "The overall fan experience",
          weakens: "Budget now (pays back later)",
          deltas: { fan: 10, budget: -10, revenue: 12, trust: 8 },
          consequence: {
            headline: "Slow build, strong base.",
            paras: [
              "Better food and shorter lines didn't pack the house overnight, but the fans who came spent more and left happier.",
              "You're building something that lasts — it just costs money today and rewards you later, not tonight."
            ],
            pressure: "You're investing in the long game, but ownership wants to see results before the homestand ends.",
            takeaway: "Some smart moves pay off slowly — patience is part of the plan."
          }
        }
      ]
    },
    round2: {
      options: [
        {
          id: "r2a",
          title: "Sell a big national sponsor package",
          blurb: "Let one huge brand put its name all over the arena, the jerseys, and the scoreboard.",
          upside: "A national brand pays a lot to be everywhere in your arena.",
          risk: "Fans may feel the team cares more about ads than about them.",
          helps: "Revenue & budget",
          weakens: "Fan trust",
          deltas: { revenue: 20, budget: 12, trust: -16, fan: -6 },
          consequence: {
            headline: "The check cleared. The fans noticed.",
            paras: [
              "The national deal brought in serious money — enough to steady the budget and fund your fan moves.",
              "But logos went everywhere, and some fans grumbled that the arena felt more like a billboard than a home."
            ],
            pressure: "You've got cash, but trust slipped. Fans are watching to see if you still care about them.",
            takeaway: "Big sponsor money is real money — but it can cost you fan trust if you overdo it."
          }
        },
        {
          id: "r2b",
          title: "Partner with a trusted local business",
          blurb: "Team up with a beloved local company fans already know and like.",
          upside: "A trusted local name makes fans feel the team is part of their town.",
          risk: "It brings in less money than a giant national deal.",
          helps: "Fan trust & local pride",
          weakens: "Short-term money",
          deltas: { revenue: 8, trust: 14, budget: 4, fan: 4 },
          consequence: {
            headline: "Hometown move, hometown love.",
            paras: [
              "Fans loved seeing a local name they trust. It felt genuine, not corporate, and goodwill went up across the city.",
              "The catch: a local partner can't pay what a national giant would, so the money bump is smaller."
            ],
            pressure: "Trust is high and the brand feels real — but the budget still needs a bigger engine.",
            takeaway: "The trusted choice builds loyalty, even when it earns a little less."
          }
        },
        {
          id: "r2c",
          title: "Create a youth sports night",
          blurb: "Invite local kids' teams to play on the court and watch the game for free.",
          upside: "Inviting local kids builds real community goodwill for years.",
          risk: "It takes staff time and planning, and earns very little cash.",
          helps: "The community & future fans",
          weakens: "Budget & staff time",
          deltas: { trust: 16, fan: 10, budget: -8, revenue: 2 },
          consequence: {
            headline: "Tomorrow's season-ticket holders.",
            paras: [
              "Kids played on the floor, families packed the stands, and the city saw a team that gives back. Trust soared.",
              "It cost staff hours and didn't make much money tonight — but you may have just made fans for life."
            ],
            pressure: "You're winning hearts, not dollars. Ownership still wants to see the money plan.",
            takeaway: "Investing in the community is slow money but strong loyalty."
          }
        }
      ]
    },
    round3: {
      options: [
        {
          id: "r3a",
          title: "Fan-first plan",
          blurb: "Tell ownership: keep prices fair and the experience great. Happy fans come first.",
          upside: "A packed, happy arena builds a brand that lasts for years.",
          risk: "It may take longer to turn all that energy into profit.",
          helps: "Fans & long-term brand",
          weakens: "Short-term profit",
          deltas: { fan: 12, trust: 10, revenue: -6 },
          strategyName: "The Fan-First Plan",
          strategyLine: "You bet on the fans. Keep it affordable, keep it fun, and trust that a full, loyal building pays off down the road.",
          ownershipAsk: "Ownership will ask: when does all this fan love actually turn into money?"
        },
        {
          id: "r3b",
          title: "Revenue-first plan",
          blurb: "Tell ownership: maximize what each game earns so the team can spend and compete.",
          upside: "More money now means the team can afford better players and upgrades.",
          risk: "Pushing too hard on revenue can wear out fan trust.",
          helps: "The budget & the team on the court",
          weakens: "Fan trust",
          deltas: { revenue: 14, budget: 8, trust: -8, fan: -4 },
          strategyName: "The Revenue-First Plan",
          strategyLine: "You bet on the books. Earn enough now to fund a winning team — and count on wins to bring the fans back.",
          ownershipAsk: "Ownership will ask: are we pushing fans away just to hit our numbers?"
        },
        {
          id: "r3c",
          title: "Balanced growth plan",
          blurb: "Tell ownership: a little for the fans, a little for the books — grow both at once.",
          upside: "You protect fans and revenue at the same time, lowering the risk.",
          risk: "Doing a little of everything may not feel bold or stand out.",
          helps: "A bit of everyone",
          weakens: "Big, standout wins",
          deltas: { fan: 5, revenue: 6, trust: 5, budget: 2 },
          strategyName: "The Balanced Growth Plan",
          strategyLine: "You bet on balance. Move fans and revenue forward together, take less risk, and keep every group in the room reasonably happy.",
          ownershipAsk: "Ownership will ask: is 'a little of everything' bold enough to stand out from other teams?"
        }
      ]
    }
  };

  var ROUND_LABEL = { round1: "Fan Strategy", round2: "Sponsor Strategy", round3: "Final Plan" };

  /* ---- Helpers ---- */
  function clamp(n) { return Math.max(0, Math.min(100, n)); }

  function applyDeltas(deltas) {
    Object.keys(deltas).forEach(function (k) {
      state.metrics[k] = clamp(state.metrics[k] + deltas[k]);
    });
  }

  function getOption(roundId, optionId) {
    var opts = ROUNDS[roundId].options;
    for (var i = 0; i < opts.length; i++) if (opts[i].id === optionId) return opts[i];
    return null;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---- Renderers ---- */
  function renderRail(railName) {
    var rail = document.querySelector('[data-rail="' + railName + '"]');
    if (!rail) return;
    rail.innerHTML = "";
    METRICS.forEach(function (m) {
      var v = state.metrics[m.key];
      var meter = el("div", "meter");
      meter.setAttribute("data-metric", m.key);
      meter.innerHTML =
        '<div class="meter-head"><span class="meter-name">' + m.name + '</span>' +
        '<span class="meter-num">' + v + '</span></div>' +
        '<div class="meter-track"><div class="meter-fill" style="width:' + v + '%"></div></div>';
      rail.appendChild(meter);
    });
  }

  function renderAllRails() {
    ["situation", "round1", "round2", "round3"].forEach(renderRail);
  }

  function impactTags(deltas) {
    // Show the strongest 3 effects as +/- chips, sorted by size.
    var keys = Object.keys(deltas).slice().sort(function (a, b) {
      return Math.abs(deltas[b]) - Math.abs(deltas[a]);
    });
    return keys.map(function (k) {
      var name = METRICS.filter(function (m) { return m.key === k; })[0].name;
      var up = deltas[k] >= 0;
      return '<span class="tag ' + (up ? "up" : "down") + '">' +
        '<span class="tag-sign">' + (up ? "+" : "–") + '</span>' + name + '</span>';
    }).join("");
  }

  function renderDecisions(roundId) {
    var mount = document.querySelector('[data-decisions="' + roundId + '"]');
    if (!mount) return;
    mount.innerHTML = "";
    var letters = ["A", "B", "C", "D"];
    ROUNDS[roundId].options.forEach(function (opt, i) {
      var card = el("button", "option-card");
      card.type = "button";
      card.setAttribute("data-pick", roundId + ":" + opt.id);
      card.innerHTML =
        '<span class="option-letter">' + letters[i] + '</span>' +
        '<div class="option-title">' + opt.title + '</div>' +
        '<p class="option-blurb">' + opt.blurb + '</p>' +
        '<div class="option-line upside"><span class="ol-label">Upside</span>' +
          '<span class="ol-text">' + opt.upside + '</span></div>' +
        '<div class="option-line risk"><span class="ol-label">Risk</span>' +
          '<span class="ol-text">' + opt.risk + '</span></div>' +
        '<div class="option-meta">' +
          '<span class="om-k">Helps</span><span class="om-v">' + opt.helps + '</span>' +
          '<span class="om-k">Weakens</span><span class="om-v">' + opt.weakens + '</span>' +
        '</div>' +
        '<div class="impact-tags">' + impactTags(opt.deltas) + '</div>' +
        '<div class="pick-cta">Make this call →</div>';
      mount.appendChild(card);
    });
  }

  function renderDeltaChips(deltas) {
    return METRICS.map(function (m) {
      var d = deltas[m.key] || 0;
      var cls = d > 0 ? "up" : d < 0 ? "down" : "flat";
      var sign = d > 0 ? "+" + d : d < 0 ? "–" + Math.abs(d) : "0";
      return '<span class="delta-chip ' + cls + '"><span class="dc-num">' + sign + '</span>' + m.name + '</span>';
    }).join("");
  }

  /* Round 2 synergy: connect decision 1 and decision 2 in one sentence. */
  function synergyNote(r1, r2) {
    var spentBudget = (r1 === "r1b" || r1 === "r1c"); // giveaway or upgrades cost cash
    var loweredPrice = (r1 === "r1a");
    if (r2 === "r2a") { // big national sponsor
      if (spentBudget) return "<strong>Good timing.</strong> The sponsor check helps pay for the fan investment you just made — your two moves fund each other.";
      if (loweredPrice) return "<strong>It balances out.</strong> The sponsor money makes up for the cash you gave up on cheaper tickets — but now you've leaned on dollars twice, so watch fan trust.";
      return "<strong>Heads up.</strong> You doubled down on money this round. It's working, but fans are starting to feel the team chases dollars first.";
    }
    if (r2 === "r2b") { // local partner
      if (loweredPrice || r1 === "r1c") return "<strong>Same direction.</strong> A fan-friendly start plus a trusted local partner build the exact same thing: a team fans believe in.";
      return "<strong>Energy meets goodwill.</strong> Your buzz from round one plus a trusted local name make the team feel both exciting and real — even if cash is still tight.";
    }
    // r2c youth night
    if (loweredPrice || r1 === "r1c") return "<strong>All-in on the community.</strong> Affordable, family-friendly moves plus a youth night make this a team the whole city roots for — just keep an eye on the budget.";
    return "<strong>Hearts over dollars.</strong> Two crowd-pleasing moves built huge goodwill, but you still haven't found the big money engine ownership wants.";
  }

  function renderConsequence(roundId, optionId) {
    var mount = document.querySelector('[data-consequence="' + roundId + '"]');
    if (!mount) return;
    var opt = getOption(roundId, optionId);
    var c = opt.consequence;
    var card = el("div", "consequence-card");
    var html =
      '<div class="cc-banner">' +
        '<div class="cc-choice-label">You chose · ' + opt.title + '</div>' +
        '<div class="cc-headline">' + c.headline + '</div>' +
      '</div>' +
      '<div class="cc-body">' +
        c.paras.map(function (p) { return '<p class="cc-para">' + p + '</p>'; }).join("") +
        '<div class="cc-deltas">' + renderDeltaChips(opt.deltas) + '</div>' +
        '<div class="cc-pressure"><div class="cc-mini-label">New Pressure</div>' +
          '<div class="cc-mini-text">' + c.pressure + '</div></div>' +
        '<div class="cc-takeaway"><div class="cc-mini-label">Front Office Takeaway</div>' +
          '<div class="cc-mini-text">' + c.takeaway + '</div></div>';
    if (roundId === "round2" && state.picks.round1) {
      html += '<div class="cc-synergy">' + synergyNote(state.picks.round1, optionId) + '</div>';
    }
    html += '</div>';
    card.innerHTML = html;
    mount.innerHTML = "";
    mount.appendChild(card);
  }

  function strongestWeakest() {
    var best = METRICS[0].key, worst = METRICS[0].key;
    METRICS.forEach(function (m) {
      if (state.metrics[m.key] > state.metrics[best]) best = m.key;
      if (state.metrics[m.key] < state.metrics[worst]) worst = m.key;
    });
    return { best: best, worst: worst };
  }

  function renderRecap() {
    var mount = document.querySelector('[data-recap="final"]');
    if (!mount) return;
    var final = getOption("round3", state.picks.round3);
    var sw = strongestWeakest();

    // Path cards
    var pathHtml = ["round1", "round2", "round3"].map(function (r) {
      var opt = getOption(r, state.picks[r]);
      return '<div class="path-card"><div class="path-step">' + ROUND_LABEL[r] +
        '</div><div class="path-choice">' + opt.title + '</div></div>';
    }).join("");

    mount.innerHTML =
      '<div class="recap-strategy">' +
        '<div class="rs-name">' + final.strategyName + '</div>' +
        '<p class="rs-line">' + final.strategyLine + '</p>' +
      '</div>' +
      '<div class="rail-heading">Your path</div>' +
      '<div class="recap-path">' + pathHtml + '</div>' +
      '<div class="recap-meters"><div class="rail-heading">Final numbers</div>' +
        '<div class="metric-rail" data-rail="recap"></div></div>' +
      '<div class="recap-grid">' +
        '<div class="recap-block"><div class="rb-label">What worked</div>' +
          '<div class="rb-text">' + WORKED[sw.best] + '</div></div>' +
        '<div class="recap-block"><div class="rb-label">The tradeoff you accepted</div>' +
          '<div class="rb-text">' + TRADEOFF[sw.worst] + '</div></div>' +
        '<div class="recap-block full"><div class="rb-label">What ownership would ask next</div>' +
          '<div class="rb-text">' + final.ownershipAsk + '</div></div>' +
        '<div class="recap-block takeaway"><div class="rb-label">Front Office Takeaway</div>' +
          '<div class="rb-text">A sports business decision isn\'t just &ldquo;good&rdquo; or &ldquo;bad.&rdquo; ' +
          'It depends on what you value, who it helps, what it costs, and what risk you\'re willing to accept. ' +
          'You made your calls — and you can defend them.</div></div>' +
      '</div>';

    renderRail("recap");
  }

  /* ---- Navigation ---- */
  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    var target = document.getElementById(id);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePick(roundId, optionId) {
    var opt = getOption(roundId, optionId);
    if (!opt) return;
    state.picks[roundId] = optionId;
    applyDeltas(opt.deltas);
    renderAllRails();

    if (roundId === "round1") {
      renderConsequence("round1", optionId);
      showScreen("consequence1");
    } else if (roundId === "round2") {
      renderConsequence("round2", optionId);
      showScreen("consequence2");
    } else if (roundId === "round3") {
      renderRecap();
      showScreen("recap");
    }
  }

  function restart() {
    state.metrics = { fan: START.fan, budget: START.budget, revenue: START.revenue, trust: START.trust };
    state.picks = {};
    renderAllRails();
    showScreen("briefing");
  }

  /* ---- Wire up ---- */
  function init() {
    renderDecisions("round1");
    renderDecisions("round2");
    renderDecisions("round3");
    renderAllRails();

    document.addEventListener("click", function (e) {
      var goto = e.target.closest("[data-goto]");
      if (goto) { showScreen(goto.getAttribute("data-goto")); return; }

      var pick = e.target.closest("[data-pick]");
      if (pick) {
        var parts = pick.getAttribute("data-pick").split(":");
        handlePick(parts[0], parts[1]);
        return;
      }

      var restartBtn = e.target.closest("[data-restart]");
      if (restartBtn) { restart(); return; }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
