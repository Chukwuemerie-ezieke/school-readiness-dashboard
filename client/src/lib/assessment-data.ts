// Assessment framework combining NIST CSF 2.0 and ISO 27001 controls
// tailored for school cybersecurity and digital transformation readiness

export type MaturityLevel = 0 | 1 | 2 | 3 | 4;

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  0: "Not Started",
  1: "Initial",
  2: "Developing",
  3: "Established",
  4: "Optimized",
};

export const MATURITY_COLORS: Record<MaturityLevel, string> = {
  0: "hsl(0 72% 51%)",
  1: "hsl(35 80% 50%)",
  2: "hsl(45 90% 48%)",
  3: "hsl(150 55% 35%)",
  4: "hsl(183 92% 24%)",
};

export interface Control {
  id: string;
  title: string;
  description: string;
  framework: "NIST CSF" | "ISO 27001" | "Both";
  reference: string;
}

export interface Domain {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  controls: Control[];
}

export interface AssessmentResult {
  schoolName: string;
  assessorName: string;
  assessmentDate: string;
  scores: Record<string, MaturityLevel>; // control id -> score
}

export const DOMAINS: Domain[] = [
  {
    id: "govern",
    name: "Governance & Policy",
    icon: "Scale",
    description: "Organizational context, risk strategy, roles, policies, and oversight (NIST CSF: Govern / ISO 27001: A.5)",
    controls: [
      { id: "gov-1", title: "Cybersecurity Policy", description: "A formal cybersecurity policy exists, is approved by leadership, and communicated to all staff", framework: "Both", reference: "NIST GV.PO / ISO A.5.1" },
      { id: "gov-2", title: "Risk Management Strategy", description: "The school has a documented approach to identifying, assessing, and treating cyber risks", framework: "NIST CSF", reference: "NIST GV.RM" },
      { id: "gov-3", title: "Roles & Responsibilities", description: "Cybersecurity roles (e.g. DPO, IT lead) are defined, assigned, and understood", framework: "Both", reference: "NIST GV.RR / ISO A.5.2" },
      { id: "gov-4", title: "Acceptable Use Policy", description: "Clear rules for staff and students on acceptable use of school IT resources", framework: "ISO 27001", reference: "ISO A.5.10" },
      { id: "gov-5", title: "Compliance & Legal", description: "The school tracks relevant data protection laws (e.g. NDPR, Child Rights Act)", framework: "Both", reference: "NIST GV.OC / ISO A.5.31" },
    ],
  },
  {
    id: "identify",
    name: "Asset & Risk Identification",
    icon: "Search",
    description: "Understanding what needs protection: devices, data, users, and associated risks (NIST CSF: Identify / ISO 27001: A.5.9, A.8)",
    controls: [
      { id: "id-1", title: "Asset Inventory", description: "All hardware, software, and data assets are catalogued and classified", framework: "Both", reference: "NIST ID.AM / ISO A.5.9" },
      { id: "id-2", title: "Risk Assessment", description: "Regular risk assessments identify threats and vulnerabilities specific to the school", framework: "Both", reference: "NIST ID.RA / ISO A.8.8" },
      { id: "id-3", title: "Data Classification", description: "Student records, staff PII, and academic data are classified by sensitivity", framework: "ISO 27001", reference: "ISO A.5.12" },
      { id: "id-4", title: "Network Mapping", description: "The school's network topology, internet connections, and Wi-Fi are documented", framework: "NIST CSF", reference: "NIST ID.AM-3" },
    ],
  },
  {
    id: "protect",
    name: "Protective Controls",
    icon: "Shield",
    description: "Safeguards to prevent or limit impact of cyber events (NIST CSF: Protect / ISO 27001: A.6-A.8)",
    controls: [
      { id: "pr-1", title: "Access Control", description: "Role-based access restricts who can view or edit sensitive systems and data", framework: "Both", reference: "NIST PR.AA / ISO A.5.15" },
      { id: "pr-2", title: "Authentication", description: "Strong passwords and/or MFA are required for staff and admin accounts", framework: "Both", reference: "NIST PR.AA / ISO A.8.5" },
      { id: "pr-3", title: "Content Filtering", description: "Web filtering blocks harmful or inappropriate content for students", framework: "NIST CSF", reference: "NIST PR.DS" },
      { id: "pr-4", title: "Antivirus & Endpoint Protection", description: "All devices have up-to-date antivirus/EDR solutions", framework: "Both", reference: "NIST PR.DS / ISO A.8.7" },
      { id: "pr-5", title: "Patch Management", description: "Operating systems and software are regularly updated and patched", framework: "Both", reference: "NIST PR.PS / ISO A.8.8" },
      { id: "pr-6", title: "Backup & Recovery", description: "Critical data is backed up regularly with tested restoration procedures", framework: "Both", reference: "NIST PR.DS / ISO A.8.13" },
    ],
  },
  {
    id: "detect",
    name: "Detection & Monitoring",
    icon: "Eye",
    description: "Capabilities to discover cybersecurity events in a timely manner (NIST CSF: Detect / ISO 27001: A.8.15-A.8.16)",
    controls: [
      { id: "de-1", title: "Security Monitoring", description: "Logs from critical systems are reviewed for suspicious activity", framework: "Both", reference: "NIST DE.CM / ISO A.8.15" },
      { id: "de-2", title: "Anomaly Detection", description: "Unusual login patterns, data transfers, or network activity are flagged", framework: "NIST CSF", reference: "NIST DE.AE" },
      { id: "de-3", title: "Physical Security Monitoring", description: "CCTV and/or access logs protect server rooms and IT equipment", framework: "ISO 27001", reference: "ISO A.7.2" },
    ],
  },
  {
    id: "respond",
    name: "Incident Response",
    icon: "Siren",
    description: "Actions taken when a cybersecurity incident is detected (NIST CSF: Respond / ISO 27001: A.5.24-A.5.28)",
    controls: [
      { id: "rs-1", title: "Incident Response Plan", description: "A documented incident response plan with clear escalation procedures", framework: "Both", reference: "NIST RS.MA / ISO A.5.24" },
      { id: "rs-2", title: "Incident Reporting", description: "Staff know how and when to report security incidents", framework: "Both", reference: "NIST RS.CO / ISO A.6.8" },
      { id: "rs-3", title: "Incident Analysis", description: "Incidents are analyzed to understand root cause and impact", framework: "NIST CSF", reference: "NIST RS.AN" },
    ],
  },
  {
    id: "recover",
    name: "Recovery Planning",
    icon: "RefreshCcw",
    description: "Plans for restoring capabilities after an incident (NIST CSF: Recover / ISO 27001: A.5.29-A.5.30)",
    controls: [
      { id: "rc-1", title: "Recovery Plan", description: "A documented plan for restoring systems and data after an incident", framework: "Both", reference: "NIST RC.RP / ISO A.5.29" },
      { id: "rc-2", title: "Lessons Learned", description: "Post-incident reviews improve future response and recovery", framework: "NIST CSF", reference: "NIST RC.RP" },
      { id: "rc-3", title: "Communication Plan", description: "Communication protocols for notifying parents, authorities, and stakeholders", framework: "Both", reference: "NIST RC.CO / ISO A.5.30" },
    ],
  },
  {
    id: "teacher-training",
    name: "Teacher & Staff Training",
    icon: "GraduationCap",
    description: "Human capacity building for cybersecurity awareness and digital skills (ISO 27001: A.6.3 / NIST PR.AT)",
    controls: [
      { id: "tt-1", title: "Security Awareness Training", description: "All staff complete regular cybersecurity awareness training (phishing, passwords, social engineering)", framework: "Both", reference: "NIST PR.AT / ISO A.6.3" },
      { id: "tt-2", title: "Digital Literacy Skills", description: "Teachers are trained in safe use of digital tools for instruction", framework: "Both", reference: "NIST PR.AT-2" },
      { id: "tt-3", title: "Role-Specific Training", description: "IT staff and administrators receive specialized cybersecurity training", framework: "ISO 27001", reference: "ISO A.6.3" },
      { id: "tt-4", title: "Student Cyber Hygiene", description: "Students receive age-appropriate lessons on online safety and cybersecurity", framework: "NIST CSF", reference: "NIST PR.AT" },
      { id: "tt-5", title: "Training Records", description: "Training completion is tracked and documented for audit purposes", framework: "ISO 27001", reference: "ISO A.6.3" },
    ],
  },
  {
    id: "data-protection",
    name: "Data Protection",
    icon: "Lock",
    description: "Protecting student records, PII, and sensitive educational data (ISO 27001: A.5.33-A.5.34 / NIST PR.DS)",
    controls: [
      { id: "dp-1", title: "Student Data Privacy", description: "Student PII is collected only when necessary and stored with appropriate safeguards", framework: "Both", reference: "NIST PR.DS / ISO A.5.34" },
      { id: "dp-2", title: "Consent Management", description: "Parental/guardian consent is obtained before collecting student data", framework: "ISO 27001", reference: "ISO A.5.33" },
      { id: "dp-3", title: "Data Encryption", description: "Sensitive data is encrypted at rest and in transit", framework: "Both", reference: "NIST PR.DS / ISO A.8.24" },
      { id: "dp-4", title: "Data Retention Policy", description: "Clear policies define how long data is kept and when it is securely disposed", framework: "Both", reference: "NIST PR.DS / ISO A.5.33" },
      { id: "dp-5", title: "Third-Party Data Sharing", description: "Agreements govern how student data is shared with EdTech vendors", framework: "ISO 27001", reference: "ISO A.5.19" },
    ],
  },
  {
    id: "device-management",
    name: "Device Management",
    icon: "Monitor",
    description: "Managing school-owned and BYOD devices for security and availability (ISO 27001: A.8 / NIST PR.DS)",
    controls: [
      { id: "dm-1", title: "Device Inventory & Tracking", description: "All school devices are tracked with serial numbers, users, and location", framework: "Both", reference: "NIST ID.AM / ISO A.5.9" },
      { id: "dm-2", title: "Mobile Device Management", description: "MDM or equivalent controls manage school-owned tablets and laptops", framework: "Both", reference: "NIST PR.DS / ISO A.8.1" },
      { id: "dm-3", title: "BYOD Policy", description: "Clear policy for students/staff using personal devices on the school network", framework: "ISO 27001", reference: "ISO A.8.1" },
      { id: "dm-4", title: "Software Standardization", description: "Approved software list; unauthorized installs are restricted", framework: "Both", reference: "NIST PR.DS / ISO A.8.19" },
      { id: "dm-5", title: "Device Disposal", description: "Secure wiping/destruction of data when devices are retired", framework: "ISO 27001", reference: "ISO A.7.14" },
    ],
  },
  {
    id: "ai-policy",
    name: "AI-Use Policy",
    icon: "Bot",
    description: "Governance of AI tools in teaching, learning, and administration (NIST AI RMF alignment / ISO emerging guidance)",
    controls: [
      { id: "ai-1", title: "AI Acceptable Use Policy", description: "A policy defines which AI tools are approved and how they may be used by staff and students", framework: "Both", reference: "NIST GV.PO / ISO A.5.10" },
      { id: "ai-2", title: "AI Ethics & Bias Awareness", description: "Staff are trained on AI bias, fairness, and ethical considerations in education", framework: "NIST CSF", reference: "NIST AI RMF" },
      { id: "ai-3", title: "AI Data Privacy", description: "Student data is not input into AI tools without proper safeguards and consent", framework: "Both", reference: "ISO A.5.34 / NIST PR.DS" },
      { id: "ai-4", title: "AI Tool Vetting", description: "New AI tools are reviewed for security, privacy, and pedagogical value before adoption", framework: "ISO 27001", reference: "ISO A.5.23" },
      { id: "ai-5", title: "AI Output Verification", description: "Processes ensure AI-generated content is reviewed for accuracy before use", framework: "NIST CSF", reference: "NIST AI RMF" },
    ],
  },
];

export function getAllControls(): Control[] {
  return DOMAINS.flatMap((d) => d.controls);
}

export function getDomainScore(domainId: string, scores: Record<string, MaturityLevel>): number {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) return 0;
  const domainScores = domain.controls.map((c) => scores[c.id] ?? 0);
  if (domainScores.length === 0) return 0;
  return domainScores.reduce((sum, s) => sum + s, 0) / domainScores.length;
}

export function getOverallScore(scores: Record<string, MaturityLevel>): number {
  const domainAvgs = DOMAINS.map((d) => getDomainScore(d.id, scores));
  if (domainAvgs.length === 0) return 0;
  return domainAvgs.reduce((sum, s) => sum + s, 0) / domainAvgs.length;
}

export function getMaturityLabel(score: number): string {
  if (score < 0.5) return "Not Started";
  if (score < 1.5) return "Initial";
  if (score < 2.5) return "Developing";
  if (score < 3.5) return "Established";
  return "Optimized";
}

export function getMaturityColor(score: number): string {
  if (score < 0.5) return "hsl(0 72% 51%)";
  if (score < 1.5) return "hsl(35 80% 50%)";
  if (score < 2.5) return "hsl(45 90% 48%)";
  if (score < 3.5) return "hsl(150 55% 35%)";
  return "hsl(183 92% 24%)";
}

export function getScorePercentage(score: number): number {
  return Math.round((score / 4) * 100);
}

export function generateRecommendations(scores: Record<string, MaturityLevel>): { domain: string; priority: "Critical" | "High" | "Medium" | "Low"; recommendation: string }[] {
  const recs: { domain: string; priority: "Critical" | "High" | "Medium" | "Low"; recommendation: string }[] = [];

  for (const domain of DOMAINS) {
    const avg = getDomainScore(domain.id, scores);
    const weakControls = domain.controls.filter((c) => (scores[c.id] ?? 0) <= 1);

    if (avg < 1) {
      recs.push({
        domain: domain.name,
        priority: "Critical",
        recommendation: `Urgent action needed: ${domain.name} has no meaningful controls in place. Start with ${weakControls[0]?.title ?? "basic policies"}.`,
      });
    } else if (avg < 2) {
      for (const c of weakControls.slice(0, 2)) {
        recs.push({
          domain: domain.name,
          priority: "High",
          recommendation: `Strengthen "${c.title}": ${c.description}`,
        });
      }
    } else if (avg < 3) {
      for (const c of weakControls.slice(0, 1)) {
        recs.push({
          domain: domain.name,
          priority: "Medium",
          recommendation: `Improve "${c.title}" to reach Established maturity level`,
        });
      }
    }
  }

  return recs.sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });
}
