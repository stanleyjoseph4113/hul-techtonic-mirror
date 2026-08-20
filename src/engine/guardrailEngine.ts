import type { CandidateStrategy, GuardrailFlag } from './types';
import blocklistData from '../data/blocklist.json';
import culturalFlagsData from '../data/cultural_flags.json';
import partnershipsData from '../data/partnerships.json';

interface BlocklistData {
  competitors: { term: string; brand: string; severity: 'low' | 'medium' | 'high'; rule: string }[];
  unsubstantiatedClaims: { pattern: string; severity: 'low' | 'medium' | 'high'; rule: string }[];
  sensitiveKeywords: { term: string; severity: 'low' | 'medium' | 'high'; rule: string }[];
}

interface CulturalRule {
  id: string;
  market: string;
  triggerCondition: string;
  keywords: string[];
  severity: 'low' | 'medium' | 'high';
  title: string;
  explanation: string;
  recommendation: string;
}

interface PartnershipRule {
  brandId: string;
  partner: string;
  restrictedKeywords: string[];
  rule: string;
  severity: 'low' | 'medium' | 'high';
}

const blocklist = blocklistData as BlocklistData;
const culturalRules = culturalFlagsData as CulturalRule[];
const partnerships = partnershipsData as PartnershipRule[];

/**
 * Evaluates candidate strategy against Unilever brand safety rules,
 * regional cultural compliance matrices, and active brand IP partnerships.
 */
export function runGuardrailScreening(strategy: CandidateStrategy): GuardrailFlag[] {
  const flags: GuardrailFlag[] = [];
  const textToScan = `${strategy.title} ${strategy.creativeAngle}`.toLowerCase();

  // 1. BRAND SAFETY: Competitor Brand Name Check
  blocklist.competitors.forEach((comp, idx) => {
    const regex = new RegExp(`\\b${comp.term}\\b`, 'i');
    if (regex.test(textToScan)) {
      flags.push({
        id: `guard-comp-${idx}`,
        type: 'brand_safety',
        severity: comp.severity,
        title: `Competitor Reference: "${comp.term.toUpperCase()}"`,
        matchedTrigger: comp.term,
        explanation: `${comp.rule} Found reference to competitor in creative brief.`,
        remediationAdvice: `Remove or de-brand references to "${comp.term}". If running a comparative study, attach independent certified lab verification.`
      });
    }
  });

  // 2. BRAND SAFETY: Unsubstantiated / Medical / Green Claims Check
  blocklist.unsubstantiatedClaims.forEach((claim, idx) => {
    const regex = new RegExp(claim.pattern, 'i');
    const match = textToScan.match(regex);
    if (match) {
      flags.push({
        id: `guard-claim-${idx}`,
        type: 'brand_safety',
        severity: claim.severity,
        title: `Unsubstantiated Claim Alert`,
        matchedTrigger: match[0],
        explanation: claim.rule,
        remediationAdvice: `Replace absolute superlative claim "${match[0]}" with qualified benefit metrics.`
      });
    }
  });

  // 3. BRAND SAFETY: Sensitive / Political Keywords Check
  blocklist.sensitiveKeywords.forEach((sens, idx) => {
    const regex = new RegExp(sens.term, 'i');
    const match = textToScan.match(regex);
    if (match) {
      flags.push({
        id: `guard-sens-${idx}`,
        type: 'brand_safety',
        severity: sens.severity,
        title: `Sensitive Subject Matter Detected`,
        matchedTrigger: match[0],
        explanation: sens.rule,
        remediationAdvice: `Review content with Unilever Legal and Corporate Communications before public rollout.`
      });
    }
  });

  // 4. CULTURAL & REGIONAL SENSITIVITY CHECK
  strategy.markets.forEach(market => {
    culturalRules.forEach(cRule => {
      if (cRule.market === market || cRule.market === 'Global') {
        const matchedKeyword = cRule.keywords.find(kw => textToScan.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          flags.push({
            id: `guard-cult-${cRule.id}-${market}`,
            type: 'cultural_sensitivity',
            severity: cRule.severity,
            title: `${cRule.title} (${market})`,
            matchedTrigger: matchedKeyword,
            explanation: cRule.explanation,
            remediationAdvice: cRule.recommendation
          });
        }
      }
    });
  });

  // 5. ACTIVE PARTNERSHIP & EXCLUSIVITY CONSTRAINTS
  const brandPartnerships = partnerships.filter(p => p.brandId === strategy.brandId);
  brandPartnerships.forEach((partnerRule, idx) => {
    const matchedPartnerKw = partnerRule.restrictedKeywords.find(kw => 
      textToScan.includes(kw.toLowerCase())
    );
    if (matchedPartnerKw) {
      flags.push({
        id: `guard-partner-${strategy.brandId}-${idx}`,
        type: 'legal_ip',
        severity: partnerRule.severity,
        title: `Brand Charter / IP Conflict: ${partnerRule.partner}`,
        matchedTrigger: matchedPartnerKw,
        explanation: partnerRule.rule,
        remediationAdvice: `Ensure campaign aligns with Unilever's ${partnerRule.partner} commitments before execution.`
      });
    }
  });

  return flags;
}
