/* Chart data. Every number below is traceable to a source file (see _internal/INTERNAL_CHECKLIST.md). */
window.DATA = {
  alibaba: {
    totalRows: 29971, totalUsers: 29944, labelledRows: 955, labelledUsers: 952,
    // source: model_development.ipynb (value_counts of age_group on labelled rows) and 关键趋势报告.docx
    ageDist: [
      {l:"0–1 yr", n:23, flag:"very small n"}, {l:"1–3 yr", n:390}, {l:"3–6 yr", n:414},
      {l:"6–12 yr", n:124}, {l:"12–18 yr", n:4, flag:"very small n"}
    ],
    // source: notebook outputs, user-level stratified 80/20 split (random_state=42); test n = 191 users
    classes: ["0–3 yr","3–6 yr","6–18 yr"], support: [82,83,26],
    models: [
      {name:"Dummy (most frequent)", acc:0.429, f1:0.200, recall:[1.00,0.00,0.00]},
      {name:"Logistic regression",   acc:0.618, f1:0.466, recall:[0.72,0.70,0.04]},
      {name:"Logistic, class-weighted", acc:0.508, f1:0.470, recall:[0.67,0.36,0.46]},
      {name:"Random forest",         acc:0.524, f1:0.433, recall:[0.76,0.41,0.15]}
    ],
    hit: { k:[5,10,20,30], age:[0.173,0.246,0.414,0.476], base:[0.188,0.257,0.361,0.445], nTest:191 }
  },
  calm: { continuedLonger: 67.7, surveyN: 31 }
};
window.DATA.captions={"barriers-com-b": [[0.41, 8.33, "We did a COM-B analysis to identify the key barriers to our target behaviour, and we highlighted several important things."], [8.91, 10.29, "First, the trust issue."], [10.67, 13.89, "People might have the concern: will my money in the card be taken away?"], [14.33, 18.54, "And also, they are so used to informal group savings based on trust."], [19.04, 23.07, "Additionally, lack of benefit visibility is reinforced by the fact that"], [23.43, 26.48, "peers in their community also do not use formal savings."], [26.98, 29.3, "This could make the advantage less apparent or believable."]], "apease-assessment": [[0.11, 4.52, "We assessed our intervention based on the APEASE criteria. For affordability,"], [4.88, 7.71, "we found the estimated cost for each group over six months"], [8.09, 11.14, "will be around 100 US dollars, which is quite affordable."], [11.83, 13.92, "However, for effectiveness and side effects,"], [14.5, 17.31, "they need to be carefully tracked during implementation."], [17.8, 21.63, "Also, for equity, it is limited by phone ownership and coverage."]]};
