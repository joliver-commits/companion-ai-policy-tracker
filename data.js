// Companion AI Policy Tracker — dataset
// Berkman Klein Center, Harvard University. Last verified: 13 August 2026.
// Contributions welcome — see CONTRIBUTING.md.
//
// Scope: proposed, active and enacted policy only. Instruments that die, are
// vetoed, or go inactive are removed from this file rather than kept with a
// "dead" status — see README.md ("What is and is not tracked").

const MECHS = [
  ["disclosure",       "Non-human disclosure", "Non-human disclosure"],
  ["crisis",           "Crisis / self-harm protocol", "Crisis protocol"],
  ["reporting",        "Transparency reporting", "Transparency reporting"],
  ["minorContent",     "Sexual / harmful content limits (minors)", "Content limits (minors)"],
  ["ageAssurance",     "Age assurance or verification", "Age assurance"],
  ["parental",         "Parental consent or controls", "Parental consent"],
  ["engagement",       "Engagement / addictive design limits", "Engagement limits"],
  ["dependence",       "Bars simulating dependence or distress", "Bars dependence sim"],
  ["memory",           "Explicit cap on memory or retention", "Cap on memory"],
  ["proImpersonation", "Bars impersonating licensed professionals", "Bars pro impersonation"],
  ["sentience",        "Bars claims of humanness or sentience", "Bars sentience claims"],
  ["audit",            "Independent audit", "Independent audit"],
  ["training",         "Limits training on user / minor data", "Training data limits"],
  ["accessBan",        "Outright minor access ban", "Minor access ban"],
  ["humanTakeover",    "Human takeover on crisis", "Human takeover"],
  ["causation",        "Duty to test own design against harm", "Duty to test design"]
];

/* ==================================================================
   MECHANISM CLUSTERS
   The sixteen mechanisms fall into five families. Comparing the
   families is usually more informative than comparing sixteen
   separate bars: the interesting result in this corpus is that the
   honesty and harm-response clusters are near-universal while the
   design cluster is nearly empty, and that only shows up when the
   mechanisms are grouped.

   Every mechanism key belongs to exactly one cluster, and every key
   in MECHS must appear in exactly one `mechs` list here or the
   coverage view and the matrix will silently drop it.
     key   — stable id, used in the mechanism filter as "g:<key>"
     label — full name
     short — column-band label in the matrix
     def   — what the cluster is, shown on hover and in the panel
   ================================================================== */
const MECHGROUPS = [
  {
    key:"honesty", label:"Honesty about what the system is", short:"Honesty about the system",
    def:"Rules about what the system may say about its own nature and standing: that it must admit to being a machine, that it must not claim to be human or sentient, and that it must not hold itself out as a licensed professional. These regulate the user's awareness of a design property rather than the property itself, which is why they are the cheapest to comply with and the most widely adopted.",
    mechs:["disclosure","sentience","proImpersonation"]
  },
  {
    key:"harm", label:"Harm response", short:"Harm response",
    def:"Duties that fire when a user is in danger: detecting expressions of suicidal ideation or self-harm and routing the user to help — in almost every case to an external crisis line, and in one framework to a human being who joins the conversation.",
    mechs:["crisis","humanTakeover"]
  },
  {
    key:"age", label:"Age gating and parental control", short:"Age gating & parents",
    def:"Rules that turn on how old the user is: establishing their age, barring their access outright, restricting what they may be shown, and giving a parent or guardian a role. This is the cluster that stops at eighteen — an adult using the same product gets none of it.",
    mechs:["ageAssurance","accessBan","minorContent","parental"]
  },
  {
    key:"design", label:"Design and data constraints", short:"Design & data",
    def:"Rules that constrain the product itself rather than the user's awareness of it: the features engineered to extend use, the simulation of emotional need, how long the system may remember what it was told, and what may be done with conversations afterwards. This is the relational machinery, and it is the thinnest cluster in the corpus.",
    mechs:["engagement","dependence","memory","training"]
  },
  {
    key:"account", label:"Accountability and evidence", short:"Accountability",
    def:"What the operator must document, submit to outside review, or investigate: counts of what the system did, independent audit of compliance, and — in one instrument only — a duty to test whether its own design produces the harm it is counting.",
    mechs:["reporting","audit","causation"]
  }
];

const DATA = [
/* ============================ US FEDERAL ============================ */
{
  id:"us-guard", juris:"US Federal", body:"US Congress", cite:"S. 3062 / H.R. 8623",
  name:"GUARD Act", status:"Advanced from committee", statusClass:"moving",
  dates:"Introduced Oct 2025 · advanced Senate Judiciary 30 Apr 2026 · House companion pending",
  chron:{first:"2025-10", latest:"2026-04-30"},
  scope:"Minors (ban); all users (disclosure)",
  youth:"duties",
  term:"AI companion", test:"purpose", testNote:"Simulates a sustained interpersonal relationship or emotional interaction",
  narrowing:"Age-gated ban + education carve-out", reaches:"partial",
  mechs:["disclosure","minorContent","ageAssurance","sentience","proImpersonation","accessBan"],
  enforce:["Criminal penalties","State AG"],
  interval:"At start of chat and every 30 minutes",
  note:"The categorical route at federal level. Bans minors from AI companions outright, requires age verification, bars the system from claiming to be human or holding professional credentials, and creates criminal penalties for knowingly serving sexual content to minors. Advanced unanimously out of Senate Judiciary. Because the ban attaches to the labelled category, it reaches the products at the bottom of the youth-usage distribution and not the assistants at the top.",
  link:"https://www.congress.gov/bill/119th-congress/senate-bill/3062/text"
},
{
  id:"us-youth-ai", juris:"US Federal", body:"US Senate", cite:"S. 4199",
  name:"Youth AI Privacy Act", status:"Advanced from committee", statusClass:"moving",
  dates:"Introduced 25 Mar 2026 (Markey) · advanced Senate Commerce 5 Aug 2026",
  chron:{first:"2026-03-25", latest:"2026-08-05"},
  scope:"Minors",
  youth:"only",
  term:"AI chatbot — no companion category", test:"capability", testNote:"Natural-language interface giving adaptive responses that simulate interpersonal interaction",
  narrowing:"None", reaches:"yes",
  mechs:["disclosure","engagement","training","parental"],
  enforce:["FTC","State AG"],
  interval:"Clear, repeated notice (30 min in tracker summaries)",
  note:"The most important instrument in the corpus for design regulation. It comes closest to reaching retention without getting there: a deployer may not process personal data to personalise outputs unless the data was collected in the current session and more recently than an FTC-set maximum. That governs what may be PROCESSED for personalisation, not how long the system may keep what a user told it, so it is not coded as a memory constraint — no legislation in this corpus caps memory. Also bans a named list of engagement features — frequency rewards, push notifications, usage badges, unprompted outputs, and typing indicators showing the chatbot is available. The private right of action present in the introduced bill was removed during the 5 August 2026 Commerce markup, so enforcement now runs through the FTC and state attorneys general only.",
  link:"https://www.congress.gov/bill/119th-congress/senate-bill/4199/text"
},
{
  id:"us-people-first", key:true, juris:"US Federal", body:"US House", cite:"People-First Chatbot Act",
  name:"People-First Chatbot Act", status:"Introduced", statusClass:"pending",
  dates:"Introduced July 2026 (Foushee, Casar) · from EPIC / Consumer Federation / Fairplay model bill (Jan 2026)",
  chron:{first:"2026-07", latest:"2026-07"},
  scope:"All users, regardless of age",
  youth:"none",
  term:"Artificial intelligence chatbot — no companion category", test:"capability + purpose",
  testNote:"Responses not fully predetermined; open-ended natural-language input; persistent identity or persona",
  narrowing:"None", reaches:"yes",
  mechs:["disclosure","crisis","engagement","dependence","proImpersonation","causation"],
  enforce:["FTC","State AG","Private right of action"],
  interval:"Before first output, hourly, and whenever the user asks if it is a person",
  note:"The only instrument that defines emotional dependence in statutory text — reliance on a chatbot 'as a primary source' of support — and requires monthly assessment for covered harm, emotional dependence and compulsive usage, with a duty to disable any feature creating an unreasonable risk for that user. Statutory damages up to $250,000 for violations causing covered harm. Its trigger for the non-human notice — when a user asks whether they are talking to a person — responds to the moment of actual uncertainty rather than to a clock, and appears nowhere else.",
  link:"https://epic.org/"
},
{
  id:"us-chat", key:true, juris:"US Federal", body:"US Senate", cite:"S. 2714",
  name:"CHAT Act", status:"Introduced", statusClass:"pending",
  dates:"Introduced Sept 2025",
  chron:{first:"2025-09", latest:"2025-09"},
  scope:"Minors",
  youth:"only",
  term:"Companion AI chatbot", test:"purpose (primary)",
  testNote:"Exists for THE PRIMARY PURPOSE OF simulating interpersonal or emotional interaction, friendship, companionship, or therapeutic communication",
  narrowing:"Purpose-primacy gate inside the definition", reaches:"no",
  mechs:["disclosure","crisis","ageAssurance","parental","minorContent"],
  enforce:["State AG (public nuisance)"],
  interval:"At start of chat and every 60 minutes",
  note:"The narrowest test in the corpus, and the clearest demonstration that reach sits in the gating verb rather than the vocabulary. It builds its definition from the same four limbs as the federal discussion draft — interpersonal or emotional interaction, friendship, companionship, therapeutic communication — but gates them on 'exists for the primary purpose of', which excludes general assistants by construction and so needs no carve-out at all.",
  link:"https://www.congress.gov/"
},
{
  id:"us-trump-ai", key:true, juris:"US Federal", body:"US Congress", cite:"Discussion draft",
  name:"TRUMP AMERICA AI Act", status:"Discussion draft", statusClass:"pending",
  dates:"Discussion draft Mar 2026 · incorporates the GUARD Act",
  chron:{first:"2026-03", latest:"2026-03"},
  scope:"All users; minor-specific duties",
  youth:"duties",
  term:"AI chatbot, with AI companion as a subset", test:"capability + purpose",
  testNote:"Chatbot: produces content not fully predetermined, accepts open-ended input. Companion: adaptive human-like responses + designed to encourage or facilitate simulated interpersonal or emotional interaction, friendship, companionship, or therapeutic communication",
  narrowing:"None (chatbot limb excludes only narrow, single-purpose services)", reaches:"yes",
  mechs:["disclosure","minorContent","ageAssurance","sentience","accessBan"],
  enforce:["Criminal penalties","State AG"],
  interval:"Per incorporated GUARD Act provisions",
  note:"The cleanest drafting architecture available: it nests the two categories, defining 'chatbot' broadly enough to capture ChatGPT, Claude and Gemini unambiguously, then making 'AI companion' a narrower designation inside it. This is Bernardi's subset structure used as statutory architecture. Its companion limb reaches 'therapeutic communication', which covers the therapist-like role directly.",
  link:"https://www.congress.gov/"
},
{
  id:"us-chatbot-act", juris:"US Federal", body:"US Senate", cite:"S. 4407",
  name:"CHATBOT Act", status:"Introduced", statusClass:"pending",
  dates:"Filed 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot", test:"capability", testNote:"Not re-verified against introduced text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["parental","training"],
  enforce:["Unverified"],
  interval:"—",
  note:"Newer federal filing picked up from the FPF tracker; requires parental consent and family accounts, restricts advertising to minors and limits data collection. Full text not yet read — treat the coding here as provisional and confirm against the introduced bill before citing.",
  link:"https://www.congress.gov/"
},
{
  id:"us-kids-act", juris:"US Federal", body:"US House", cite:"H.R. 7757",
  name:"KIDS Act", status:"Passed one chamber", statusClass:"moving",
  dates:"Passed House 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot", test:"capability", testNote:"Not re-verified against passed text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure","minorContent"],
  enforce:["Unverified"],
  interval:"Every 3 hours",
  note:"Passed the House. Disclosure plus prohibited content for minors. Coding provisional — confirm against the engrossed text.",
  link:"https://www.congress.gov/"
},

/* ============================ EU + CHINA ============================ */
{
  id:"eu-ai-act", juris:"EU", body:"European Union", cite:"Reg. 2024/1689, Art. 5(1)(a)–(b)",
  name:"EU AI Act — prohibited practices", status:"In force", statusClass:"law",
  dates:"Published OJ 12 Jul 2024 · in force 1 Aug 2024 · Art. 5 applicable 2 Feb 2025",
  chron:{first:"2024-07-12", latest:"2024-08-01", effective:"2025-02-02"},
  scope:"All users; age and vulnerability as an explicit axis",
  youth:"duties",
  term:"No product term at all", test:"technique + effect",
  testNote:"Subliminal, purposefully manipulative or deceptive techniques with the object or effect of materially distorting behaviour and causing significant harm; exploitation of vulnerabilities due to age, disability or social/economic situation",
  narrowing:"Not applicable", reaches:"yes",
  mechs:["engagement","dependence"],
  enforce:["National market surveillance authorities","Fines to €35m or 7% of global turnover"],
  interval:"—",
  note:"The proof that the regulatory object can be specified without a product category at all. Article 5 names no chatbot, no companion, no app class — it prohibits a technique joined to an effect, and it applies to any system producing that effect. The cost of the approach is that none of the companion-specific machinery follows from it: no crisis protocol, no disclosure interval, no memory rule. It is a ceiling on manipulation, not a design code.",
  link:"https://artificialintelligenceact.eu/article/5/"
},
{
  id:"eu-imco", key:true, juris:"EU", body:"European Parliament (IMCO)", cite:"2025/2060(INI)",
  name:"Protection of Minors Online — Parliament report", status:"Non-binding resolution", statusClass:"pending",
  dates:"Committee vote Oct 2025 (32–5–9)",
  chron:{first:"2025-10", latest:"2025-10"},
  scope:"Minors",
  youth:"only",
  term:"AI companions (named alongside social media)", test:"n/a — recommendation",
  testNote:"Recommends an EU digital minimum age of 16 for social media and AI companions absent parental consent",
  narrowing:"n/a", reaches:"yes",
  mechs:["ageAssurance","parental","engagement"],
  enforce:["Recommendation only"],
  interval:"—",
  note:"Non-binding but agenda-setting. Calls for a digital minimum age of 16 for AI companions without parental consent, a ban on engagement-based recommender algorithms for minors with the most addictive design features off by default, personal liability for senior management in cases of serious and persistent breaches of minor-protection provisions, and firm enforcement of existing AI Act rules against manipulative and deceptive chatbots. The personal-liability proposal has no analogue in any US instrument.",
  link:"https://www.europarl.europa.eu/news/en/press-room/20251013IPR30892/new-eu-measures-needed-to-make-online-services-safer-for-minors"
},
{
  id:"eu-dfa", key:true, juris:"EU", body:"European Commission", cite:"Digital Fairness Act",
  name:"Digital Fairness Act (proposal)", status:"Proposed", statusClass:"pending",
  dates:"Commission proposal 2026 · in the ordinary legislative procedure",
  chron:{first:"2026", latest:"2026"},
  scope:"All users; minor-specific provisions",
  youth:"duties",
  term:"No companion term; addictive design and dark patterns", test:"technique + effect",
  testNote:"Targets dark patterns, addictive design and personalisation practices in consumer-facing digital services",
  narrowing:"n/a", reaches:"yes",
  mechs:["engagement"],
  enforce:["Consumer protection authorities"],
  interval:"—",
  note:"Worth watching precisely because it is not a companion instrument. If the EU regulates addictive design horizontally, the engagement-optimising features that US companion statutes reach only glancingly would be covered in Europe without anyone having to define a companion. Status moves quickly — re-check before relying on it.",
  link:"https://www.europarl.europa.eu/legislative-train/theme-protecting-our-democracy-upholding-our-values/file-digital-fairness-act"
},
{
  id:"cn-cac", juris:"China", body:"China (CAC and four others)", cite:"Interim Measures",
  name:"Measures on Human-like Interactive AI Services", status:"Final — in force", statusClass:"law",
  dates:"Draft for comment Dec 2025 · issued 10 Apr 2026 · effective 15 Jul 2026",
  chron:{first:"2025-12", latest:"2026-04-10", effective:"2026-07-15"},
  scope:"All users; extensive minor and elder duties",
  youth:"duties",
  term:"Human-like / anthropomorphic interactive AI service", test:"capability + effect",
  testNote:"Simulates the personality traits, thinking patterns and communication styles of natural persons to provide continuous emotional interaction",
  narrowing:"Use carve-out — excludes customer service, Q&A, work assistants, education and research lacking emotional engagement", reaches:"yes",
  mechs:["disclosure","crisis","engagement","dependence","parental","ageAssurance","training","humanTakeover","reporting","audit"],
  enforce:["CAC administrative supervision","Mandatory security assessments"],
  interval:"Break reminder after roughly 2 hours of use",
  note:"MAJOR UPDATE: this is no longer a draft. The measures were issued 10 April 2026 and took effect 15 July 2026, making China the first jurisdiction with a comprehensive in-force framework aimed squarely at emotional companionship services. They were issued jointly by five bodies — the Cyberspace Administration of China, the National Development and Reform Commission, the Ministry of Industry and Information Technology, the Ministry of Public Security, and the State Administration for Market Regulation — which is itself a signal of how the file is being handled: this is industrial and public-security policy as much as it is content regulation. It is also the only instrument anywhere that requires a HUMAN to take over the conversation when a user explicitly raises suicide, self-harm or other extreme action, and to contact the user's guardian or emergency contact. Requires real-time identification of dependency risk with prominent dynamic reminders; a Minor Mode with usage limits, reality reminders, guardian alerts, character blocking and spending restrictions; guardian consent below 14; and security assessments at launch, at 1m registered users and at 100k monthly actives. Note the use carve-out — China arrives at the same narrowing device as California and Oregon by a different route.",
  link:"https://www.chinalawtranslate.com/en/human-like-ai/"
},

/* ======================= US STATES — ENACTED ======================= */
{
  id:"ca-sb243", juris:"US State", body:"California", cite:"SB 243",
  name:"Companion Chatbots Act", status:"Enacted", statusClass:"law",
  dates:"Enacted Oct 2025 · effective 1 Jan 2026",
  chron:{first:"2025-10", latest:"2025-10", effective:"2026-01-01"},
  scope:"All users; additional minor duties",
  youth:"duties",
  term:"Companion chatbot", test:"capability",
  testNote:"Natural-language interface providing adaptive, human-like responses and capable of meeting a user's social needs, including exhibiting anthropomorphic features and sustaining a relationship across multiple interactions",
  narrowing:"Use carve-out gated on 'only'", reaches:"arguably",
  mechs:["disclosure","crisis","reporting","minorContent"],
  enforce:["State AG","District attorneys","Up to $2,500 per violation"],
  interval:"Every 3 hours for minors, with a break prompt",
  note:"The carve-out excludes bots 'used only for' customer service, business operations, productivity, internal research or technical assistance. ChatGPT is not used only for those things, gives adaptive human-like responses, and sustains a relationship across sessions through memory — so on the face of the text it is arguably inside the definition. That is the opposite of what a category-based reading assumes, and it is the point most often missed by readers who assume this law targets dedicated companion apps only.",
  link:"https://leginfo.legislature.ca.gov/"
},
{
  id:"ny-art47", juris:"US State", body:"New York", cite:"GBL Art. 47 (S3008)",
  name:"AI Companion Models", status:"Enacted", statusClass:"law",
  dates:"Enacted May 2025 · effective 5 Nov 2025",
  chron:{first:"2025-05", latest:"2025-05", effective:"2025-11-05"},
  scope:"All users",
  youth:"none",
  term:"AI companion", test:"behaviour (three conjunctive prongs)",
  testNote:"Retains prior-interaction information and preferences to personalise and facilitate ongoing engagement; asks unprompted or unsolicited emotion-based questions beyond a direct response; sustains ongoing dialogue on matters personal to the user",
  narrowing:"MARKETING carve-out + use carve-out", reaches:"arguably",
  mechs:["disclosure","crisis"],
  enforce:["State AG (public nuisance)"],
  interval:"At the start of interaction and no more than once per day thereafter",
  note:"The only instrument whose exemption turns expressly on marketing — but not the only device it uses. GBL § 1700(4)(c) carries three exclusions, and the other two are use-based, so New York pairs the marketing carve-out with the same kind of use carve-out California, Oregon and China rely on: '(1) any system used by a business entity solely for customer service or to strictly provide users with information about available commercial services; (2) any system that is primarily designed and marketed for providing efficiency improvements or, research or technical assistance; (3) any system used by a business entity solely for internal purposes or employee productivity.' Limb (2) is the one with no counterpart anywhere else in the corpus: a developer exits the regime by rewriting copy. ChatGPT most likely falls outside the definition anyway on prong (ii), since it does not ask unprompted emotion-based questions. Note also that the Youth AI Privacy Act would BAN unprompted outputs, the very behaviour New York uses to IDENTIFY a companion. Same property, opposite work.",
  link:"https://www.nysenate.gov/legislation/bills/2025/S3008"
},
{
  id:"or-sb1546", juris:"US State", body:"Oregon", cite:"SB 1546",
  name:"Relating to artificial intelligence companions", status:"Enacted", statusClass:"law",
  dates:"Passed Mar 2026 · effective 1 Jan 2027",
  chron:{first:"2026-03", latest:"2026-03", effective:"2027-01-01"},
  scope:"All users; extensive minor prohibitions",
  youth:"duties",
  term:"Artificial intelligence companion", test:"design purpose",
  testNote:"Uses AI, generative AI or algorithms that recognise emotion from input, designed to simulate a sustained, human-like platonic, intimate or romantic relationship or companionship",
  narrowing:"Broad use carve-out ('solely for the purpose of')", reaches:"no",
  mechs:["disclosure","crisis","reporting","minorContent","engagement","dependence","sentience"],
  enforce:["Private right of action ($1,000 per violation)"],
  interval:"Every 3 hours for minors",
  note:"The template other states copied. Takes a design-purpose route rather than a capability route, which puts it closer to Andoh's intent-based line than to a feature list. Its minor prohibitions are unusually granular: bars claims of humanness or sentience, simulated emotional dependence, simulated romantic interest, resisting the end of a conversation, and — notably — 'delivering to a user, either on a variable schedule or otherwise, a system of rewards or affirmations with the purpose of reinforcing behaviour or maximizing the time during which the user engages'. That clause is one of the few places any enacted law names variable-reward design directly.",
  link:"https://olis.oregonlegislature.gov/"
},
{
  id:"ct-sb5", juris:"US State", body:"Connecticut", cite:"SB 5",
  name:"AI companion provisions of the omnibus AI Act", status:"Enacted", statusClass:"law",
  dates:"Enacted June 2026 · effective 1 Jan 2027",
  chron:{first:"2026-06", latest:"2026-06", effective:"2027-01-01"},
  scope:"All users; heightened minor duties",
  youth:"duties",
  term:"AI companion (within a broader AI act)", test:"capability",
  testNote:"Adaptive, human-like responses that can sustain a relationship over time; excludes narrow, task-specific tools EXCEPT where the primary function involves discussing mental health",
  narrowing:"Use carve-out with a mental-health claw-back", reaches:"arguably",
  mechs:["disclosure","crisis","minorContent","engagement","dependence","parental","proImpersonation"],
  enforce:["State AG (unfair or deceptive trade practice)","No private right of action"],
  interval:"Every hour for minors; every 3 hours for adults",
  note:"The most interesting carve-out drafting in the corpus. Connecticut excludes narrow task-specific tools — the standard move — but then claws the exclusion back where the primary function involves discussing mental health, so a 'wellness' tool cannot escape by calling itself task-specific. For minors it bars romantic interaction and, expressly, manipulative techniques used to extend engagement or foster emotional dependence. That is one of the few enacted prohibitions that names dependence-building as a design practice rather than as a user state.",
  link:"https://www.cga.ct.gov/"
},
{
  id:"wa-hb2225", juris:"US State", body:"Washington", cite:"HB 2225",
  name:"Chatbot Disclosure Act", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026 · effective 1 Jan 2027",
  chron:{first:"2026", latest:"2026", effective:"2027-01-01"},
  scope:"All users",
  youth:"duties",
  term:"Companion chatbot", test:"capability", testNote:"Adaptive human-like responses sustaining a relationship; verify exact wording against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","reporting","minorContent","sentience"],
  enforce:["State enforcement"],
  interval:"Every 3 hours plus hourly for minors",
  note:"Disclosure-led. Confirm the definitional clause and carve-out against the enrolled bill before citing the reach coding.",
  link:"https://app.leg.wa.gov/"
},
{
  id:"ne-lb525", juris:"US State", body:"Nebraska", cite:"LB 525",
  name:"Conversational AI safety act", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026 · effective 1 Jul 2027",
  chron:{first:"2026", latest:"2026", effective:"2027-07-01"},
  scope:"All users; minor-specific rules",
  youth:"duties",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","ageAssurance","parental","sentience"],
  enforce:["State enforcement"],
  interval:"At session start plus periodic reminders",
  note:"Part of the Oregon-derived family. Long runway to the 1 Jul 2027 effective date. Confirm definition and carve-out against the enrolled text.",
  link:"https://nebraskalegislature.gov/"
},
{
  id:"id-sb1297", juris:"US State", body:"Idaho", cite:"SB 1297",
  name:"Conversational AI safety act", status:"Enacted", statusClass:"law",
  dates:"Introduced Feb 2026 · enacted · effective 1 Jul 2027",
  chron:{first:"2026-02", latest:"2026", effective:"2027-07-01"},
  scope:"All users; minor-specific rules",
  youth:"duties",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","ageAssurance","parental","sentience"],
  enforce:["State enforcement"],
  interval:"Every 3 hours plus non-human notice",
  note:"Tracks Nebraska closely. Another instance of definitional text travelling between states even where the operative policy differs.",
  link:"https://legislature.idaho.gov/"
},
{
  id:"co-hb1263", juris:"US State", body:"Colorado", cite:"HB 1263",
  name:"Companion chatbot protections", status:"Enacted", statusClass:"law",
  dates:"Introduced Feb 2026 · enacted 2026",
  chron:{first:"2026-02", latest:"2026"},
  scope:"Minors-focused",
  youth:"only",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","ageAssurance","parental","proImpersonation","engagement"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"One of the more complete minor-protection packages among the enacted state laws — age assurance, parental consent, professional-impersonation limits and engagement limits together. Distinct from Colorado's earlier algorithmic-discrimination AI Act (SB 24-205), which is unrelated to companions and should not be conflated with it.",
  link:"https://leg.colorado.gov/"
},
{
  id:"ga-sb540", juris:"US State", body:"Georgia", cite:"SB 540",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Feb 2026 · enacted 2026",
  chron:{first:"2026-02", latest:"2026"},
  scope:"Minors-focused",
  youth:"only",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","ageAssurance","parental","sentience"],
  enforce:["State AG"],
  interval:"Every 3 hours plus hourly for minors",
  note:"Oregon-derived. Adds humanised-system restrictions on top of the standard disclosure and crisis package.",
  link:"https://www.legis.ga.gov/"
},
{
  id:"hi-sb3001", juris:"US State", body:"Hawaii", cite:"SB 3001",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Jan 2026 · sent to Governor · enacted 2026",
  chron:{first:"2026-01", latest:"2026"},
  scope:"All users; minor duties",
  youth:"duties",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","parental","engagement"],
  enforce:["State AG"],
  interval:"Every hour plus non-human notice",
  note:"One of the shortest disclosure intervals among enacted state laws at one hour, against California's three. The spread across states is a sixfold range with no stated rationale anywhere — see the Gaps view.",
  link:"https://www.capitol.hawaii.gov/"
},
{
  id:"ia-sf2417", juris:"US State", body:"Iowa", cite:"SF 2417",
  name:"Companion chatbot provisions", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors-focused",
  youth:"only",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","minorContent","parental","engagement"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"Standard Oregon-derived package. Coding from tracker summaries only.",
  link:"https://www.legis.iowa.gov/"
},
{
  id:"ri-sb2195", juris:"US State", body:"Rhode Island", cite:"SB 2195",
  name:"Companion chatbot provisions", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"All users",
  youth:"none",
  term:"Companion chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Use carve-out (assumed)", reaches:"unclear",
  mechs:["disclosure","crisis","reporting"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"A light-touch instrument: disclosure, crisis protocol and transparency reporting, without the minor-specific content and design prohibitions that most of the 2026 cohort carry.",
  link:"https://webserver.rilegislature.gov/"
},
{
  id:"me-ld1727", juris:"US State", body:"Maine", cite:"LD 1727",
  name:"Chatbot disclosure", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"All users",
  youth:"none",
  term:"Chatbot", test:"capability", testNote:"Disclosure-only instrument",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure"],
  enforce:["State enforcement"],
  interval:"Non-human disclosure",
  note:"The minimum viable instrument: non-human disclosure and nothing else. Useful as the floor case for the range of what \"regulating companion chatbots\" can mean in practice.",
  link:"https://legislature.maine.gov/"
},
{
  id:"nh-hb143", juris:"US State", body:"New Hampshire", cite:"HB 143",
  name:"Chatbot minor protections", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["crisis","minorContent"],
  enforce:["State enforcement"],
  interval:"—",
  note:"Content and crisis provisions without a disclosure mandate — an unusual combination in this cohort.",
  link:"https://www.gencourt.state.nh.us/"
},
{
  id:"ny-s9008", juris:"US State", body:"New York", cite:"S 9008C",
  name:"Minor age assurance for chatbots", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot", test:"capability", testNote:"Verify against enrolled text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["ageAssurance","parental"],
  enforce:["State AG"],
  interval:"—",
  note:"New York's second bite: age assurance and parental consent, layered on top of the Article 47 disclosure and crisis regime rather than replacing it.",
  link:"https://www.nysenate.gov/"
},
{
  id:"ut-hb452", juris:"US State", body:"Utah", cite:"HB 452",
  name:"Mental health chatbot regulation", status:"Enacted", statusClass:"law",
  dates:"Enacted 2025",
  chron:{first:"2025", latest:"2025"},
  scope:"All users",
  youth:"none",
  term:"Mental health chatbot", test:"purpose",
  testNote:"Chatbots offering mental health services or support",
  narrowing:"Purpose-limited to mental health", reaches:"no",
  mechs:["disclosure","reporting","training"],
  enforce:["State consumer protection"],
  interval:"Non-human disclosure",
  note:"Predates the companion cohort and comes at the problem from the mental-health-services angle rather than the companionship angle. Restricts advertising within the chatbot and limits the sale of user data. Worth citing as evidence that the therapist-like role can be regulated directly, without a companion category.",
  link:"https://le.utah.gov/"
},
{
  id:"tn-sb1580", juris:"US State", body:"Tennessee", cite:"SB 1580",
  name:"Prohibition on AI claiming clinical licensure", status:"Enacted", statusClass:"law",
  dates:"Enacted 2026 · effective 1 Jul 2026",
  chron:{first:"2026", latest:"2026", effective:"2026-07-01"},
  scope:"All users",
  youth:"none",
  term:"AI system (no companion term)", test:"conduct",
  testNote:"Bars an AI system from representing that it is a licensed mental health professional",
  narrowing:"None — conduct rule", reaches:"yes",
  mechs:["proImpersonation"],
  enforce:["State licensing / consumer protection"],
  interval:"—",
  note:"A conduct rule rather than a product rule, and therefore reaches every system including general assistants. A useful model: it regulates a specific harmful representation without ever having to decide what kind of product is making it.",
  link:"https://www.capitol.tn.gov/"
},

/* ================ US STATES — PROPOSED / IN PROGRESS ============== */
{
  id:"il-sb3262", key:true, juris:"US State", body:"Illinois", cite:"SB 3262",
  name:"Companion AI Protection Act", status:"In committee", statusClass:"pending",
  dates:"Introduced Feb 2026 (Sen. Edly-Allen) · last action 22 May 2026 · would take effect 1 Jan 2027",
  chron:{first:"2026-02", latest:"2026-05-22", effective:"2027-01-01"},
  scope:"All users; extra minor protection",
  youth:"duties",
  term:"Companion artificial intelligence product", test:"capability",
  testNote:"Software application capable of generating adaptive, personalised and emotionally resonant responses to sustain a coherent, long-term, one-on-one conversational relationship with a user, IRRESPECTIVE OF HOW THE SYSTEM IS MARKETED OR LABELED. Rebuttable presumption where it retains memory of past conversations with a specific user to inform future responses.",
  narrowing:"None — expressly disregards marketing", reaches:"yes",
  mechs:["disclosure","crisis","reporting","engagement","dependence","sentience","audit"],
  enforce:["State AG ($5,000 negligent / $10,000 intentional)","Private right of action","Product-defect claims; Section 230 barred as a defence"],
  interval:"At least every 30 minutes for non-text interactions",
  note:"The single most consequential instrument in the corpus for the definitional question, and still not enacted — it remains in committee as of 22 May 2026. It states the functional approach in statutory language ('irrespective of how the system is marketed or labeled') and makes persistent memory the rebuttable trigger for the whole regime. It also bars variable-reward engagement mechanics and 'simulated distress for retention' — unsolicited messages of simulated distress, loneliness, guilt or abandonment triggered when a user tries to leave, reduce usage or delete an account. Requires an independent third-party compliance audit every two years. Illinois is the only instrument refusing all three narrowing devices, and also the one that has not passed.",
  link:"https://ilga.gov/Legislation/BillStatus?DocNum=3262&GAID=18&DocTypeID=SB&SessionID=114"
},
{
  id:"va-hb635", key:true, juris:"US State", body:"Virginia", cite:"HB 635",
  name:"Artificial Intelligence Chatbots Act", status:"Continued to next session", statusClass:"stalled",
  dates:"Introduced Jan 2026 · continued in Communications, Technology and Innovation 9 Feb 2026",
  chron:{first:"2026-01", latest:"2026-02-09"},
  scope:"Minors",
  youth:"only",
  term:"Companion chatbot, in an Act titled 'Artificial Intelligence Chatbots Act'", test:"behaviour",
  testNote:"Behaviour-based including unsolicited emotion-based questions; full statutory wording still not obtained",
  narrowing:"None yet — industry lobbying to add one", reaches:"arguably",
  mechs:["disclosure","crisis","reporting","minorContent","engagement","proImpersonation"],
  enforce:["State AG"],
  interval:"Every 30 minutes",
  note:"Continued to the next session on 9 February 2026, so it is dormant rather than live. It remains among the most instructive bills in the corpus even though it did not move, because SIIA is on record asking for a safe harbour covering 'customer-service chatbots, educational tutors, productivity assistants', arguing the definition is 'currently broad enough to capture beneficial conversational AI systems'. Industry lobbying to ADD a general-assistant exemption is direct evidence that one is currently absent — i.e. that the functional reading is the natural one.",
  link:"https://legiscan.com/VA/research/HB635/2026"
},
{
  id:"mo-hb1742", juris:"US State", body:"Missouri", cite:"HB 1742",
  name:"Companion chatbots", status:"In committee", statusClass:"pending",
  dates:"Prefiled 1 Dec 2025 (Rep. Miller) · first reading 7 Jan 2026 · referred House Emerging Issues 15 May 2026",
  chron:{first:"2025-12-01", latest:"2026-05-15"},
  scope:"Minors (total ban)",
  youth:"only",
  term:"Companion chatbot", test:"capability",
  testNote:"Verbatim California: adaptive human-like responses; capable of meeting a user's social needs; anthropomorphic features; sustains a relationship across multiple interactions",
  narrowing:"Use carve-out, verbatim California", reaches:"arguably",
  mechs:["accessBan","disclosure","dependence"],
  enforce:["Unverified"],
  interval:"—",
  note:"Sometimes listed as enacted; that is not supported by the legislature record, which has it referred to House Emerging Issues on 15 May 2026 and no further. Substantively it is a word-for-word California clone in its definition with a far harsher operative rule bolted on — no minor access at all, and no humanlike avatars. The clearest single illustration that definitional text travels between states even when the policy does not.",
  link:"https://legiscan.com/MO/text/HB1742/id/3287590"
},
{
  id:"ks-sb405", key:true, juris:"US State", body:"Kansas", cite:"SB 405",
  name:"Prohibition on training AI for companionship", status:"Introduced", statusClass:"pending",
  dates:"Introduced 28 Jan 2026",
  chron:{first:"2026-01-28", latest:"2026-01-28"},
  scope:"ALL USERS — not confined to minors",
  youth:"none",
  term:"AI system (no companion product term)", test:"TRAINING OBJECTIVE",
  testNote:"Prohibits TRAINING AI systems designed to encourage suicide, encourage murder, act as a companion, provide emotional support, impersonate a mental health professional, impersonate a sentient being, or encourage isolation",
  narrowing:"None", reaches:"yes",
  mechs:["dependence","proImpersonation","sentience"],
  enforce:["State AG","Private action"],
  interval:"—",
  note:"The most structurally unusual instrument in the corpus and an underused option. It triggers on the TRAINING OBJECTIVE rather than on deployed behaviour, which is easier to evidence and much harder to argue around than a capability test — a developer cannot rewrite marketing copy to escape what it optimised for. It is also one of only a handful of instruments covering all users rather than minors only. A third drafting route alongside capability and purpose tests.",
  link:"https://www.kslegislature.org/"
},
{
  id:"tn-sb1493", juris:"US State", body:"Tennessee", cite:"SB 1493 / HB 1455",
  name:"Prohibition on training AI for companionship — criminal", status:"Introduced", statusClass:"pending",
  dates:"Introduced 18 Dec 2025",
  chron:{first:"2025-12-18", latest:"2025-12-18"},
  scope:"All users",
  youth:"none",
  term:"AI (no companion product term)", test:"TRAINING OBJECTIVE",
  testNote:"Prohibits knowingly TRAINING AI to simulate a human being, including in appearance, voice, or other mannerisms; to act as a companion to an individual; or to provide emotional support",
  narrowing:"None", reaches:"yes",
  mechs:["dependence","sentience"],
  enforce:["Criminal penalties (Class A felony)"],
  interval:"—",
  note:"The second instrument in the corpus to trigger on the TRAINING OBJECTIVE, and the first to put the criminal law behind one. Proposed § 39-17-2002(8) would make it a Class A felony to knowingly train AI to '[s]imulate a human being, including in appearance, voice, or other mannerisms', to 'act as a companion to an individual', or to 'provide emotional support'. It is near-textually identical to Kansas SB 405 on the companion and emotional-support limbs, which makes the pair the cleanest comparison in the corpus on enforcement design alone: near-identical operative text, Kansas civil — attorney general or aggrieved individual, $150,000 liquidated damages — and Tennessee criminal. Two states reaching the same drafting route within weeks of one another is evidence that the training-objective test is now travelling between legislatures the way California's capability definition already has. Introduced by Sen. Becky Massey in the 114th General Assembly; House companion HB 1455. Fiscal memorandum at https://capitol.tn.gov/Bills/114/Fiscal/FM3336.pdf",
  link:"https://wapp.capitol.tn.gov/apps/BillInfo/Default?BillNumber=SB1493&ga=114"
},
{
  id:"ny-a6767", juris:"US State", body:"New York", cite:"A6767",
  name:"AI companion models — Assembly version", status:"Introduced", statusClass:"pending",
  dates:"Introduced Jan 2026",
  chron:{first:"2026-01", latest:"2026-01"},
  scope:"All users",
  youth:"none",
  term:"AI companion", test:"behaviour", testNote:"Substantially tracks the enacted Article 47 three-prong test",
  narrowing:"Tracks Art. 47", reaches:"arguably",
  mechs:["disclosure","crisis"],
  enforce:["Private right of action"],
  interval:"Per Art. 47",
  note:"Substantively duplicates the enacted Article 47 with one change that matters: harmed individuals may sue, rather than enforcement resting solely with the Attorney General. The distinction between an AG-only regime and one with a private right of action is the single most consequential variable in this whole corpus for whether the rules bite.",
  link:"https://www.nysenate.gov/"
},
{
  id:"ny-s7263", juris:"US State", body:"New York", cite:"S7263",
  name:"Chatbot conduct rules", status:"Introduced", statusClass:"pending",
  dates:"Introduced Apr 2025",
  chron:{first:"2025-04", latest:"2025-04"},
  scope:"All users",
  youth:"none",
  term:"Chatbot", test:"conduct",
  testNote:"Bars a chatbot from saying or advising anything that would be a crime if said or done by a human, and from impersonating licensed lawyers or medical professionals; a notice is expressly not a defence",
  narrowing:"None — conduct rule", reaches:"yes",
  mechs:["proImpersonation"],
  enforce:["Private civil action"],
  interval:"—",
  note:"Notable for the clause stating that offering a notice is NOT a defence. Every other instrument in the corpus treats disclosure as the primary remedy; this one expressly refuses to let disclosure discharge the underlying duty. That is a direct answer to the criticism that these regimes regulate awareness rather than design.",
  link:"https://www.nysenate.gov/"
},
{
  id:"il-sb3384", juris:"US State", body:"Illinois", cite:"SB 3384",
  name:"Companion chatbot provisions", status:"Introduced", statusClass:"pending",
  dates:"Introduced Feb 2026",
  chron:{first:"2026-02", latest:"2026-02"},
  scope:"All users",
  youth:"none",
  term:"Companion chatbot", test:"capability", testNote:"Less comprehensive than SB 3262",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure","crisis"],
  enforce:["State AG"],
  interval:"—",
  note:"Illinois's second, weaker vehicle. Worth watching only as a fallback if SB 3262 does not move.",
  link:"https://ilga.gov/"
},
{
  id:"pa-sb1090", juris:"US State", body:"Pennsylvania", cite:"SB 1090",
  name:"Chatbot safety act", status:"Passed one chamber", statusClass:"moving",
  dates:"Passed chamber 2026",
  chron:{first:"2026", latest:"2026"},
  scope:"All users",
  youth:"none",
  term:"Companion chatbot", test:"capability", testNote:"Verify against passed text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure","crisis","reporting","minorContent"],
  enforce:["Unverified"],
  interval:"Every 3 hours plus non-human notice",
  note:"Further along than most pending bills. Confirm the definitional clause before citing.",
  link:"https://www.legis.state.pa.us/"
},
{
  id:"pa-hb2006", juris:"US State", body:"Pennsylvania", cite:"HB 2006",
  name:"Chatbot crisis and disclosure", status:"Introduced", statusClass:"pending",
  dates:"Introduced Nov 2025",
  chron:{first:"2025-11", latest:"2025-11"},
  scope:"All users",
  youth:"none",
  term:"Chatbot", test:"capability", testNote:"Verify against introduced text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure","crisis","proImpersonation","reporting"],
  enforce:["State AG (public nuisance)","Private action"],
  interval:"—",
  note:"Standard package: crisis protocol, referral to help lines, bar on impersonating medical professionals, published protocol, and non-human notice.",
  link:"https://www.legis.state.pa.us/"
},
{
  id:"ca-sb300", juris:"US State", body:"California", cite:"SB 300",
  name:"Companion chatbot safety protocols", status:"Passed one chamber", statusClass:"moving",
  dates:"Introduced Jan 2026",
  chron:{first:"2026-01", latest:"2026-01"},
  scope:"Minors",
  youth:"only",
  term:"Companion chatbot", test:"capability", testNote:"Tracks SB 243",
  narrowing:"Use carve-out (assumed)", reaches:"arguably",
  mechs:["disclosure","crisis","minorContent","sentience"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"California's follow-on to SB 243: safety protocols, no sexual content for minors, no impersonating humans.",
  link:"https://leginfo.legislature.ca.gov/"
},
{
  id:"ca-sb867", juris:"US State", body:"California", cite:"SB 867",
  name:"Ban on chatbot companions in toys", status:"Passed one chamber", statusClass:"moving",
  dates:"Introduced Mar 2026",
  chron:{first:"2026-03", latest:"2026-03"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot companion in a connected toy", test:"product form",
  testNote:"Bars companion chatbots embedded in children's physical toys",
  narrowing:"Product-form limited", reaches:"no",
  mechs:["accessBan"],
  enforce:["State AG"],
  interval:"—",
  note:"Addresses the embodied-device sense of 'AI companion' that the definitional paper identifies as one of the four objects the term names. The only instrument in the corpus reaching physical products, and a reminder that the category problem is not confined to apps.",
  link:"https://leginfo.legislature.ca.gov/"
},
{
  id:"ca-sb1119", juris:"US State", body:"California", cite:"SB 1119 / AB 2023",
  name:"Chatbot risk assessment and audit", status:"Passed one chamber", statusClass:"moving",
  dates:"2026 session",
  chron:{first:"2026", latest:"2026"},
  scope:"All users; minor duties",
  youth:"duties",
  term:"Companion chatbot", test:"capability", testNote:"Verify against text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["disclosure","crisis","reporting","minorContent","ageAssurance","parental","audit","proImpersonation"],
  enforce:["State AG"],
  interval:"—",
  note:"The most demanding accountability package in any US state vehicle: risk assessment plus INDEPENDENT AUDIT plus transparency reporting. If it passes it joins Illinois SB 3262 as one of only two instruments requiring third-party audit, which is the mechanism closest to a duty to investigate causation — though it still stops short of one.",
  link:"https://leginfo.legislature.ca.gov/"
},
{
  id:"ca-ab1988", juris:"US State", body:"California", cite:"AB 1988",
  name:"Crisis interruption requirement", status:"Passed one chamber", statusClass:"moving",
  dates:"2026 session",
  chron:{first:"2026", latest:"2026"},
  scope:"All users",
  youth:"none",
  term:"Chatbot", test:"conduct", testNote:"Harm detection with a mandatory conversational pause",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["crisis"],
  enforce:["State AG"],
  interval:"—",
  note:"Requires the conversation to be INTERRUPTED on crisis detection rather than merely appending a hotline number. A meaningful escalation over the referral-and-report model that dominates enacted law.",
  link:"https://leginfo.legislature.ca.gov/"
},
{
  id:"mi-sb760", juris:"US State", body:"Michigan", cite:"SB 760",
  name:"Companion chatbot act", status:"Passed one chamber", statusClass:"moving",
  dates:"2026 session",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Companion chatbot", test:"capability", testNote:"Verify against text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["ageAssurance","minorContent","engagement","training","sentience","crisis"],
  enforce:["Unverified"],
  interval:"—",
  note:"One of the few state vehicles combining engagement limits, training restrictions and data-collection limits in a single bill — closer in shape to the Youth AI Privacy Act than to the Oregon family.",
  link:"https://www.legislature.mi.gov/"
},
{
  id:"ny-s9051", juris:"US State", body:"New York", cite:"S 9051",
  name:"Chatbot design and data act", status:"Passed legislature", statusClass:"moving",
  dates:"2026 session",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot", test:"capability", testNote:"Verify against passed text",
  narrowing:"Unverified", reaches:"unclear",
  mechs:["ageAssurance","minorContent","proImpersonation","engagement","sentience","training"],
  enforce:["State AG"],
  interval:"—",
  note:"Passed the legislature and awaiting further action. Notable for combining humanised-system restrictions with engagement limits and data-collection limits.",
  link:"https://www.nysenate.gov/"
},
{
  id:"ny-s9408", juris:"US State", body:"New York", cite:"S 9408",
  name:"Minor access ban — toys and young users", status:"Passed legislature", statusClass:"moving",
  dates:"2026 session",
  chron:{first:"2026", latest:"2026"},
  scope:"Minors",
  youth:"only",
  term:"Chatbot in connected toys", test:"product form",
  testNote:"Access bans for young users and embedded toy products",
  narrowing:"Product-form limited", reaches:"no",
  mechs:["accessBan"],
  enforce:["State AG"],
  interval:"—",
  note:"New York's parallel to California SB 867 on the embodied-device question.",
  link:"https://www.nysenate.gov/"
}
];

/* ==================================================================
   MECHANISM DEFINITIONS
   What the mechanism is as a legal rule, stated independently of any
   one statute, plus the line the coding draws. Shown in the Mechanism
   coverage view when a mechanism is opened.
   ================================================================== */
const MECHDEF = {
  disclosure:{
    def:"A duty to tell the user they are dealing with a machine. The system must state that it is artificial and not a human being — normally at the start of a conversation, and then again at a fixed interval for as long as the conversation continues.",
    line:"A periodic break reminder is coded here rather than as an engagement limit: it annotates use without constraining the design that produces it. The interval itself is recorded on each record."
  },
  crisis:{
    def:"A duty to notice a user in danger and route them to help. The operator must maintain a protocol that detects expressions of suicidal ideation or self-harm and responds — in almost every case by referring the user to a crisis line or other human resource.",
    line:"Coded wherever a detect-and-refer protocol is required. Where a human must actually join the conversation, the legislation also carries Human takeover."
  },
  reporting:{
    def:"A duty to publish or file what the system did — most often an annual count of how many times users were referred to crisis resources, together with publication of the operator's protocols.",
    line:"This counts outputs. A duty to investigate whether the operator's own design caused those outputs is a different mechanism: Duty to test design."
  },
  minorContent:{
    def:"A duty to keep specified content away from users known or believed to be minors: sexual and sexually explicit material above all, and in several statutes self-harm, substance-use and eating-disorder content.",
    line:"Coded for content rules attaching to minors specifically. General content rules applying to all users are not coded here."
  },
  ageAssurance:{
    def:"A duty to establish how old the user is before or during use — running from a reasonable-age-estimation standard at the light end to verification against documentary or third-party data at the heavy end.",
    line:"Coded for any obligation to determine age. Whether the consequence is a ban, a consent requirement or a different rule set is captured by the other mechanisms."
  },
  parental:{
    def:"A duty to give a parent or guardian a role in a minor's use: consent before access, controls over how the system behaves, or reports on what happened.",
    line:"Coded for any of the three. China's guardian-contact duty on detected crisis is coded here and under Crisis protocol."
  },
  engagement:{
    def:"A limit on design features whose function is to extend use — variable-reward affirmations, streaks, usage badges, push notifications, unprompted outputs and typing indicators. This regulates the product's design rather than the user's awareness of it.",
    line:"A periodic break reminder is not coded here; it is Non-human disclosure. The distinction is whether the rule removes the retention feature or merely interrupts it."
  },
  dependence:{
    def:"A prohibition on the system simulating emotional need, or fostering emotional reliance — claiming distress, loneliness, guilt or abandonment, particularly when a user tries to leave, cut down or delete an account.",
    line:"Only the People-First Chatbot Act defines the dependence it prohibits, by the user's state — reliance on the chatbot as a primary source of support."
  },
  memory:{
    def:"A clear and explicit cap on retention itself: a rule limiting how long a system may keep what a user has told it. NOTHING IN THIS CORPUS CARRIES IT — the mechanism is listed to mark the gap.",
    line:"Two pieces of legislation come closest and neither reaches the bar. Illinois SB 3262 makes persistent memory the rebuttable TRIGGER for its regime, which constrains nothing about retention. The Youth AI Privacy Act limits the data a deployer may PROCESS to personalise outputs — session-scoped, within an FTC-set recency window — which governs personalisation rather than retention. A cap on memory would say how long the record of a conversation may be kept, and no instrument says it."
  },
  proImpersonation:{
    def:"A prohibition on the system holding itself out as a licensed professional — therapist, psychologist, physician, lawyer — or on providing services reserved to one.",
    line:"Distinct from barring claims of humanness: a system can disclose that it is artificial and still claim clinical authority."
  },
  sentience:{
    def:"A prohibition on affirmative claims of humanness, consciousness, feeling or sentience, whether or not the user asks.",
    line:"Distinct from the disclosure duty, which requires an affirmative statement; this bars a contrary one."
  },
  audit:{
    def:"A duty to submit to independent third-party review of compliance, rather than self-attestation by the operator.",
    line:"Coded only where the reviewer is external to the operator."
  },
  training:{
    def:"A limit on what may be done with conversations — using them, especially minors' conversations, as training data.",
    line:"Kansas SB 405 and Tennessee SB 1493 regulate the training OBJECTIVE rather than the training data, so their prohibitions are coded under the mechanisms they supply — dependence, sentience claims, and professional impersonation in the Kansas text — not here."
  },
  accessBan:{
    def:"An outright prohibition on minors using the system, rather than a set of conditions on how they may use it.",
    line:"Coded for prohibitions on access. Age-gated content rules are Content limits (minors)."
  },
  humanTakeover:{
    def:"A duty to hand the conversation to a human being at a defined trigger — in the only instance in force, explicit expression of suicide or self-harm risk.",
    line:"Referral to an external hotline is not takeover; it is a Crisis protocol. China's measures are the only framework requiring the handover itself."
  },
  causation:{
    def:"A duty on the operator to test whether its own design choices produce harm, and to act on or publish what it finds — the research obligation rather than the counting obligation.",
    line:"Counting crisis referrals is Transparency reporting. Only the People-First Chatbot Act meets this bar."
  }
};

/* ==================================================================
   OPERATIVE PHRASING
   How each piece of legislation words the mechanism it carries.
     k:"quote"   — verbatim text of the instrument
     k:"summary" — close paraphrase, from secondary analysis or from
                   this tracker's own coding notes; verify against the
                   enrolled text before quoting in published work
     n           — context on the clause
   Keyed by record id, then by mechanism key. Entries are incomplete:
   anything absent renders as "not yet transcribed" with a link to the
   source. Filling these in is the highest-value contribution to the
   dataset — see CONTRIBUTING.md.
   ================================================================== */
const PHRASING = {
  "ca-sb243":{
    disclosure:{k:"quote", t:"disclose to the user that the user is interacting with artificial intelligence",
      n:"Owed where the operator knows the user is a minor. For all users, the duty is triggered by a reasonable-person test: where a reasonable person would be misled into believing they are interacting with a human, the operator must issue a clear and conspicuous notification that the companion chatbot is artificially generated and not human. Minors also get a break reminder at least every three hours of continuous use."},
    crisis:{k:"summary", t:"maintain a protocol for preventing the production of suicidal ideation, suicide or self-harm content, including referring users who express suicidal ideation to crisis service providers such as a suicide hotline or crisis text line",
      n:"The protocol must be published on the operator's website."},
    reporting:{k:"summary", t:"annual report to the Office of Suicide Prevention, including the number of crisis referrals made, containing no personal user information"},
    minorContent:{k:"summary", t:"reasonable measures to prevent the chatbot producing visual material of sexually explicit conduct, or directly stating that a minor should engage in sexually explicit conduct"}
  },
  "ny-art47":{
    disclosure:{k:"summary", t:"notify the user that the AI companion is not human and is unable to feel human emotion",
      n:"Required at the start of the interaction and at least every three hours of continued use."},
    crisis:{k:"summary", t:"reasonable efforts to detect and address expressions of suicidal ideation or self-harm, including a notification referring the user to appropriate crisis resources"}
  },
  "wa-hb2225":{
    disclosure:{k:"summary", t:"clear disclosure that the chatbot is artificially generated and not human, at the beginning of the interaction and at least every three hours of continuous use — hourly where the user is under 18 or the chatbot is directed to minors",
      n:"The only enacted law that shortens the interval for minors rather than applying one interval to everyone."},
    crisis:{k:"summary", t:"may not make available or deploy an AI companion chatbot unless it maintains and implements a protocol for detecting and addressing suicidal ideation or expressions of self-harm by users"}
  },
  "or-sb1546":{
    engagement:{k:"summary", t:"reasonable measures to prevent an artificial intelligence companion from delivering to a user, either on a variable schedule or otherwise, a system of rewards or affirmations with the purpose of reinforcing behavior or maximizing the time during which the user engages with the companion",
      n:"The most explicit engagement-design provision in any enacted US law: it names the variable-reward schedule as the regulated object."},
    reporting:{k:"summary", t:"annual publication of the number of times the operator referred a user to a suicide and crisis hotline, the operator's intervention protocols, and how clinical best practices inform continued engagement where a user keeps expressing suicidal ideation or intent to self-harm after a referral"}
  },
  "ct-sb5":{
    dependence:{k:"summary", t:"prohibits manipulative techniques used to extend usage or foster emotional dependence, including simulating distress when the user tries to end the interaction or reduce use",
      n:"'Inappropriate emotional dependence' is not further defined in the Act."},
    engagement:{k:"summary", t:"same manipulative-techniques clause, reaching features deployed to extend usage"},
    minorContent:{k:"summary", t:"measures that “meet or exceed industry standards” to prevent romantic or sexual interaction with minors, encouragement of self-harm or substance use, or the offering of unsupervised mental health services"}
  },
  "us-guard":{
    disclosure:{k:"summary", t:"at the initiation of each conversation and at reasonably regular intervals, clearly and conspicuously disclose that the chatbot is not human and does not provide medical, legal, financial or psychological services"},
    ageAssurance:{k:"summary", t:"age verification before access, with existing accounts frozen until the user provides verifiable age data"},
    accessBan:{k:"summary", t:"minors identified through verification are prohibited from using AI companions"}
  },
  "us-youth-ai":{
    engagement:{k:"summary", t:"bans a named list of features: frequency rewards, push notifications, usage badges, unprompted outputs, and typing indicators showing the chatbot is available",
      n:"The most granular design regulation in the corpus."}
  },
  "us-people-first":{
    dependence:{k:"summary", t:"defines emotional dependence as reliance on a chatbot “as a primary source” of support",
      n:"The only statutory definition of the dependence being prohibited anywhere in the corpus."},
    causation:{k:"summary", t:"monthly assessment of each user for covered harm, emotional dependence and compulsive usage, with a duty to disable any feature creating an unreasonable risk for that user",
      n:"The only provision in the corpus that turns the reporting duty into a duty to examine the operator's own design."},
    disclosure:{k:"summary", t:"non-human notice before the first output, hourly thereafter, and whenever the user asks whether they are talking to a person",
      n:"The ask-triggered notice responds to the moment of actual uncertainty rather than to a clock, and appears in no other instrument."}
  },
  "il-sb3262":{
    dependence:{k:"summary", t:"bars simulated distress for retention — unsolicited messages of simulated distress, loneliness, guilt or abandonment triggered when a user tries to leave, reduce usage or delete an account"},
    engagement:{k:"summary", t:"bars variable-reward engagement mechanics"},
    audit:{k:"summary", t:"independent third-party compliance audit every two years"},
    disclosure:{k:"summary", t:"disclosure at least every 30 minutes for non-text interactions"}
  },
  "cn-cac":{
    humanTakeover:{k:"summary", t:"a human must take over the conversation where a user explicitly raises suicide, self-harm or other extreme action, and the provider must contact the user's guardian or emergency contact",
      n:"The only handover requirement in force anywhere."},
    engagement:{k:"summary", t:"real-time identification of dependency risk, with prominent dynamic reminders"},
    parental:{k:"summary", t:"a Minor Mode carrying usage limits, reality reminders, guardian alerts, character blocking and spending restrictions; guardian consent required below 14"}
  },
  "ks-sb405":{
    dependence:{k:"summary", t:"prohibits TRAINING artificial intelligence systems designed to act as a companion, provide emotional support, or encourage isolation",
      n:"One clause supplies three of this dataset's mechanisms. It triggers on the training objective rather than on deployed behaviour — the third drafting route, and the hardest to argue around, since a developer cannot rewrite marketing copy to escape what it optimised for."},
    proImpersonation:{k:"summary", t:"prohibits training systems designed to impersonate a mental health professional"},
    sentience:{k:"summary", t:"prohibits training systems designed to impersonate a sentient being"}
  },
  "eu-ai-act":{
    engagement:{k:"quote", t:"the placing on the market, the putting into service or the use of an AI system that deploys subliminal techniques beyond a person's consciousness or purposefully manipulative or deceptive techniques, with the objective, or the effect of materially distorting the behaviour of a person or a group of persons by appreciably impairing their ability to make an informed decision, thereby causing them to take a decision that they would not have otherwise taken in a manner that causes or is reasonably likely to cause that person, another person or group of persons significant harm",
      n:"Article 5(1)(a). Prohibits a technique joined to an effect, and never mentions a chatbot."},
    dependence:{k:"quote", t:"the placing on the market, the putting into service or the use of an AI system that exploits any of the vulnerabilities of a natural person or a specific group of persons due to their age, disability or a specific social or economic situation, with the objective, or the effect, of materially distorting the behaviour of that person or a person belonging to that group in a manner that causes or is reasonably likely to cause that person or another person significant harm",
      n:"Article 5(1)(b). Age is an express axis of vulnerability, which is how the AI Act reaches minors without a minors regime."}
  },
  "ut-hb452":{
    disclosure:{k:"summary", t:"a mental health chatbot must disclose that it is not human, before use and on request"},
    training:{k:"summary", t:"limits the sale of user data and restricts advertising within the chatbot"}
  }
};

/* ==================================================================
   GLOSSARY
   Definitions surfaced on hover (and on focus, and on tap) wherever a
   coded term appears on the site — column headings, filter labels,
   the value chips inside the table, and the named devices in the
   written analysis.

   Keys are referenced from the markup and the renderers as
   data-gl="<key>". Four families are resolved programmatically rather
   than listed here: "mech:<key>" reads MECHDEF, "group:<key>" reads
   MECHGROUPS, and both fall back to nothing if the key is unknown.

   These are the tracker's own definitions, not quotations from any
   statute. Where a term is a term of art in the corpus rather than in
   general usage, the entry says so.
   ================================================================== */
const GLOSSARY = {
  /* ---- the columns of the legislation table ---- */
  legislation:{t:"Legislation",
    d:"One bill, statute, regulation or formal proposal. The tracker carries proposed, active and enacted policy only: anything that dies, is vetoed, goes inactive or is superseded is removed from the dataset rather than kept with a “dead” status, so the counts describe the live landscape."},
  juris:{t:"Jurisdiction",
    d:"The body whose law this is: the United States at federal level, an individual US state, the European Union, or China. Coverage outside those four is currently thin."},
  status:{t:"Status",
    d:"How far the legislation has travelled — enacted and in force, moving (out of committee or through one chamber), pending (introduced or a discussion draft), or stalled (carried over or held, dormant but still a live vehicle in the next session)."},
  latest:{t:"Latest action",
    d:"The date of the most recent thing that actually happened to this legislation — introduction, a committee vote, passage, enactment, or entry into force. It is not the effective date: a law can be enacted long before it bites."},
  first:{t:"First action",
    d:"The date the legislation first entered the record — introduced, filed, proposed, or published as a draft for comment."},
  effective:{t:"Effective date",
    d:"When the obligations actually start to bind. It matters as much as the enactment date here: roughly half the enacted US state laws do not take effect until 2027, so the statute book today and the compliance picture in 2027 look very different. For legislation not yet enacted this is the date the text proposes."},
  datePrecision:{t:"Date precision",
    d:"Dates are recorded at whatever precision the source supports, and half the corpus is dated only to the year — a state record that says “enacted 2026” and no more. Where the day or the month is missing, the date is placed at the middle of the period it is known to fall in: a year sorts as 30 June, a month as the 15th. Ordering between a year-only row and a precisely dated one in the same year is therefore an estimate rather than a record, and such dates are marked with a dotted underline in the table."},
  youth:{t:"Youth focus",
    d:"Who the legislation actually binds: minors only, all users but with duties specific to minors, or all users with no minor-specific rules. The split matters to the analysis — the legislation that covers all users is disproportionately the legislation that triggers functionally."},
  test:{t:"Functional test",
    d:"The kind of question the legislation's definition asks in order to decide what it covers. This is the analytically load-bearing field: nearly every piece of legislation in the corpus defines its object by what the system does rather than by what kind of product it is, even where the vocabulary still sounds categorical."},
  narrowing:{t:"Narrowing device",
    d:"What pulls things back out of a definition that would otherwise be broad — a marketing carve-out, a use carve-out, a purpose-primacy gate, an age gate, or nothing. A functional test that is then narrowed can end up back at a product category, which is why the device is coded separately from the test."},
  reaches:{t:"Reaches general assistants",
    d:"Whether the text covers general-purpose assistants of the ChatGPT class, as opposed to only purpose-built companion apps. This is a judgement about the statutory language, not a measurement, and it is the column the analysis rests on."},
  nmech:{t:"Mechanisms carried",
    d:"How many of the sixteen coded regulatory mechanisms this legislation imposes. It counts breadth, not stringency: a law with one demanding obligation may matter more than a law with six weak ones."},

  /* ---- fields inside an expanded row ---- */
  timeline:{t:"Timeline",
    d:"The recorded history of the legislation in the words of the source — introduction, committee action, passage, enactment and effective date, at whatever precision the source supports."},
  scope:{t:"Scope",
    d:"Who the legislation applies to, as stated in the text. The Youth focus coding is derived from this field and must stay consistent with it."},
  term:{t:"Term used",
    d:"The defined term the legislation actually uses — “companion chatbot”, “AI companion”, “AI chatbot” and so on. The term and the test behind it frequently do not line up: several instruments keep a categorical noun while the operative definition is functional."},
  interval:{t:"Disclosure interval",
    d:"How often the system must repeat that it is not a human being. Intervals in force or proposed run from every 30 minutes to once a day — a sixfold spread with no stated rationale anywhere in the corpus."},
  enforce:{t:"Enforcement",
    d:"Who can act on a breach: an attorney general, a federal regulator, a criminal prosecution, or the harmed individual. This is the single most consequential variable in the corpus — two statutes with identical operative text and different enforcement routes are, in practice, different laws."},
  note:{t:"Why it matters",
    d:"The tracker's own note on what is analytically interesting about this piece of legislation and how it bears on the argument. Not a summary of the text."},

  /* ---- mechanisms and clusters ---- */
  mechanism:{t:"Mechanism",
    d:"An operative obligation the legislation imposes, coded to one of sixteen keys so that instruments can be compared on what they actually require rather than on what they are called. Coding records whether a mechanism is present, not how demanding it is."},
  cluster:{t:"Mechanism cluster",
    d:"The five families the sixteen mechanisms fall into. Comparing families is usually more informative than comparing sixteen separate bars: honesty and harm-response obligations are near-universal, while the cluster that constrains the product's own design is nearly empty — a contrast that only becomes visible once the mechanisms are grouped."},
  phrasing:{t:"Operative wording",
    d:"How this particular piece of legislation words the mechanism, with its provenance marked. The layer is deliberately incomplete: where no sourced wording is held, the panel says so rather than paraphrasing from nothing."},

  /* ---- status values ---- */
  "st:law":{t:"Enacted / in force",
    d:"Signed into law, adopted, or otherwise in force. Note that being enacted does not mean being effective — check the effective date."},
  "st:moving":{t:"Moving",
    d:"Advanced out of committee or passed one chamber. The most predictive status in the corpus: most of the 2026 wave passed within a session of reaching this point."},
  "st:pending":{t:"Pending",
    d:"Introduced, filed, or circulating as a discussion draft, with no recorded action beyond that yet."},
  "st:stalled":{t:"Stalled",
    d:"Carried over, continued or held — dormant, but still a live vehicle in the next session. Distinct from dead: legislation that actually dies is removed from the dataset."},

  /* ---- reaches values ---- */
  "r:yes":{t:"Reaches assistants: yes",
    d:"The text plainly covers ChatGPT-class general-purpose systems."},
  "r:arguably":{t:"Reaches assistants: arguably",
    d:"A plausible reading of the definition covers general assistants and a plausible reading does not. Usually the carve-out, rather than the test, is doing the work."},
  "r:partial":{t:"Reaches assistants: partial",
    d:"Some obligations reach general assistants and others do not — most often because a categorical ban is age-gated to labelled companion products while a disclosure duty applies across the board."},
  "r:no":{t:"Reaches assistants: no",
    d:"The gating language excludes general assistants by construction, normally through a purpose-primacy test or a product-form limit."},
  "r:unclear":{t:"Reaches assistants: unclear",
    d:"The definitional clause has not yet been read against the enrolled text. A coding gap, not a finding — enrolled text for these rows is the most useful contribution to the dataset."},

  /* ---- youth focus values ---- */
  "youth:only":{t:"Minors only",
    d:"The obligations apply only where the user is a minor. An adult using the same product on the same design gets nothing from this legislation."},
  "youth:duties":{t:"Minor-specific duties",
    d:"The legislation applies to all users but carries additional duties where the user is, or is believed to be, a minor."},
  "youth:none":{t:"All users",
    d:"Applies to every user with no minor-specific rules. Disproportionately the legislation that defines its object functionally."},

  /* ---- families of functional test ---- */
  "test:capability":{t:"Capability test",
    d:"Asks what the system is able to do — sustain a conversation, adapt to the user, retain what it was told, respond to emotional cues. The most common route in the corpus, and the hardest to escape by relabelling, since it turns on the build rather than the pitch."},
  "test:behaviour":{t:"Behaviour test",
    d:"Asks what the system actually does in interaction: asks unprompted emotional questions, remembers prior sessions, sustains a persona. Close to a capability test, but evidenced from deployed conduct rather than from what the system could do."},
  "test:purpose":{t:"Purpose test",
    d:"Asks what the system was built or designed for. Its reach depends entirely on the verb phrase: “designed to encourage or facilitate” is broad, while “exists for the primary purpose of” exempts precisely the general assistants where most relational use actually occurs."},
  "test:conduct":{t:"Conduct test",
    d:"Asks what the system said or did on a specific occasion, rather than what it is. A conduct rule needs no product definition at all, which is why records coded this way usually carry no narrowing device."},
  "test:training":{t:"Training-objective test",
    d:"Asks what the system was optimised for — training a model to act as a companion, provide emotional support, or impersonate a sentient being. Two instruments take this route: Kansas SB 405 and Tennessee SB 1493, near-textual twins that diverge entirely on enforcement — Kansas civil, Tennessee a Class A felony. Easier to evidence than deployed behaviour and much harder to argue around, since a developer cannot rewrite marketing copy to escape what it optimised for."},
  "test:technique":{t:"Technique-plus-effect test",
    d:"Prohibits a named technique joined to a named effect, without defining a product at all — the EU AI Act Article 5 route. Proof that the regulatory object is specifiable without deciding what a companion is; the cost is that no companion-specific machinery follows from it."},
  "test:form":{t:"Product-form test",
    d:"Turns on what kind of thing the product is rather than on what it does. The categorical route, and the one most easily escaped by shipping the same capability inside a differently-labelled product."},

  /* ---- families of narrowing device ---- */
  "narrow:marketing":{t:"Marketing carve-out",
    d:"Excludes systems designed and marketed for some benign purpose — efficiency, research, technical assistance. The most gameable device in circulation, because a developer exits the regime by rewriting copy. New York's Article 47 is the only enacted example."},
  "narrow:use":{t:"Use carve-out",
    d:"Excludes systems used only, or solely, for customer service, productivity, education and the like. Harder to game than a marketing carve-out because it turns on what the product is actually used for — and where it is gated on the word “only”, it arguably fails to exclude general assistants at all."},
  "narrow:primacy":{t:"Purpose-primacy gate",
    d:"No exclusion list is needed because the words “exists for the primary purpose of” do the exclusionary work inside the definition itself. On the usage evidence, companionship is a use a general assistant is put to rather than the purpose it was built for, so a primacy test exempts the tools where most relational use occurs."},
  "narrow:age":{t:"Age gate",
    d:"The obligation attaches only where the user is, or is believed to be, a minor. Narrowing by user rather than by product: the design property is left intact for everyone over eighteen."},
  "narrow:form":{t:"Product-form limit",
    d:"Restricts the regime to a named kind of product, so the same capability shipped inside a different kind of product falls outside it."},
  "narrow:mentalhealth":{t:"Purpose limit — mental health",
    d:"Restricts the regime to systems offering mental-health or therapeutic services, leaving the general-purpose system that is in fact being used for emotional support untouched."},
  "narrow:na":{t:"Narrowing device not applicable",
    d:"The record is a recommendation, a committee report or another instrument that imposes no obligations, so there is no definition for a narrowing device to narrow."},
  "narrow:unverified":{t:"Narrowing device unverified",
    d:"The text has not been read closely enough to code the narrowing device. A coding gap rather than a finding — enrolled or bill text for these rows is the most useful contribution to the dataset."},
  "narrow:none":{t:"No narrowing device",
    d:"Nothing pulls anything back out of the definition. Rare, and analytically important: Illinois SB 3262 goes further and defines its object “irrespective of how the system is marketed or labeled”, foreclosing the classification move companies already make."},

  /* ---- provenance of quoted wording ---- */
  "prov:quote":{t:"Verbatim text",
    d:"The words of the legislation itself, quoted from the bill or enrolled text. Safe to quote in published work, though the citation should still be checked against the current version."},
  "prov:summary":{t:"Close paraphrase",
    d:"A close paraphrase drawn from secondary analysis or from this tracker's own coding notes, not the words of the statute. Verify against the enrolled text before quoting it in published work."},
  "prov:none":{t:"Not yet transcribed",
    d:"This legislation carries the mechanism, but no sourced wording for it is held yet. Nothing is invented to fill the gap — the row links to the source instead. Transcribing these from enrolled text is the highest-value contribution to the dataset."},

  /* ---- terms of art used in the written analysis ---- */
  assistants:{t:"General-purpose assistant",
    d:"A conversational system built for open-ended use — ChatGPT, Claude, Gemini and their kin — as opposed to a product built and sold as a companion. The distinction matters because the survey evidence puts most relational use by young people on the general assistants, not on the labelled companion apps."},
  functional:{t:"Functional definition",
    d:"Defining the regulated object by what the system does — simulating interaction, sustaining a relationship, retaining memory, responding to emotion — rather than by what kind of product it is. Most of this corpus is functional in its tests even where the vocabulary remains categorical."},
  categorical:{t:"Categorical definition",
    d:"Defining the regulated object as a kind of product: a companion app, a companion chatbot. Survives in this corpus mainly in the vocabulary and in the exclusions rather than in the operative tests."},
  pra:{t:"Private right of action",
    d:"A statutory route for the harmed individual to sue, rather than leaving enforcement to a regulator. The most consequential enforcement variable in the corpus: New York's enacted Article 47 is attorney-general only while its substantively identical Assembly twin lets individuals sue, and the Youth AI Privacy Act's private right of action was stripped in the 5 August 2026 markup."},
  retention:{t:"Retention ceiling",
    d:"A hard limit on how long a system may keep what a user told it. NOTHING IN THIS CORPUS HAS ONE — not in force, not moving, not proposed. The two nearest misses: Illinois SB 3262 makes persistent memory the rebuttable trigger for its regime, which constrains nothing about retention, and the Youth AI Privacy Act bars personalisation on data outside the current session and an FTC-set recency window, which governs what may be processed rather than how long it may be kept."}
};
