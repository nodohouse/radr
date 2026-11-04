"""Build the private RADR lead report. Requires reportlab, fontTools, and Brotli."""
from pathlib import Path
from xml.sax.saxutils import escape
from xml.etree import ElementTree as ET
import re
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'private/reports/RADR-Hospitality-Decision-Playbook-2026.pdf'
W,H=595.28,841.89
import json
PALETTE=json.loads((ROOT/'lib/brand/palette.json').read_text())
INK=HexColor(PALETTE['ink']); MUTED=HexColor(PALETTE['muted']); BLUE=HexColor(PALETTE['sapphire']); GREEN=HexColor(PALETTE['ocean']); MINT=HexColor(PALETTE['jade']); LIGHT=HexColor(PALETTE['sapphire-soft'])
# Reuse the website's downloaded Manrope Latin face when available.
font_path=None
for css in (ROOT/'.next/static/css').rglob('*.css'):
 for block in re.findall(r'@font-face\s*\{[^}]+\}',css.read_text()):
  if "font-family: 'Manrope'" in block and 'U+0000-00FF' in block:
   match=re.search(r'src:\s*url\([^)]*/([^/)]+\.woff2)\)',block)
   if match and (ROOT/'.next/static/media'/match.group(1)).exists():font_path=ROOT/'.next/static/media'/match.group(1)
 if font_path:break
for name,weight,fallback in [('Body',450,'OpenSans-Regular.ttf'),('Bold',700,'OpenSans-Bold.ttf')]:
 if font_path:
  f=Font(font_path);f.flavor=None
  if 'fvar' in f:f=instantiateVariableFont(f,{'wght':weight},inplace=True)
  # Give static instances distinct identities so ReportLab embeds both weights.
  for record in list(f['name'].names):
   if record.nameID in (1,3,4,6):
    f['name'].setName('RadrManrope'+name,record.nameID,record.platformID,record.platEncID,record.langID)
   elif record.nameID==2:
    f['name'].setName('Bold' if weight==700 else 'Regular',2,record.platformID,record.platEncID,record.langID)
  target=Path('/tmp')/f'radr-report-{name}.ttf';f.save(target)
 else:target=Path('/usr/share/fonts/truetype/open-sans')/fallback
 pdfmetrics.registerFont(TTFont(name,str(target)))
styles={
 'body':ParagraphStyle('body',fontName='Body',fontSize=10.2,leading=16.4,textColor=MUTED,spaceAfter=12),
 'small':ParagraphStyle('small',fontName='Body',fontSize=8.3,leading=13,textColor=MUTED),
 'heading':ParagraphStyle('heading',fontName='Bold',fontSize=28,leading=33,textColor=INK),
 'sub':ParagraphStyle('sub',fontName='Bold',fontSize=13,leading=19,textColor=INK),
 'card':ParagraphStyle('card',fontName='Body',fontSize=10,leading=16,textColor=INK),
}
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('The Hospitality Decision Playbook');c.setAuthor('RADR Editorial');c.setSubject('A practical field guide for hospitality CFOs and operators');c.setKeywords('hospitality, decisions, evidence, contribution, operations, RADR')

def para(text,x,y,width,style='body'):
 p=Paragraph(text,styles[style]);_,height=p.wrap(width,H);p.drawOn(c,x,y-height);return y-height

def header(number,chapter,title,deck):
 c.setFillColor(HexColor('#f4f8fc'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(MINT);c.rect(0,H-9,W,9,fill=1,stroke=0)
 c.setFont('Bold',8);c.setFillColor(BLUE);c.drawString(46,H-45,'RADR  /  OPERATOR SERIES')
 c.setFont('Body',8);c.setFillColor(MUTED);c.drawRightString(W-46,H-45,f'{number:02} / {chapter.upper()}')
 y=para(escape(title),46,H-91,W-92,'heading')-18
 y=para(escape(deck),46,y,W-92)-22
 c.setStrokeColor(HexColor('#c6d8e2'));c.line(46,53,W-46,53)
 c.setFont('Body',7.5);c.setFillColor(MUTED);c.drawString(46,36,'The Hospitality Decision Playbook  ·  November 2026');c.drawRightString(W-46,36,f'{number:02} / 16')
 return y

def sub(title,text,y):
 y=para(escape(title),46,y,W-92,'sub')-8;y=para(escape(text),46,y,W-92)-20;return y

def card(title,text,y,accent=False):
 p=Paragraph(escape(text),styles['card']);_,height=p.wrap(W-128,H);height+=66
 c.setFillColor(HexColor(PALETTE['ocean-soft']) if accent else white);c.setStrokeColor(white);c.roundRect(46,y-height,W-92,height,12,fill=1,stroke=1)
 para(escape(title),64,y-17,W-128,'sub');p.drawOn(c,64,y-48-(height-66));return y-height-16

def rows(items,y,widths=(150,353)):
 for label,body in items:
  ph=Paragraph(escape(body),styles['small']);_,height=ph.wrap(widths[1]-24,H);height=max(height+26,48)
  c.setFillColor(white);c.roundRect(46,y-height,W-92,height,8,fill=1,stroke=0)
  para(escape(label),60,y-13,widths[0]-20,'sub');ph.drawOn(c,46+widths[0],y-13-(height-26));y-=height+8
 return y

def note(text,y):return para(escape(text),46,y,W-92,'small')
def done():c.showPage()

def approved_mark(x,y,width=34):
 root=ET.parse(ROOT/'public/brand/radr-mark-master-v4-white.svg').getroot()
 vx,vy,vw,vh=map(float,root.attrib['viewBox'].split());scale=width/vw
 c.saveState();c.translate(x,y+vh*scale);c.scale(scale,-scale);c.translate(-vx,-vy)
 for node in root:
  fill=node.attrib.get('fill','#ffffff');c.setFillColor(HexColor(fill))
  if node.tag.endswith('circle'):c.circle(float(node.attrib['cx']),float(node.attrib['cy']),float(node.attrib['r']),stroke=0,fill=1)
  elif node.tag.endswith('path'):
   tokens=re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?',node.attrib['d']);path=c.beginPath();i=0
   while i<len(tokens):
    cmd=tokens[i];i+=1
    if cmd=='M':path.moveTo(float(tokens[i]),float(tokens[i+1]));i+=2
    elif cmd=='L':path.lineTo(float(tokens[i]),float(tokens[i+1]));i+=2
    elif cmd=='C':path.curveTo(*map(float,tokens[i:i+6]));i+=6
    elif cmd in ['Z','z']:path.close()
    else:raise ValueError('Unsupported master path command '+cmd)
   c.drawPath(path,fill=1,stroke=0)
 c.restoreState()

# Publication imagery is AI-generated editorial illustration of fictional venues.
# Original approved logo paths are preserved above. Research scopes appear on each chart.
from reportlab.lib.utils import ImageReader

def photo(name,x,y,w,h):
 image=ImageReader(str(ROOT/'public/marketing/reports'/name));iw,ih=image.getSize();scale=max(w/iw,h/ih)
 c.saveState();path=c.beginPath();path.rect(x,y,w,h);c.clipPath(path,stroke=0,fill=0)
 c.drawImage(image,x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale,mask='auto');c.restoreState()

def bars(items,y,maximum,suffix='',source=''):
 # All bars share a zero baseline; values are directly labeled.
 x=46;track=W-92
 for label,value,color in items:
  para(escape(label),x,y,track-95,'small');c.setFont('Bold',15);c.setFillColor(color);c.drawRightString(W-46,y-12,(f'US${value:,.0f}' if suffix=='USD' else f'{value:g}{suffix}'))
  c.setFillColor(HexColor('#dbe6ee'));c.roundRect(x,y-38,track,12,6,fill=1,stroke=0)
  c.setFillColor(color);c.roundRect(x,y-38,track*value/maximum,12,6,fill=1,stroke=0);y-=69
 if source:y=note(source,y-2)-14
 return y

def big(value,label,x,y,w=150):
 c.setFillColor(white);c.roundRect(x,y-105,w,105,12,fill=1,stroke=0)
 c.setFont('Bold',30);c.setFillColor(GREEN);c.drawString(x+15,y-39,value)
 para(escape(label),x+15,y-55,w-30,'small')

# 01 / Editorial cover
c.setFillColor(INK);c.rect(0,0,W,H,fill=1,stroke=0)
photo('hospitality-scene.jpg',0,0,W,480)
c.setFillColor(Color(.025,.12,.20,alpha=.75));c.rect(0,0,W,480,fill=1,stroke=0)
c.setFillColor(MINT);c.rect(0,H-8,W,8,fill=1,stroke=0)
approved_mark(46,H-88,43)
c.setFont('Body',9);c.setFillColor(MINT);c.drawString(46,H-119,'RADR OPERATOR SERIES / NOVEMBER 2026')
c.setFont('Body',18);c.setFillColor(white);c.drawString(46,H-184,'THE HOSPITALITY')
c.setFont('Bold',58);c.drawString(42,H-251,'Decision');c.drawString(42,H-315,'Playbook.')
coverstyle=ParagraphStyle('cover',fontName='Body',fontSize=18,leading=27,textColor=white)
p=Paragraph('The margin you can still protect.<br/>The decisions you can still change.',coverstyle);_,h=p.wrap(460,200);p.drawOn(c,46,409-h)
c.setFont('Bold',11);c.setFillColor(MINT);c.drawString(46,175,'RESEARCH. REAL OPERATING QUESTIONS. PRACTICAL TOOLS.')
p=Paragraph('A visual field guide for hospitality CFOs, general managers, and operators. Global context. Restaurant and hotel examples. A 30-day plan.',ParagraphStyle('deck',fontName='Body',fontSize=11,leading=18,textColor=white));_,h=p.wrap(470,100);p.drawOn(c,46,150-h)
c.setFont('Body',8);c.drawString(46,44,'16 PAGES / FIELD GUIDE 01');c.drawRightString(W-46,44,'RADR EDITORIAL / radrup.com');done()

# 02 / The executive story
y=header(2,'Read this first','A full room is not the same as a healthy business.','Hospitality sells a perishable moment. A service window closes, a room night passes, and the chance to change the result moves on.')
big('2.8%','Median pre-tax income / sales, U.S. full-service restaurant survey, 2024 [3]',46,y,159)
big('+4.1%','Expenses above GOP, U.S. hotel sample, 2024 year-on-year [4]',218,y,159)
big('£3.2bn','Annual UK hospitality and food-service food-waste cost estimate [2]',390,y,159)
y-=135
y=sub('The problem is not a shortage of records.','POS, PMS, purchasing, labor, and booking systems each hold part of the truth. Teams still have to connect those records, choose a response, and defend the result while the operation is moving.',y)
y=card('Why RADR exists','RADR is the adaptive decision system for hospitality. It connects operating evidence to a specific choice, makes uncertainty visible, and keeps the outcome attached to the original reasoning. Systems record. RADR decides. Humans provide the hospitality.',y,True)
y=rows([('Learn in 5 minutes','Read pages 3–6 for the market context, the Decision Gap, and an illustrative business case.'),('Use in your next meeting','Take the operating examples on pages 7–11, the evidence checklist on page 12, and the reusable worksheet on page 14.')],y)
note('These figures describe different samples, places, and periods. They are not additive and are not estimates of what RADR can recover. Full sources and methodology: page 16.',y-4);done()

# 03 / Global context
y=header(3,'The scale','Waste is global. The operating decision is local.','UNEP estimates 1.05 billion tonnes of consumer-level food waste in 2022, including inedible parts. Food service accounted for 28%. [1]')
y=bars([('Households / 60%',631,BLUE),('Food service / 28%',290,GREEN),('Retail / 12%',131,MUTED)],y,700,' Mt','[1] UNEP Food Waste Index Report 2024. Global estimates for 2022. Mt = million tonnes; shares rounded.')
y=card('£3.2 billion / annual UK sector cost','WRAP’s published estimate for UK hospitality and food service puts annual food-waste cost at £3.2 billion. UKHospitality cites WRAP and notes that 75% could have been eaten. This is a UK estimate, not a global hospitality total. [2]',y,True)
y=sub('Do not turn a large market number into a promise.','UNEP also cites an economic toll of roughly US$1 trillion for food loss and waste across the wider food system. That includes far more than hospitality. There is no single defensible global hospitality loss total in these sources, and none of these totals establishes RADR-addressable value.',y)
note('Operator question: which ingredients, shifts, service windows, and purchasing choices can your team still change? Measure that local baseline before estimating any protected value.',y);done()

# 04 / Pressure charts
y=header(4,'The margin lens','Small margins. Costs moving faster than revenue.','Two separate U.S. research samples show why revenue alone cannot explain operating health.')
y=para('Restaurant income before taxes / sales',46,y,W-92,'sub')-29
y=bars([('Full-service restaurants',2.8,BLUE),('Limited-service restaurants',4,GREEN)],y,5,'%','[3] National Restaurant Association, published August 2025. 2024 medians; more than 900 restaurants surveyed. Benchmarks, not standards or targets.')
y=para('Hotel growth / 2024 versus 2023',46,y-6,W-92,'sub')-29
y=bars([('Total revenue',2.3,BLUE),('Expenses above gross operating profit',4.1,GREEN)],y,5,'%','[4] CBRE, May 2025. Preliminary 2024 sample of 2,600 U.S. hotels. Same zero baseline within each chart; samples are separate.')
y=card('The question changes.','Instead of asking only “Are we selling more?”, ask “Which mix, constraint, or cost is changing contribution, and which response remains practical before this trading window closes?” Cost growth is not automatically avoidable.',y,True);done()

# 05 / RADR system
y=header(5,'Why RADR','Close the gap between knowing and deciding.','The Decision Gap is the space between what connected systems record and what the operation should do next.')
y=rows([('CONNECT','Bring evidence together from available POS, PMS, labor, purchasing, and channel records. Keep identity, timing, and source links.'),('UNDERSTAND','Read the constraint across those records. Identify missing evidence, the baseline, and the cost of doing nothing.'),('FUTURES','Compare practical alternatives. State expected economics, guest impact, dependencies, and uncertainty.'),('DECIDE','Name the recommendation, responsible owner, deadline, and approval boundary.'),('VERIFY','Review what was executed and what followed. Reconcile economic claims against an agreed evidence rule.'),('REMEMBER','Keep the decision record and learning. Reuse a playbook only where comparable evidence supports it.')],y)
note('RADR sits above existing systems. Connector availability and execution authority are agreed separately. A recommendation or prepared payload does not mean a provider action was executed.',y-6);done()

# 06 / Business case
y=header(6,'Build your business case','What would half a point mean for you?','Start with your own revenue, contribution definition, baseline, and horizon. The arithmetic below is an illustration, not a RADR forecast.')
y=card('Assumed annual revenue / US$10,000,000','Illustrative annual contribution protected = annual revenue × assumed contribution-rate improvement. One percentage point equals 0.01; half a point equals 0.005.',y,True)
y=bars([('0.25 percentage point / assumed',25000,BLUE),('0.50 percentage point / assumed',50000,GREEN),('1.00 percentage point / assumed',100000,INK)],y,100000,'USD','Illustrative annual contribution protected in US dollars. These assumptions are not measured customer results or expected RADR returns.')
y=rows([('Your baseline','Annual revenue: __________  Contribution definition: __________'),('Your total annual cost','Subscription + integration + internal operating effort: __________'),('Break-even test','Required contribution-rate change = total annual cost ÷ annual revenue. Then test whether the operating evidence supports it.')],y)
note('Avoid double counting: a supplier credit and lower ingredient cost may describe the same economic benefit. Finance should agree attribution, timing, and recognition before reporting verified value.',y-5);done()

# 07 / Restaurant illustration
y=header(7,'Restaurant service','Your bestseller can be your bottleneck.','Synthetic RADR example / D-7110. A strong per-dish contribution can hide a weak contribution per constrained kitchen minute.')
photo('kitchen-service.jpg',46,y-205,W-92,205);y-=224
c.setFont('Body',7);c.setFillColor(MUTED);c.drawString(46,y+7,'AI-generated editorial illustration / fictional venue')
y=card('−18% / contribution per kitchen minute at peak','In this synthetic example, the signature dish looks attractive per plate but performs worse against scarce station time. BUY, LABOR, and SELL reveal one connected operating choice, rather than three separate reports.',y,True)
y=rows([('19:00–20:30 / choose','Keep the signature dish available. De-emphasize it during peak and feature faster Truffle Pasta. Restore emphasis off peak.'),('Before approval','Check item mapping, contribution inputs, prep and station minutes, guest commitments, and the actual peak demand window.'),('After the window','Review the observed mix, station load, service times, and economics against the baseline. Preserve competing explanations.')],y)
note('The −18% figure and named menu choice belong to a synthetic demo, not an empirical industry finding or customer result.',y-4);done()

# 08 / Expected vs outcome
y=header(8,'Restaurant decision record','Keep the forecast. Keep the proof.','Synthetic RADR example / D-1911 / Soho · New York / 19:48. Pace the next seating wave for 12 minutes to protect the active service constraint.')
big('+$620','Expected protected tonight / synthetic forecast',46,y,244);big('$590','Protected tonight / separate completed-service demo',305,y,244);y-=134
y=card('82% confidence is not a guarantee.','The original recommendation carries an 82% confidence assessment in the demo. The separate $590 completed-service record must not overwrite the +$620 forecast. A finance reviewer needs both records, the baseline, and the execution trail.',y,True)
y=rows([('The choice','Accept the next wave immediately or pace seating for 12 minutes. Preserve the guest commitment and operational trade-off.'),('The evidence','Reservation wave, station load, ticket times, source freshness, and actual seating record.'),('The review','Was the response carried out? What happened after? Which other conditions changed? Does the agreed rule support the economic claim?')],y)
note('Expected → observed → verified are different states. A later revenue increase alone does not prove that a particular decision caused it. All figures on this page are synthetic and relate to tonight.',y-5);done()

# 09 / Hotel
y=header(9,'Hotel operations','Sell the room night. Understand the whole stay.','Distribution, rate, room readiness, staffing, and guest commitments belong in the same decision conversation.')
y=para('OTA share of European hotel room bookings',46,y,W-92,'sub')-28
y=bars([('2013 reference year',19.7,BLUE),('2025 reference year',29.9,GREEN)],y,35,'%','[5] HOTREC European Hotel Distribution Study 2026, published September 2026. 2,713 hotels in the current study; historical study comparison. This measures booking share, not financial loss.')
y=card('Channel dependence is a question, not a verdict.','OTA demand can be valuable. Compare contribution using actual channel terms, acquisition costs, cancellation behavior, and stay requirements. Do not apply an invented standard commission or treat all intermediated bookings as avoidable cost.',y,True)
y=rows([('Readiness','Which arrival commitments depend on rooms that are expected, but not yet confirmed, ready? Timestamp each estimate.'),('The next choice','Compare housekeeping priorities, room-type constraints, roster capacity, and guest commitments before preparing a response.'),('The review','After the arrival wave, reconcile actual readiness, guest handling, channel cost, and contribution using consistent definitions.')],y)
done()

# 10 / External evidence
y=header(10,'Evidence that action matters','Measure waste. Change the process. Review the result.','A historical hotel program study offers a useful lesson: disciplined operational change can have measurable economics. It is not evidence of RADR returns.')
big('$7 : $1','Average savings / investment in the study',46,y,244);big('21%','Average kitchen food-waste weight reduction in one year',305,y,244);y-=134
y=bars([('Starting kitchen food-waste weight / index',100,BLUE),('After one year / index',79,GREEN)],y,100,'','[6] Champions 12.3 / WRI / WRAP, April 2018. 42 hotels across 15 countries. Reported average results from participating programs, not a randomized RADR study.')
y=rows([('What this supports','Food-waste measurement and operational follow-through deserve a place in the operating conversation.'),('What it does not support','A guaranteed 7:1 return, a current market-wide average, or a claim that installing RADR produces the same result.'),('How to use it','Set your own baseline. Track quantities and cost consistently. Record process changes and the relevant investment before reviewing savings.')],y)
note('Before expanding a pilot, ask whether the result is repeatable under your venue’s mix, cost base, operating model, and evidence quality.',y-5);done()

# 11 / Pilot choices
y=header(11,'Choose your first loop','One operating question. Connected economic lenses.','BUY, LABOR, SELL, and RECOVER are lenses over one operating model. Start where the evidence and an accountable owner already exist.')
y=rows([('BUY / purchasing','Trigger: quantity, yield, or price variance. Evidence: agreed terms, item units, receipts, and actual use. Owner: purchasing or chef. Review: next order or weekly reconciliation.'),('LABOR / capacity','Trigger: arrival wave or station load. Evidence: demand timing, roster, task status, and service commitments. Owner: GM or duty manager. Review: the service or arrival window.'),('SELL / mix','Trigger: attractive sales with weak contribution under a constraint. Evidence: mix, contribution inputs, channel terms, and capacity. Owner: commercial and operations together. Review: the relevant trading window.'),('RECOVER / supplier case','Trigger: a matched discrepancy. Evidence: invoice, contract, receipt, approval, credit, and reconciliation. Owner: AP or purchasing. Review: case closure under the agreed recognition rule.')],y)
y=card('Stop where the evidence stops.','A discrepancy is not a recovered amount. A supplier promise is not a reconciled credit. A recommendation is not an executed action. Preserve each state and give the team a clear next step.',y,True)
note('Suggested first meeting: choose one row, one location, one owner, one baseline, and one review horizon. Add another lens only when it improves that same decision.',y-4);done()

# 12 / Checklist
y=header(12,'Evidence scorecard','Could finance defend this decision?','Mark each row Ready / Needs review / Missing. For every gap, name an owner and a next check. Readiness depends on the affected decision.')
y=rows([('Source identity','Can the reviewer open the original record? Are location, supplier, item, room, and trading period unambiguous?'),('Definitions','Are units, currency, tax treatment, period, and contribution definitions aligned? Is the baseline frozen and named?'),('Freshness','When did each source update? Does that timing fit the operating window?'),('Coverage','What evidence is absent? Could the omission change the recommendation?'),('Uncertainty','Which parts are observed, estimated, or inferred? What would materially change confidence?'),('Authority','Who can approve, prepare, and execute? Which connected-system permissions actually exist?'),('Verification','What records establish execution and outcome? What attribution, reconciliation, and recognition rules will finance apply?')],y)
note('Do not hide a weak input behind an attractive confidence score. Use observation, a prepared response, or a request for evidence when execution is not yet justified.',y-5);done()

# 13 / Roadmap
y=header(13,'Your first 30 days','Prove one useful loop before expanding.','A pilot should produce an inspectable decision trail and a clear go / no-go discussion, not a dashboard full of unreviewed numbers.')
y=rows([('01 / FRAME / week 1','Choose one location and one recurring decision. Name the business owner, evidence owner, approver, baseline, horizon, and materiality rule. Deliverable: signed-off pilot brief.'),('02 / OBSERVE / week 2','Connect or upload the agreed evidence. Review source matches, freshness, and gaps. Compare alternatives without assuming execution is available. Deliverable: first reviewed decision record.'),('03 / ACT / week 3','Use the approved operating process. Record the response, timing, exceptions, guest impact, and team effort. Deliverable: execution trail with source references.'),('04 / VERIFY / week 4','Review expected, observed, and verified outcomes under the agreed rule. Include fees and internal effort in the commercial review. Deliverable: finance-reviewed pilot assessment.')],y)
y=card('Expand only if the loop earns it.','Was the decision timely? Was the response practical? Could the reviewer inspect the evidence? Could finance reconcile the claim? What remains unverified, and what must improve before another location is added?',y,True)
note('Commercial scope, responsibilities, security review, and connector permissions are agreed separately. This plan contains no guaranteed financial return.',y-5);done()

# 14 / Printable worksheet
y=header(14,'Take this to your next meeting','The one-page Decision record.','Keep the record attached to source evidence and the eventual outcome. Use one consistent contribution definition and one review horizon.')
for label in ['Decision / owner / deadline','What changed / constraint','Baseline / sources / horizon','Alternatives / doing nothing','Expected value / uncertainty','Approval / execution record','Observed / verified / learning']:
 c.setFillColor(white);c.roundRect(46,y-65,W-92,65,8,fill=1,stroke=0)
 para(escape(label),60,y-13,165,'small')
 c.setStrokeColor(HexColor('#b6cbd8'));c.setLineWidth(.5)
 c.line(235,y-27,W-61,y-27);c.line(235,y-48,W-61,y-48);y-=73
note('Next review date: __________________   Evidence owner: __________________',y-8);done()

# 15 / Invitation
y=header(15,'The next conversation','Bring one real operating question.','You do not need to arrive with a perfect data estate. Arrive with a decision that matters, the available evidence, and a person who owns the response.')
photo('hospitality-scene.jpg',46,y-195,W-92,195);y-=216
c.setFont('Body',7);c.setFillColor(MUTED);c.drawString(46,y+7,'AI-generated editorial illustration / fictional venue')
y=rows([('Bring the question','Which recurring choice is difficult to make or defend? Which location and trading horizon matter?'),('Bring the evidence map','Which POS, PMS, labor, purchasing, booking, and channel records are available? What is missing?'),('Bring the owners','Who runs the response? Who approves it? Who will review the economics and evidence?')],y)
y=card('See RADR against your operating reality.','Use the playbook to structure a product discussion: one decision, connected evidence, practical alternatives, an approval boundary, and a record of what happened after.',y,True)
y=para('<link href="https://radrup.com/en/contact" color="#176B7D">Start the conversation: radrup.com/en/contact</link>',46,y,W-92,'sub')-14
note('Public product demos use illustrative data. Actual integrations, execution permissions, commercial scope, security requirements, and verification rules are agreed for each operation.',y);done()

# 16 / Source ledger
y=header(16,'Sources and methodology','Trace the numbers. Keep the context.','Research reviewed 4 November 2026. External findings, illustrative arithmetic, and synthetic RADR records are deliberately separated.')
refs=[
('1 / UNEP / global / 2022 data / published 2024','Food Waste Index Report 2024; press release, 27 March 2024. 1.05bn tonnes; sector shares 60% / 28% / 12%. Mass estimates 631 / 290 / 131 Mt are rounded. Roughly US$1tn refers to wider food loss and waste, not hospitality.','https://www.unep.org/en/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report'),
('2 / WRAP via UKHospitality / United Kingdom','Reducing food waste. Annual sector cost estimate £3.2bn and 75% edible, attributed to WRAP Guardians of Grub. A published estimate repeated in campaign guidance, not a new 2026 measurement.','https://www.ukhospitality.org.uk/guidance/reducing-food-waste/'),
('3 / National Restaurant Association / United States','New Association report helps operators gauge their restaurant performance, 20 August 2025. More than 900 restaurants; 2024 median income before taxes / sales: full-service 2.8%, limited-service 4.0%.','https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/new-association-report-helps-operators-gauge-their-restaurant-performance/'),
('4 / CBRE / United States / 2024 data','All Eyes on Operating Costs in 2025: Lessons Learned in 2024, 8 May 2025. Preliminary sample 2,600 hotels; total revenue +2.3%, expenses above GOP +4.1%, year-on-year.','https://www.cbre.com/insights/articles/all-eyes-on-operating-costs-in-2025-lessons-learned-in-2024'),
('5 / HOTREC / Europe / 2025 reference year','European Hotel Distribution Study 2026, release 15 September 2026. Current sample 2,713 hotels. OTA booking share 29.9% in 2025 versus historical 19.7% in 2013.','https://www.hotrec.eu/en/news_booking-holdings-and-expedia-group-account-for-85-of-europe_E2_80_99s-ota-market-hotrec-study-finds.html'),
('6 / Champions 12.3 / WRI / WRAP / published 2018','The Business Case for Reducing Food Loss and Waste: Hotels, April 2018. 42 hotels, 15 countries. Average reported savings $7 per $1 invested; average kitchen waste weight reduction 21% in one year. Historical program findings, not RADR ROI.','https://champions123.org/publication/business-case-reducing-food-loss-and-waste-hotels')]
for title,body,url in refs:
 y=para(escape(title),46,y,W-92,'sub')-5
 y=para(escape(body)+' <link href="'+url+'" color="#176B7D"><u>Open original source</u></link>',46,y,W-92,'small')-15
note('Method: no cross-country financial totals are added or extrapolated. Charts start at zero; indices and rounded values are labeled. Page 6 is assumed arithmetic. D-1911 and D-7110 are synthetic product examples. Images are AI-generated editorial illustrations of fictional venues, not customer sites. Framework and worksheets: RADR Editorial. Publication provides operating guidance, not a guaranteed business outcome.',y-2)
c.save()
print(OUT)
