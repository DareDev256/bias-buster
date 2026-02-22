// ─── Bias Buster Scenarios ───
// 5 starter scenarios across Hiring & Recruitment + Content Moderation

export interface Decision {
  id: string;
  label: string;
  immediateResult: string;
  longTermResult: string;
  impactScore: number;
  lesson: string;
}

export interface BiasScenario {
  id: string;
  category: "hiring" | "content-moderation";
  prompt: string;
  decisions: Decision[];
}

export const scenarios: BiasScenario[] = [
  {
    id: "hr-001",
    category: "hiring",
    prompt: "Your startup is growing fast. HR wants to deploy an AI to screen 500 resumes. It was trained on your last 3 years of successful hires.",
    decisions: [
      { id: "deploy", label: "Deploy it — speed matters", immediateResult: "AI screens 500 resumes in 2 minutes. 50 candidates advance.", longTermResult: "All 50 candidates look identical. Zero diversity. A rejected candidate files a discrimination complaint.", impactScore: 2, lesson: "AI trained on historical data inherits historical biases. Your past hiring patterns become its future." },
      { id: "audit", label: "Audit the training data first", immediateResult: "You spend 2 weeks analyzing. You discover 87% of 'successful hires' came from 3 universities.", longTermResult: "You retrain with balanced criteria. Hiring is slower but produces a diverse, effective team.", impactScore: 10, lesson: "Auditing catches bias before it causes harm. The 2-week delay saved months of damage control." },
      { id: "hybrid", label: "AI screens, humans review rejections", immediateResult: "Humans catch some strong rejected candidates. But reviewing 400 rejections is overwhelming.", longTermResult: "Better than full automation, but subtle bias patterns still pass through unchecked.", impactScore: 5, lesson: "Human-in-the-loop helps but doesn't fix root cause. If the AI's criteria are biased, reviewers may share those biases." },
    ],
  },
  {
    id: "hr-002",
    category: "hiring",
    prompt: "Your video interview AI scores candidates on 'confidence' and 'communication skills' by analyzing facial expressions and speech patterns.",
    decisions: [
      { id: "keep", label: "Trust the AI's assessments", immediateResult: "Interview throughput triples. Hiring managers love the efficiency reports.", longTermResult: "Candidates with speech impediments, cultural differences in eye contact, and neurodivergent traits are systematically ranked lower.", impactScore: 2, lesson: "Facial expression analysis encodes cultural norms as universal truth. Confidence looks different across cultures." },
      { id: "remove-video", label: "Switch to audio-only analysis", immediateResult: "Removes facial bias. But speech pattern analysis still disadvantages non-native speakers.", longTermResult: "Marginal improvement. Accent bias replaces facial bias. The fundamental approach is flawed.", impactScore: 5, lesson: "Removing one biased signal doesn't fix a biased methodology. The question is whether AI should judge 'soft skills' at all." },
    ],
  },
  {
    id: "hr-003",
    category: "hiring",
    prompt: "Your AI flagged that women who negotiate salary in their applications are rated lower by the model. Engineering wants to patch the specific feature.",
    decisions: [
      { id: "patch", label: "Remove the salary negotiation signal", immediateResult: "Quick fix deployed. The specific gender gap on that feature closes.", longTermResult: "The model finds proxy variables — years of gap in employment, part-time work history — that correlate with gender. The bias resurfaces.", impactScore: 5, lesson: "Bias is hydra-headed. Removing one feature doesn't remove the pattern. You need to audit the entire pipeline, not play whack-a-mole." },
      { id: "redesign", label: "Redesign the evaluation criteria entirely", immediateResult: "3-month project. Team pushes back on the timeline. Hiring slows significantly.", longTermResult: "New criteria focus on work samples and structured assessments. Gender gap disappears. Quality of hires improves.", impactScore: 10, lesson: "Systemic problems require systemic solutions. The short-term cost of redesign prevents long-term discrimination lawsuits." },
    ],
  },
  {
    id: "cm-001",
    category: "content-moderation",
    prompt: "Your platform's AI moderator flags 3× more posts from Black users as 'toxic.' The model was trained on moderator decisions from the past 5 years.",
    decisions: [
      { id: "retrain", label: "Retrain on more diverse moderator panels", immediateResult: "6-week retraining cycle. Disparities reduce to 1.5× but don't disappear.", longTermResult: "Improvement, but African American Vernacular English (AAVE) is still flagged at higher rates. Cultural context remains a blind spot.", impactScore: 5, lesson: "Diverse training data helps but doesn't eliminate structural bias. Language models struggle with dialect and cultural context." },
      { id: "threshold", label: "Adjust confidence thresholds by demographic", immediateResult: "Reduces false positives for Black users. But now some genuinely harmful content slips through.", longTermResult: "Critics call it reverse discrimination. Users in the protected group feel patronized. The approach is legally questionable.", impactScore: 2, lesson: "Demographic-based thresholds create new inequities. The solution isn't to treat groups differently — it's to build models that understand context." },
      { id: "context", label: "Add contextual understanding layers", immediateResult: "Expensive. Requires linguists, cultural consultants, and 4 months of development.", longTermResult: "The model learns to distinguish AAVE, sarcasm, and cultural references. False positive rates equalize across demographics.", impactScore: 10, lesson: "Context is everything. Investing in cultural understanding isn't a luxury — it's a requirement for fair moderation at scale." },
    ],
  },
  {
    id: "cm-002",
    category: "content-moderation",
    prompt: "A viral post criticizing your government client is flagged as 'misinformation' by the AI. The post contains verified facts presented with strong editorial opinion.",
    decisions: [
      { id: "remove", label: "Remove it — the AI flagged it", immediateResult: "Post removed. Author screenshots the removal notice. It goes viral on competing platforms.", longTermResult: "Press coverage frames your platform as censoring legitimate criticism. Users migrate. Government contract becomes a liability.", impactScore: 2, lesson: "Automated moderation can't distinguish opinion from misinformation. Removing factual criticism erodes trust faster than any 'misinformation' could." },
      { id: "label", label: "Add a context label, keep it up", immediateResult: "Post stays with a 'Disputed — contains editorial opinion' label. Author is annoyed but the content remains.", longTermResult: "Sets a precedent for transparency. Users learn to distinguish between labels. Trust in the platform increases.", impactScore: 10, lesson: "Labeling respects both free expression and user awareness. It treats users as adults capable of evaluating information." },
    ],
  },
];
