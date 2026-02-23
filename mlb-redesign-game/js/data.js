/**
 * MLB Money Maker v2 - Game Data
 * All 30 MLB teams, real player data, financial metrics, and v2 content
 */

const MLBData = {
    // Current year for the game
    currentYear: 2025,

    // Deal parameters
    dealValue: 8.0, // $8 billion
    dealYears: 8,
    currentDealExpires: "December 2028",

    // Real financial metrics
    financialMetrics: {
        currentNationalDeal: 1.85, // $1.85B annually
        proposedNewDeal: 8.0, // $8B total over 8 years
        nbaComparison: 76, // NBA's 2023 deal: $76B/10 years
        currentPlayerShare: 48.5, // Current percentage to players
        luxuryTaxThreshold: 241, // $241M (2024)
        revenueSharePool: 120, // $120M distributed to smaller teams
        minSalary: 0.75, // $750K minimum
        smallMarketPayroll: { min: 80, max: 120 }, // $80M-$120M
        bigMarketPayroll: { min: 200, max: 290 } // $200M-$290M
    },

    // Historical deal comparison for results screen
    historicalDeals: {
        current: {
            label: "Current MLB Deal (2022-28)",
            playerPool: 3.7,      // ~$3.7B estimated 8yr equiv
            ownerShare: 2.5,
            minSalary: 720,       // $720K at time of deal
            revenueShare: 33,
            streaming: 15,
            salaryShare: 48.5,
            startTime: 2          // 7:30 PM avg
        },
        nba: {
            label: "NBA Media Deal (2025-36)",
            totalValue: 76,       // $76B over 11 years
            annualValue: 6.9
        },
        nfl: {
            label: "NFL Media Deal (2023-33)",
            totalValue: 113,
            annualValue: 11.3
        }
    },

    // All 30 MLB Teams with real data
    teams: {
        // AL East
        yankees: {
            name: "New York Yankees",
            abbr: "NYY",
            city: "New York",
            division: "AL East",
            market: "large",
            colors: { primary: "#003087", secondary: "#FFFFFF" },
            payroll: 270,
            revenue: 680
        },
        redsox: {
            name: "Boston Red Sox",
            abbr: "BOS",
            city: "Boston",
            division: "AL East",
            market: "large",
            colors: { primary: "#BD3039", secondary: "#0C2340" },
            payroll: 235,
            revenue: 520
        },
        rays: {
            name: "Tampa Bay Rays",
            abbr: "TB",
            city: "Tampa Bay",
            division: "AL East",
            market: "small",
            colors: { primary: "#092C5C", secondary: "#8FBCE6" },
            payroll: 95,
            revenue: 280
        },
        orioles: {
            name: "Baltimore Orioles",
            abbr: "BAL",
            city: "Baltimore",
            division: "AL East",
            market: "medium",
            colors: { primary: "#DF4601", secondary: "#000000" },
            payroll: 115,
            revenue: 300
        },
        bluejays: {
            name: "Toronto Blue Jays",
            abbr: "TOR",
            city: "Toronto",
            division: "AL East",
            market: "large",
            colors: { primary: "#134A8E", secondary: "#1D2D5C" },
            payroll: 195,
            revenue: 380
        },

        // AL Central
        whitesox: {
            name: "Chicago White Sox",
            abbr: "CWS",
            city: "Chicago",
            division: "AL Central",
            market: "large",
            colors: { primary: "#27251F", secondary: "#C4CED4" },
            payroll: 145,
            revenue: 340
        },
        guardians: {
            name: "Cleveland Guardians",
            abbr: "CLE",
            city: "Cleveland",
            division: "AL Central",
            market: "small",
            colors: { primary: "#00385D", secondary: "#E50022" },
            payroll: 105,
            revenue: 290
        },
        tigers: {
            name: "Detroit Tigers",
            abbr: "DET",
            city: "Detroit",
            division: "AL Central",
            market: "medium",
            colors: { primary: "#0C2340", secondary: "#FA4616" },
            payroll: 110,
            revenue: 305
        },
        royals: {
            name: "Kansas City Royals",
            abbr: "KC",
            city: "Kansas City",
            division: "AL Central",
            market: "small",
            colors: { primary: "#004687", secondary: "#BD9B60" },
            payroll: 90,
            revenue: 265
        },
        twins: {
            name: "Minnesota Twins",
            abbr: "MIN",
            city: "Minnesota",
            division: "AL Central",
            market: "medium",
            colors: { primary: "#002B5C", secondary: "#D31145" },
            payroll: 130,
            revenue: 315
        },

        // AL West
        astros: {
            name: "Houston Astros",
            abbr: "HOU",
            city: "Houston",
            division: "AL West",
            market: "large",
            colors: { primary: "#002D62", secondary: "#EB6E1F" },
            payroll: 220,
            revenue: 450
        },
        athletics: {
            name: "Oakland Athletics",
            abbr: "OAK",
            city: "Oakland",
            division: "AL West",
            market: "small",
            colors: { primary: "#003831", secondary: "#EFB21E" },
            payroll: 60,
            revenue: 220
        },
        rangers: {
            name: "Texas Rangers",
            abbr: "TEX",
            city: "Texas",
            division: "AL West",
            market: "large",
            colors: { primary: "#003278", secondary: "#C0111F" },
            payroll: 215,
            revenue: 400
        },
        mariners: {
            name: "Seattle Mariners",
            abbr: "SEA",
            city: "Seattle",
            division: "AL West",
            market: "medium",
            colors: { primary: "#0C2C56", secondary: "#005C5C" },
            payroll: 140,
            revenue: 330
        },
        angels: {
            name: "Los Angeles Angels",
            abbr: "LAA",
            city: "Anaheim",
            division: "AL West",
            market: "large",
            colors: { primary: "#BA0021", secondary: "#003263" },
            payroll: 185,
            revenue: 390
        },

        // NL East
        mets: {
            name: "New York Mets",
            abbr: "NYM",
            city: "New York",
            division: "NL East",
            market: "large",
            colors: { primary: "#002D72", secondary: "#FF5910" },
            payroll: 290,
            revenue: 480
        },
        braves: {
            name: "Atlanta Braves",
            abbr: "ATL",
            city: "Atlanta",
            division: "NL East",
            market: "large",
            colors: { primary: "#CE1141", secondary: "#13274F" },
            payroll: 195,
            revenue: 420
        },
        nationals: {
            name: "Washington Nationals",
            abbr: "WSH",
            city: "Washington",
            division: "NL East",
            market: "medium",
            colors: { primary: "#AB0003", secondary: "#14225A" },
            payroll: 105,
            revenue: 330
        },
        phillies: {
            name: "Philadelphia Phillies",
            abbr: "PHI",
            city: "Philadelphia",
            division: "NL East",
            market: "large",
            colors: { primary: "#E81828", secondary: "#002D72" },
            payroll: 245,
            revenue: 440
        },
        marlins: {
            name: "Miami Marlins",
            abbr: "MIA",
            city: "Miami",
            division: "NL East",
            market: "medium",
            colors: { primary: "#00A3E0", secondary: "#EF3340" },
            payroll: 85,
            revenue: 260
        },

        // NL Central
        cardinals: {
            name: "St. Louis Cardinals",
            abbr: "STL",
            city: "St. Louis",
            division: "NL Central",
            market: "medium",
            colors: { primary: "#C41E3A", secondary: "#0C2340" },
            payroll: 175,
            revenue: 380
        },
        pirates: {
            name: "Pittsburgh Pirates",
            abbr: "PIT",
            city: "Pittsburgh",
            division: "NL Central",
            market: "small",
            colors: { primary: "#27251F", secondary: "#FDB827" },
            payroll: 75,
            revenue: 255
        },
        brewers: {
            name: "Milwaukee Brewers",
            abbr: "MIL",
            city: "Milwaukee",
            division: "NL Central",
            market: "small",
            colors: { primary: "#12284B", secondary: "#B6922E" },
            payroll: 115,
            revenue: 295
        },
        cubs: {
            name: "Chicago Cubs",
            abbr: "CHC",
            city: "Chicago",
            division: "NL Central",
            market: "large",
            colors: { primary: "#0E3386", secondary: "#CC3433" },
            payroll: 180,
            revenue: 510
        },
        reds: {
            name: "Cincinnati Reds",
            abbr: "CIN",
            city: "Cincinnati",
            division: "NL Central",
            market: "small",
            colors: { primary: "#C6011F", secondary: "#000000" },
            payroll: 95,
            revenue: 275
        },

        // NL West
        dodgers: {
            name: "Los Angeles Dodgers",
            abbr: "LAD",
            city: "Los Angeles",
            division: "NL West",
            market: "large",
            colors: { primary: "#005A9C", secondary: "#FFFFFF" },
            payroll: 285,
            revenue: 620
        },
        padres: {
            name: "San Diego Padres",
            abbr: "SD",
            city: "San Diego",
            division: "NL West",
            market: "medium",
            colors: { primary: "#2F241D", secondary: "#FFC425" },
            payroll: 230,
            revenue: 360
        },
        giants: {
            name: "San Francisco Giants",
            abbr: "SF",
            city: "San Francisco",
            division: "NL West",
            market: "large",
            colors: { primary: "#FD5A1E", secondary: "#27251F" },
            payroll: 165,
            revenue: 430
        },
        rockies: {
            name: "Colorado Rockies",
            abbr: "COL",
            city: "Colorado",
            division: "NL West",
            market: "medium",
            colors: { primary: "#33006F", secondary: "#C4CED4" },
            payroll: 100,
            revenue: 300
        },
        diamondbacks: {
            name: "Arizona Diamondbacks",
            abbr: "ARI",
            city: "Arizona",
            division: "NL West",
            market: "medium",
            colors: { primary: "#A71930", secondary: "#E3D4AD" },
            payroll: 120,
            revenue: 310
        }
    },

    // Real MLB Players with 2025 salaries (in millions)
    players: [
        // Superstars ($30M+)
        { name: "Shohei Ohtani", team: "dodgers", salary: 70, tier: "superstar" },
        { name: "Mike Trout", team: "angels", salary: 36, tier: "superstar" },
        { name: "Juan Soto", team: "mets", salary: 45, tier: "superstar" },
        { name: "Aaron Judge", team: "yankees", salary: 40, tier: "superstar" },
        { name: "Mookie Betts", team: "dodgers", salary: 30, tier: "superstar" },
        { name: "Freddie Freeman", team: "dodgers", salary: 27, tier: "superstar" },
        { name: "Trea Turner", team: "phillies", salary: 33, tier: "superstar" },
        { name: "Corey Seager", team: "rangers", salary: 32.5, tier: "superstar" },

        // All-Stars ($15M-$30M)
        { name: "Francisco Lindor", team: "mets", salary: 35, tier: "allstar" },
        { name: "Bryce Harper", team: "phillies", salary: 26, tier: "allstar" },
        { name: "Marcus Semien", team: "rangers", salary: 26, tier: "allstar" },
        { name: "Jose Ramirez", team: "guardians", salary: 26, tier: "allstar" },
        { name: "Ronald Acuna Jr.", team: "braves", salary: 17, tier: "allstar" },
        { name: "Julio Rodriguez", team: "mariners", salary: 21, tier: "allstar" },
        { name: "Corbin Burnes", team: "orioles", salary: 15, tier: "allstar" },
        { name: "Gerrit Cole", team: "yankees", salary: 36, tier: "allstar" },
        { name: "Max Scherzer", team: "rangers", salary: 43, tier: "allstar" },
        { name: "Jacob deGrom", team: "rangers", salary: 37, tier: "allstar" },
        { name: "Justin Verlander", team: "astros", salary: 43, tier: "allstar" },
        { name: "Zack Wheeler", team: "phillies", salary: 24, tier: "allstar" },

        // Mid-Tier ($5M-$15M)
        { name: "Kyle Tucker", team: "astros", salary: 12, tier: "midtier" },
        { name: "Bo Bichette", team: "bluejays", salary: 10, tier: "midtier" },
        { name: "Willy Adames", team: "brewers", salary: 8, tier: "midtier" },
        { name: "Pete Alonso", team: "mets", salary: 15, tier: "midtier" },
        { name: "Vladimir Guerrero Jr.", team: "bluejays", salary: 15, tier: "midtier" },
        { name: "Rafael Devers", team: "redsox", salary: 17, tier: "midtier" },
        { name: "Ozzie Albies", team: "braves", salary: 7, tier: "midtier" },
        { name: "Tyler Glasnow", team: "dodgers", salary: 12, tier: "midtier" },
        { name: "Spencer Strider", team: "braves", salary: 3, tier: "midtier" },
        { name: "Gunnar Henderson", team: "orioles", salary: 1, tier: "midtier" },

        // Minimum/Rookie (<$5M)
        { name: "Jackson Holliday", team: "orioles", salary: 0.75, tier: "minimum" },
        { name: "Evan Carter", team: "rangers", salary: 0.75, tier: "minimum" },
        { name: "Jackson Chourio", team: "brewers", salary: 0.75, tier: "minimum" },
        { name: "Wyatt Langford", team: "rangers", salary: 0.75, tier: "minimum" },
        { name: "Paul Skenes", team: "pirates", salary: 0.75, tier: "minimum" },
        { name: "Jackson Merrill", team: "padres", salary: 0.75, tier: "minimum" },
        { name: "Colton Cowser", team: "orioles", salary: 0.75, tier: "minimum" },
        { name: "Junior Caminero", team: "rays", salary: 0.75, tier: "minimum" }
    ],

    // Network partners
    networks: [
        { id: "espn", name: "ESPN", logo: "ESPN", color: "#CC0000" },
        { id: "fox", name: "FOX Sports", logo: "FOX", color: "#003087" },
        { id: "mlb-network", name: "MLB Network", logo: "MLBN", color: "#002D72" },
        { id: "apple", name: "Apple TV+", logo: "Apple", color: "#000000" },
        { id: "amazon", name: "Amazon Prime", logo: "Prime", color: "#FF9900" }
    ],

    // Stakeholder data
    stakeholders: {
        players: {
            name: "Players Union",
            representative: "Tony Clark",
            title: "MLBPA Executive Director",
            emoji: "happy",
            comments: {
                veryHappy: "This is a championship deal for the players!",
                happy: "The players are pleased with these terms.",
                neutral: "We can work with this, but we'd like more.",
                unhappy: "The players deserve better than this!",
                veryUnhappy: "This is unacceptable. We're walking away!"
            }
        },
        owners: {
            name: "Team Owners",
            representative: "Owner Coalition",
            title: "30 MLB Franchise Owners",
            emoji: "happy",
            comments: {
                veryHappy: "Excellent! This ensures franchise profitability!",
                happy: "A reasonable deal for sustainable business.",
                neutral: "Margins are tight, but it could work.",
                unhappy: "Our profit margins are too thin!",
                veryUnhappy: "We can't operate under these terms!"
            }
        },
        networks: {
            name: "Broadcast Networks",
            representative: "Network Coalition",
            title: "ESPN, FOX, Apple TV+, Amazon",
            emoji: "happy",
            comments: {
                veryHappy: "Prime content at prime times! Perfect!",
                happy: "Good package, solid viewership potential.",
                neutral: "We need better time slots for this price.",
                unhappy: "The viewership projections are concerning.",
                veryUnhappy: "We can't justify this investment!"
            }
        },
        fans: {
            name: "Baseball Fans",
            representative: "The Fans",
            title: "Millions of Baseball Supporters",
            emoji: "happy",
            comments: {
                veryHappy: "Best. Season. Ever! Go baseball!",
                happy: "Excited for competitive baseball!",
                neutral: "Hope we can actually watch the games...",
                unhappy: "Same teams winning, games too late!",
                veryUnhappy: "Baseball is losing us as fans!"
            }
        }
    },

    // ===== V2: DEMAND TEMPLATES =====
    // Used by Calculations.generateDemand()
    demandTemplates: {
        players: [
            {
                condition: (s) => s.minSalary < 900,
                demand: "Minimum salary must be at least $900K — anything less is disrespectful to our younger players.",
                fix: "Raise minimum salary above $900K",
                check: (s) => s.minSalary >= 900
            },
            {
                condition: (s) => s.salaryShare < 50,
                demand: "We need at least 50% player salary share of revenue. Players drive this league.",
                fix: "Set salary share to 50% or higher",
                check: (s) => s.salaryShare >= 50
            },
            {
                condition: (s) => (s.allocation.players / 8.0) < 0.40,
                demand: "Our salary pool needs to be at least 40% of the total deal. We won't accept less.",
                fix: "Allocate at least $3.2B (40%) to Players",
                check: (s) => (s.allocation.players / 8.0) >= 0.40
            }
        ],
        owners: [
            {
                condition: (s) => s.revenueShare > 45,
                demand: "Revenue sharing above 45% kills small-market incentives. We need that number lower.",
                fix: "Lower revenue sharing below 45%",
                check: (s) => s.revenueShare <= 45
            },
            {
                condition: (s) => s.salaryShare > 58,
                demand: "Player salary share above 58% makes many franchises unprofitable. Reduce it.",
                fix: "Lower player salary share to 58% or less",
                check: (s) => s.salaryShare <= 58
            },
            {
                condition: (s) => (s.allocation.owners / 8.0) < 0.25,
                demand: "Owner profit allocation below 25% is untenable. Franchises need to sustain operations.",
                fix: "Allocate at least $2.0B (25%) to Owners",
                check: (s) => (s.allocation.owners / 8.0) >= 0.25
            }
        ],
        networks: [
            {
                condition: (s) => s.startTime > 2,
                demand: "Games starting after 7:30 PM hurt East Coast ratings. We need a 7:30 PM or earlier slot.",
                fix: "Set game start time to 7:30 PM or earlier",
                check: (s) => s.startTime <= 2
            },
            {
                condition: (s) => s.streaming > 50,
                demand: "More than 50% streaming exclusives will gut our cable ratings. Reduce that number.",
                fix: "Lower streaming-only games below 50%",
                check: (s) => s.streaming <= 50
            },
            {
                condition: (s) => (s.allocation.networks / 8.0) < 0.12,
                demand: "Rights fees below 12% of the deal don't justify our investment in MLB coverage.",
                fix: "Allocate at least $0.96B (12%) to Networks",
                check: (s) => (s.allocation.networks / 8.0) >= 0.12
            }
        ],
        fans: [
            {
                condition: (s) => s.startTime > 3,
                demand: "Games starting at 9+ PM are impossible for families on the East Coast. Move them earlier.",
                fix: "Set game start time to 8:00 PM or earlier",
                check: (s) => s.startTime <= 3
            },
            {
                condition: (s) => s.revenueShare < 25,
                demand: "Revenue sharing below 25% means small-market teams can't compete. Fans lose interest.",
                fix: "Raise revenue sharing to 25% or higher",
                check: (s) => s.revenueShare >= 25
            },
            {
                condition: (s) => s.streaming > 60,
                demand: "60%+ streaming exclusives means millions of fans lose access. We can't support this deal.",
                fix: "Lower streaming-only games to 60% or less",
                check: (s) => s.streaming <= 60
            }
        ]
    },

    // ===== V2: BREAKING NEWS HEADLINES =====
    // Condition-mapped headlines for the news ticker
    newsHeadlines: [
        // Streaming
        { condition: (s) => s.streaming > 70, text: "EXCLUSIVE: League insiders warn streaming overload will fragment fan base and tank ratings" },
        { condition: (s) => s.streaming > 50 && s.streaming <= 70, text: "Players Union rep: 'Too many games hidden on streaming — rookie fans can't afford five apps'" },
        { condition: (s) => s.streaming < 15, text: "Streaming advocates: 'Nearly no online games is a missed revenue opportunity for the league'" },
        { condition: (s) => s.streaming >= 20 && s.streaming <= 40, text: "Analysts praise streaming balance: 'This is the right mix of cable and digital for MLB'" },
        // Start times
        { condition: (s) => s.startTime >= 4, text: "Fan group threatens boycott: '9 PM starts are impossible for kids — East Coast families furious'" },
        { condition: (s) => s.startTime >= 3, text: "Study shows late game starts cost MLB 8% of casual East Coast viewers per 30-minute delay" },
        { condition: (s) => s.startTime <= 1, text: "Networks warn: '6-7 PM starts compete with local news and cut into prime advertising windows'" },
        { condition: (s) => s.startTime === 2, text: "Insiders say 7:30 PM is the 'Goldilocks zone' for MLB — good for both coasts and ad revenue" },
        // Player salaries
        { condition: (s) => s.minSalary < 500, text: "MLBPA: '$500K minimum salary is an insult — that's below a living wage in major league cities'" },
        { condition: (s) => s.minSalary >= 1200, text: "Owners grumble about $1.2M+ minimum salary: 'Not all 40-man roster players deserve that floor'" },
        { condition: (s) => s.minSalary >= 900 && s.minSalary < 1200, text: "Veteran players praise proposed minimum salary increase: 'This is what respect looks like'" },
        // Revenue sharing
        { condition: (s) => s.revenueShare > 50, text: "Large-market owners revolt: '50%+ revenue sharing penalizes our investment in winning teams'" },
        { condition: (s) => s.revenueShare < 20, text: "Small-market GMs sound alarm: 'Under 20% revenue sharing makes teams like ours uncompetitive'" },
        { condition: (s) => s.revenueShare >= 30 && s.revenueShare <= 45, text: "Commissioner praises balanced revenue sharing proposal: 'This is how you build a healthy league'" },
        // Salary share
        { condition: (s) => s.salaryShare > 62, text: "Wall Street analysts: 'Player salary share above 62% will make multiple franchises unprofitable'" },
        { condition: (s) => s.salaryShare < 43, text: "MLBPA threatens work stoppage: 'A 43% player share is the lowest in any major US sports league'" },
        // Overall score
        { condition: (s, sat) => sat && sat.overall >= 85, text: "BREAKING: Sources say all four stakeholder groups are close to historic agreement — deal near" },
        { condition: (s, sat) => sat && sat.overall >= 75, text: "Negotiations progressing: 'We're seeing real compromise on all sides,' says neutral mediator" },
        { condition: (s, sat) => sat && sat.overall < 50, text: "ALERT: Multiple stakeholders express serious concerns — deal may be in jeopardy" },
        { condition: (s, sat) => sat && sat.players < 50, text: "Players Union considering work stoppage: 'The current terms are not acceptable to our members'" },
        { condition: (s, sat) => sat && sat.owners < 50, text: "Owner coalition threatens to lock out players if deal terms don't improve for franchises" },
        { condition: (s, sat) => sat && sat.networks < 50, text: "ESPN and Fox reportedly exploring NFL and NBA content as MLB deal talks stall" },
        { condition: (s, sat) => sat && sat.fans < 50, text: "Fan surveys show 38% would consider reducing baseball viewership under current deal terms" },
        // Allocation
        { condition: (s) => (s.allocation.players / 8.0) > 0.55, text: "Owners warn: 'Giving players over 55% of the deal leaves franchises with razor-thin margins'" },
        { condition: (s) => (s.allocation.players / 8.0) < 0.35, text: "MLBPA: 'Less than 35% for players is historically low — comparable to minor league economics'" },
        // Generic/default
        { condition: () => true, text: "MLB Media Deal Negotiations: Stakeholders gather in New York for final round of talks" },
        { condition: () => true, text: "Analysts: 'The $8B deal will set the economic tone for baseball through 2033'" },
        { condition: () => true, text: "All 30 teams watching closely as executives finalize national media rights package" }
    ],

    // ===== V2: ADVISOR TIPS =====
    // Contextual tips shown in the Advisor tab
    advisorTips: [
        // Allocation guidance
        {
            priority: 10,
            condition: (s, sat) => sat && sat.players < 55,
            icon: "⚾",
            text: "Players want 40-50% of the total deal. You're currently at " +
                  "{{playersPercent}}% — try bumping their allocation."
        },
        {
            priority: 10,
            condition: (s, sat) => sat && sat.owners < 55,
            icon: "🏟️",
            text: "Owners want 30-40% of the deal for franchise sustainability. Consider increasing their share."
        },
        {
            priority: 10,
            condition: (s, sat) => sat && sat.networks < 55,
            icon: "📺",
            text: "Networks want rights fees of 15-25% of the deal. They also strongly prefer 7-8 PM start times for prime ratings."
        },
        {
            priority: 10,
            condition: (s, sat) => sat && sat.fans < 55,
            icon: "👥",
            text: "Fans care most about competitive balance (revenue sharing 30-50%) and early start times (before 8 PM)."
        },
        // Streaming
        {
            priority: 8,
            condition: (s) => s.streaming > 55,
            icon: "📡",
            text: "Streaming above 55% starts hurting both fan access and network cable ratings. A 20-40% split tends to keep everyone happier."
        },
        {
            priority: 8,
            condition: (s) => s.streaming < 10,
            icon: "📡",
            text: "Almost no streaming games frustrates digital-native fans and misses a big revenue opportunity for networks."
        },
        // Minimum salary
        {
            priority: 7,
            condition: (s) => s.minSalary < 700,
            icon: "💰",
            text: "A minimum salary below $700K is below the current MLB floor. Players will push back hard on anything lower than $750K."
        },
        {
            priority: 7,
            condition: (s) => s.minSalary >= 1000,
            icon: "💰",
            text: "High minimum salaries ($1M+) are great for players but cut into owner margins on 40-man roster spots."
        },
        // Revenue sharing
        {
            priority: 9,
            condition: (s) => s.revenueShare < 25,
            icon: "⚖️",
            text: "Revenue sharing below 25% leaves small-market teams unable to compete. This tanks fan satisfaction in those cities."
        },
        {
            priority: 9,
            condition: (s) => s.revenueShare > 50,
            icon: "⚖️",
            text: "Revenue sharing above 50% tends to reduce owner investment incentives. Large-market owners will push back strongly."
        },
        // Start time
        {
            priority: 8,
            condition: (s) => s.startTime >= 4,
            icon: "🕙",
            text: "9 PM+ start times hurt East Coast families and casual fans. Networks also lose viewership after children's bedtimes."
        },
        {
            priority: 8,
            condition: (s) => s.startTime <= 0,
            icon: "🕙",
            text: "6 PM starts are tough for workers to catch in-person or on TV. Prime time (7-8 PM) maximizes audiences for networks."
        },
        // Salary share
        {
            priority: 7,
            condition: (s) => s.salaryShare > 60,
            icon: "📊",
            text: "Player salary share above 60% of revenue will squeeze franchise profits, especially for mid-market teams."
        },
        {
            priority: 7,
            condition: (s) => s.salaryShare < 46,
            icon: "📊",
            text: "Salary share below 46% will anger the Players Union — they'll view it as a rollback from current terms."
        },
        // Stability
        {
            priority: 15,
            condition: (s, sat) => sat && Calculations.checkStability(sat) === 'danger',
            icon: "⚠️",
            text: "DANGER: At least one stakeholder is close to walking away. Raise anyone below 50% before locking in this round."
        },
        {
            priority: 15,
            condition: (s, sat) => sat && Calculations.checkStability(sat) === 'warning',
            icon: "⚠️",
            text: "WARNING: Deal stability is shaky. Check who is below 60% satisfaction and adjust their key drivers."
        },
        // Positive feedback
        {
            priority: 3,
            condition: (s, sat) => sat && sat.overall >= 80,
            icon: "🏆",
            text: "Looking strong! Keep all stakeholders above 60% to lock in a Silver or Gold tier deal."
        },
        {
            priority: 3,
            condition: (s, sat) => sat && sat.overall >= 90,
            icon: "🏆",
            text: "This is championship territory! To reach Gold, keep every stakeholder above 75% when you finalize."
        },
        // Generic
        {
            priority: 1,
            condition: () => true,
            icon: "💡",
            text: "Use Round 1 to nail the big money split, then use Round 2 to fine-tune the deal details."
        },
        {
            priority: 1,
            condition: () => true,
            icon: "💡",
            text: "Mini-games in the Challenge Break unlock special deal perks — try completing them at 80%+ for the best bonuses."
        }
    ],

    // Game start time options
    startTimes: [
        { value: 0, time: "6:00 PM", label: "Early Evening", impact: "Great for families, less prime TV" },
        { value: 1, time: "7:00 PM", label: "Prime Time Start", impact: "Good balance for most viewers" },
        { value: 2, time: "7:30 PM", label: "Traditional", impact: "Classic baseball time slot" },
        { value: 3, time: "8:00 PM", label: "Late Prime", impact: "Better for West Coast, worse for East" },
        { value: 4, time: "9:00 PM+", label: "Late Night", impact: "Streaming-focused, loses East Coast" }
    ],

    // Mini-game team categorization
    teamsByMarket: {
        small: ["rays", "athletics", "royals", "guardians", "pirates", "reds", "brewers", "marlins"],
        medium: ["orioles", "tigers", "twins", "mariners", "nationals", "cardinals", "rockies", "diamondbacks", "padres"],
        large: ["yankees", "redsox", "bluejays", "whitesox", "astros", "rangers", "angels", "mets", "braves", "phillies", "cubs", "dodgers", "giants"]
    },

    // Tier thresholds
    tiers: {
        gold: { min: 90, label: "GOLD", message: "CHAMPIONSHIP DEAL! You've balanced every stakeholder perfectly. The league is thriving!" },
        silver: { min: 80, label: "SILVER", message: "SOLID DEAL! The league accepted your proposal. One group had to compromise." },
        bronze: { min: 70, label: "BRONZE", message: "ACCEPTABLE DEAL! The league signed your proposal, but some are unhappy." },
        fail: { min: 0, label: "FAILED", message: "DEAL COLLAPSED! Try again." }
    },

    // ===== V2: ROUND CONFIG =====
    rounds: [
        {
            number: 1,
            label: "Money Split",
            description: "Allocate the $8 billion among the four stakeholder groups.",
            unlocksDetails: false
        },
        {
            number: 2,
            label: "Deal Details",
            description: "Fine-tune salaries, revenue sharing, broadcast times, and streaming.",
            unlocksDetails: true
        },
        {
            number: 3,
            label: "Final Terms",
            description: "Lock in your final deal. All sliders are active — this is your last chance.",
            unlocksDetails: true
        }
    ]
};

// Helper function to get teams by market size
function getTeamsByMarket(marketSize) {
    return MLBData.teamsByMarket[marketSize].map(key => ({
        key: key,
        ...MLBData.teams[key]
    }));
}

// Helper function to get random players for mini-game
function getRandomPlayers(count = 8) {
    const shuffled = [...MLBData.players].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Helper function to get team by key
function getTeam(teamKey) {
    return MLBData.teams[teamKey];
}

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MLBData, getTeamsByMarket, getRandomPlayers, getTeam };
}
