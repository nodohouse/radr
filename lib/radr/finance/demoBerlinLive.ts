/**
 * Berlin Mitte dinner - LIVE financial operating fixture.
 * Coherent with live shift net sales (~€6.8k mid-service) and contribution math.
 *
 * All amounts: major EUR units. Primary UI must show 2 decimal places.
 */

import type {
  FinanceAttention,
  FinancialOperatingState,
  FinancialSource,
  MoneyFlowColumn,
  WaterfallLine,
} from "./types";
import { BERLIN_BEVERAGE_SHARE_PCT, splitFnBNetSales } from "@/lib/radr/fnb";

const ORG = "org_northstar";
const LOC = "loc_ber";

const src = (
  key: string,
  label: string,
  status: FinancialSource["status"],
  lastSyncLabel: string,
): FinancialSource => ({ key, label, status, lastSyncLabel });

/**
 * Mid-dinner snapshot aligned with LiveShiftPulse illustrative stream.
 */
export function demoBerlinLiveFinance(
  netSalesOverride?: number,
): FinancialOperatingState {
  const grossSales = 7059;
  const discounts = 136;
  const refunds = 62;
  const comps = 74;
  const netSales =
    netSalesOverride != null
      ? Math.round(netSalesOverride * 100) / 100
      : Math.round((grossSales - discounts - refunds) * 100) / 100;

  const cogs = 1830;
  const fnb = splitFnBNetSales(netSales, BERLIN_BEVERAGE_SHARE_PCT);
  const directLabor = 1420;
  const channelFees = 176;
  const paymentFees = 82;
  const compsRefundsEconomic = 52;

  const liveContribution =
    Math.round(
      (netSales -
        cogs -
        directLabor -
        channelFees -
        paymentFees -
        compsRefundsEconomic) *
        100,
    ) / 100;

  const contributionMarginPct =
    Math.round((liveContribution / netSales) * 1000) / 10;
  const expectedContributionMarginPct = 49.3;
  const marginVariancePts =
    Math.round((contributionMarginPct - expectedContributionMarginPct) * 10) /
    10;

  const laborPlan = 1234;
  const laborProjectedClose = 1612;
  const deposits = 380;
  const deliveryGross = 824;
  const verifiedToday = 2184;

  const posSrc = src("pos", "POS", "complete", "Live");
  const laborSrc = src("labor", "Scheduling / clock", "estimated", "2 min ago");
  const recipeSrc = src("recipes", "Recipe cost", "estimated", "Tonight mix");
  const deliverySrc = src("delivery", "Delivery platforms", "partial", "5 min delayed");
  const paySrc = src("payments", "Payment processor", "complete", "Live");

  const waterfall: WaterfallLine[] = [
    {
      id: "net_sales",
      kind: "start",
      label: "Net sales",
      amount: netSales,
      definitionId: "netSales",
      confidence: "complete",
      why: [
        "Gross sales less discounts and refunds from POS",
        "Deposits held separately until earned",
      ],
      sources: [posSrc],
    },
    {
      id: "cogs",
      kind: "less",
      label: "COGS",
      amount: cogs,
      variance: {
        actual: cogs,
        plan: Math.round(netSales * 0.258),
        variance: Math.round(cogs - netSales * 0.258),
        unit: "EUR",
        why: [
          "Bluefin mix above plan",
          "Beef cost increase on last invoice",
          "Waste and comps on signature dishes",
        ],
      },
      definitionId: "cogs",
      confidence: "estimated",
      why: [
        "Estimated from tonight's menu mix × recipe cost",
        "Not a flat historical percentage",
      ],
      sources: [recipeSrc, posSrc],
      evidenceHref: "/app/checks",
    },
    {
      id: "labor",
      kind: "less",
      label: "Direct labor",
      amount: directLabor,
      variance: {
        actual: directLabor,
        plan: laborPlan,
        variance: directLabor - laborPlan,
        unit: "EUR",
        why: [
          "+1 FOH (Front of House) for peak",
          "Service extended ~30 min",
          "Overtime exposure on close shift",
        ],
      },
      definitionId: "laborCost",
      confidence: "estimated",
      why: [
        "Clocked hours × loaded wage (base + premiums + burden)",
        "Individual pay hidden - aggregates only",
      ],
      sources: [laborSrc],
      evidenceHref: "/app/labor",
    },
    {
      id: "channel",
      kind: "less",
      label: "Delivery / channel fees",
      amount: channelFees,
      definitionId: "channelFees",
      confidence: "partial",
      why: [
        "Platform commissions on delivery gross",
        "Delivery feed 5 minutes delayed",
      ],
      sources: [deliverySrc],
      evidenceHref: "/app/checks",
    },
    {
      id: "payment_fees",
      kind: "less",
      label: "Payment fees",
      amount: paymentFees,
      definitionId: "paymentFees",
      confidence: "complete",
      why: ["Card and wallet processor fees on settled volume"],
      sources: [paySrc],
    },
    {
      id: "comps_econ",
      kind: "less",
      label: "Comps / refunds economic impact",
      amount: compsRefundsEconomic,
      definitionId: "liveContribution",
      confidence: "estimated",
      why: [
        "Contribution cost of comps and refunds, not full retail",
        "Guest recovery comps elevated vs historical norm",
      ],
      sources: [posSrc],
    },
    {
      id: "live_contribution",
      kind: "result",
      label: "Live contribution",
      amount: liveContribution,
      secondary: `${contributionMarginPct.toFixed(1).replace(".", ",")}% margin`,
      definitionId: "liveContribution",
      confidence: "estimated",
      why: [
        "Net sales less direct operating costs RADR can see tonight",
        "Not accounting profit - overhead and accruals excluded",
      ],
      sources: [posSrc, laborSrc, recipeSrc, deliverySrc, paySrc],
    },
    {
      id: "margin",
      kind: "margin",
      label: "Contribution margin",
      amount: contributionMarginPct,
      secondary: `Expected ${expectedContributionMarginPct.toFixed(1).replace(".", ",")}%`,
      variance: {
        actual: contributionMarginPct,
        plan: expectedContributionMarginPct,
        variance: marginVariancePts,
        unit: "pts",
        why: [
          "Labor over plan (−pts)",
          "COGS mix slightly heavy (−pts)",
          "Average spend partially offsets",
        ],
      },
      definitionId: "contributionMargin",
      confidence: "estimated",
      why: ["Live contribution ÷ net sales"],
      sources: [posSrc, laborSrc, recipeSrc],
    },
  ];

  const moneyFlow: MoneyFlowColumn[] = [
    {
      kind: "in",
      title: "Money in",
      totalLabel: "Gross in",
      total: grossSales + deposits,
      items: [
        {
          id: "gross",
          label: "Gross sales",
          amount: grossSales,
          definitionId: "netSales",
          confidence: "complete",
          why: ["POS settled and open-check gross before discounts"],
        },
        {
          id: "deposits",
          label: "Deposits / prepayments",
          amount: deposits,
          definitionId: "netSales",
          confidence: "complete",
          why: ["Held until service earned - not in net sales yet"],
        },
        {
          id: "delivery",
          label: "Delivery",
          amount: deliveryGross,
          definitionId: "channelFees",
          confidence: "partial",
          why: ["Included in gross; fees appear in Money out"],
        },
      ],
    },
    {
      kind: "out",
      title: "Money out",
      totalLabel: "Direct out",
      total:
        discounts +
        refunds +
        comps +
        directLabor +
        cogs +
        channelFees +
        paymentFees,
      items: [
        {
          id: "discounts",
          label: "Discounts",
          amount: discounts,
          definitionId: "netSales",
          confidence: "complete",
          why: ["Tracked separately from comps and refunds"],
        },
        {
          id: "refunds",
          label: "Refunds",
          amount: refunds,
          definitionId: "netSales",
          confidence: "complete",
          why: ["Cash and card reversals tonight"],
        },
        {
          id: "comps",
          label: "Comps",
          amount: comps,
          definitionId: "netSales",
          confidence: "complete",
          why: ["Guest recovery - not automatically bad"],
        },
        {
          id: "labor_out",
          label: "Labor",
          amount: directLabor,
          definitionId: "laborCost",
          confidence: "estimated",
          why: [`€${directLabor - laborPlan} over scheduled plan`],
        },
        {
          id: "cogs_out",
          label: "COGS",
          amount: cogs,
          definitionId: "cogs",
          confidence: "estimated",
          why: ["Recipe × menu mix"],
        },
        {
          id: "channel_out",
          label: "Channel fees",
          amount: channelFees,
          definitionId: "channelFees",
          confidence: "partial",
          why: ["Platform commissions"],
        },
        {
          id: "pay_out",
          label: "Payment fees",
          amount: paymentFees,
          definitionId: "paymentFees",
          confidence: "complete",
          why: ["Processor fees on settled volume"],
        },
      ],
    },
    {
      kind: "left",
      title: "Money left",
      totalLabel: "Live contribution",
      total: liveContribution,
      items: [
        {
          id: "contribution",
          label: "Live contribution",
          amount: liveContribution,
          definitionId: "liveContribution",
          confidence: "estimated",
          why: [
            `${contributionMarginPct.toFixed(1)}% margin · ${marginVariancePts >= 0 ? "+" : ""}${marginVariancePts} pts vs plan`,
          ],
        },
      ],
    },
  ];

  const attentions: FinanceAttention[] = [
    {
      id: "attn_labor",
      label: "Labor",
      amount: directLabor - laborPlan,
      amountLabel: "over plan",
      why: "+1 FOH (Front of House), overtime, service extended ~30 min",
      href: "/app/labor",
      tone: "attention",
    },
    {
      id: "attn_supplier",
      label: "Suppliers",
      amount: 1184,
      amountLabel: "recoverable",
      why: "Invoice vs contract on Bluefin / salmon / produce - claim prepared",
      href: "/app/recover",
      tone: "watch",
    },
    {
      id: "attn_delivery",
      label: "Delivery",
      amount: 62,
      amountLabel: "settlement mismatch",
      why: "POS expected vs platform settlement - likely processor adjustment",
      href: "/app/checks",
      tone: "watch",
    },
  ];

  return {
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    serviceLabel: "Dinner",
    phaseLabel: "Live",
    businessDate: "2026-08-19",
    currency: "EUR",
    asOf: "2026-08-19T20:12:00+02:00",
    illustrative: true,
    grossSales,
    discounts,
    refunds,
    comps,
    netSales,
    cogs,
    fnb,
    directLabor,
    channelFees,
    paymentFees,
    compsRefundsEconomic,
    liveContribution,
    contributionMarginPct,
    expectedContributionMarginPct,
    marginVariancePts,
    laborPlan,
    laborProjectedClose,
    deposits,
    deliveryGross,
    verifiedToday,
    overallConfidence: "estimated",
    waterfall,
    moneyFlow,
    attentions,
  };
}
