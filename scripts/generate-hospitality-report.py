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
INK=HexColor('#163c59'); MUTED=HexColor('#48657a'); BLUE=HexColor('#225da2'); GREEN=HexColor('#087653'); MINT=HexColor('#7ef0ba'); LIGHT=HexColor('#edf4f8')
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
 c.setFont('Bold',8);c.setFillColor(GREEN);c.drawString(46,H-45,'RADR  /  OPERATOR SERIES')
 c.setFont('Body',8);c.setFillColor(MUTED);c.drawRightString(W-46,H-45,f'{number:02} / {chapter.upper()}')
 y=para(escape(title),46,H-91,W-92,'heading')-18
 y=para(escape(deck),46,y,W-92)-22
 c.setStrokeColor(HexColor('#c6d8e2'));c.line(46,53,W-46,53)
 c.setFont('Body',7.5);c.setFillColor(MUTED);c.drawString(46,36,'The Hospitality Decision Playbook  ·  November 2026');c.drawRightString(W-46,36,f'{number:02} / 11')
 return y

def sub(title,text,y):
 y=para(escape(title),46,y,W-92,'sub')-8;y=para(escape(text),46,y,W-92)-20;return y

def card(title,text,y,accent=False):
 p=Paragraph(escape(text),styles['card']);_,height=p.wrap(W-128,H);height+=66
 c.setFillColor(HexColor('#ddf2e9') if accent else white);c.setStrokeColor(white);c.roundRect(46,y-height,W-92,height,12,fill=1,stroke=1)
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

# Cover
c.setFillColor(INK);c.rect(0,0,W,H,fill=1,stroke=0)
for i in range(20):
 c.setFillColor(Color(.08,.30,.29,alpha=.08));c.circle(W+35-i*2,140+i*6,270-i*7,fill=1,stroke=0)
c.setFillColor(MINT);c.rect(0,0,9,H,fill=1,stroke=0)
approved_mark(46,H-81,45)
c.setFont('Body',9);c.setFillColor(HexColor('#c7dde7'));c.drawString(48,H-104,'OPERATOR SERIES  /  FIELD GUIDE 01')
c.setFont('Body',19);c.setFillColor(MINT);c.drawString(48,H-229,'THE HOSPITALITY')
c.setFont('Bold',57);c.setFillColor(white);c.drawString(43,H-298,'Decision');c.drawString(43,H-364,'Playbook.')
cover=Paragraph('A practical field guide for CFOs, general managers, and hospitality operators.',ParagraphStyle('cover',fontName='Body',fontSize=15,leading=23,textColor=HexColor('#d3e5eb')));cover.wrap(410,150);cover.drawOn(c,48,H-454)
for i,(a,b) in enumerate([('CONNECT','UNDERSTAND'),('FUTURES','DECIDE'),('VERIFY','REMEMBER')]):
 y=H-550-i*42;c.setStrokeColor(HexColor('#406471'));c.line(48,y-15,W-48,y-15);c.setFont('Body',10);c.setFillColor(MINT);c.drawString(48,y,a);c.setFillColor(white);c.drawString(285,y,b)
c.setFont('Body',9);c.setFillColor(HexColor('#c7dde7'));c.drawString(48,65,'NOVEMBER 2026');c.drawRightString(W-48,65,'RADR EDITORIAL  /  radrup.com');done()

y=header(2,'Executive brief','Make the next decision easier to defend.','Hospitality teams need a shared view of what changed, what can still change, and what the evidence supports.')
y=sub('The operating problem','A restaurant service or hotel arrival wave connects demand, labor, readiness, purchasing, and guest commitments. Each system records part of that picture. The difficult judgment sits between those records: which response should the team make while the outcome is still changeable?',y)
y=card('Use this guide in one location first.','Choose one recurring Decision class. Agree its evidence, owner, approval boundary, and review horizon. Start with a process the team can inspect rather than a broad promise that nobody can verify.',y,True)
y=rows([('For the CFO','Separate forecast variance from its drivers. Keep expected, observed, and verified economics distinct.'),('For the GM','See the operating constraint, choose a proportionate response, and assign an owner and a review time.'),('For the team','Understand what is being asked, what is still uncertain, and how to record what actually happened.')],y)
note('Scope and method: this is RADR’s first-party operating framework, not an empirical industry survey. Worked financial examples use synthetic demo records. The checklists are designed for adaptation to your operation.',y-5);done()

y=header(3,'The decision loop','From connected evidence to a decision record.','Use the same loop before and after the action. Keep the reasoning visible as the operation changes.')
y=rows([('01 / Connect','Identify the source records, location, trading period, currency, and refresh time. Preserve links to original evidence.'),('02 / Understand','Describe what changed and the active constraint. Identify assumptions, missing evidence, and relevant baselines.'),('03 / Futures','Compare at least one alternative with doing nothing. State guest impact, operational risk, and expected economics.'),('04 / Decide','Name the recommendation, owner, approval boundary, and deadline. Distinguish a prepared action from an executed action.'),('05 / Verify','Compare the expectation with observed records after the relevant horizon. Apply an agreed evidence rule before assigning verified value.'),('06 / Remember','Record what the team learned. Reuse a playbook only when comparable evidence supports doing so.')],y)
note('Working rule: confidence should change the response. Weak evidence can justify observation or a prepared recommendation without justifying execution.',y-7);done()

y=header(4,'Restaurant service','Protect the bottleneck, then review the night.','A restaurant Decision can connect demand, seating pace, kitchen capacity, and service economics.')
y=sub('Start with the constraint','A seating wave may be commercially attractive while the kitchen is already under pressure. Compare accepting the next wave immediately with pacing it. Include the guest commitment, the operating window, and the expected cost of waiting.',y)
y=card('Illustrative demo / D-1911 / Soho · New York','The synthetic RADR example recommends pacing the next seating wave for 12 minutes. Expected protected value tonight is +$620 at 82% confidence. Those are a forecast and a confidence assessment, not a realized customer result.',y,True)
y=card('Review the completed-service evidence separately.','The separate illustrative completed-service record shows $590 protected tonight. Do not replace the original +$620 expectation with the later result. Keep both, alongside the baseline, timing, execution record, and competing explanations.',y)
y=rows([('Before approving','Check the reservation wave, station load, ticket times, seating commitments, and freshness of the POS feed.'),('After service','Review whether the response was carried out, what the operating records show, and what else changed during the same window.')],y)
note('A related synthetic example, D-7110, examines signature-dish contribution versus cold-station minutes at peak. BUY, LABOR, and SELL are connected economic lenses over one operating picture.',y-5);done()

y=header(5,'Hotel readiness','Read the occupied night alongside the work.','Room demand, channel economics, and room readiness belong in the same decision conversation.')
y=sub('Coordinate the next arrival wave','Bring confirmed arrivals, room status, housekeeping estimates, guest commitments, and the actual roster into one view. Separate a room confirmed ready from a room expected to become ready. Every readiness estimate needs a timestamp and a responsible owner.',y)
y=rows([('Operating choice','Which task or room type should receive attention first? What guest commitments and accessibility needs must remain protected?'),('Commercial choice','What demand is still open? Compare the rate, channel cost, included benefits, length of stay, and operating requirements on a consistent basis.'),('Risk and uncertainty','What happens if a readiness estimate is late or a later booking does not arrive? Make the dependency visible before recommending a response.'),('Review point','After the arrival wave, compare actual readiness and guest handling with what was expected. Review contribution using the same definitions.')],y)
y=card('A portfolio is a source of questions.','Similar occupancy or rate can coexist with different room mix, service standards, labor conditions, and stay patterns. Use cross-property comparisons to find drivers worth investigating; retain the context that makes each property different.',y,True)
note('No provider write is implied by a recommendation. Approvals, connected-system permissions, and an execution record remain separate steps.',y-4);done()

y=header(6,'The CFO briefing','Turn the forecast gap into a short decision list.','Build the briefing around a stable baseline, inspectable drivers, and actions that can still change the relevant horizon.')
y=rows([('Fix the frame','Align local trading date, clock, currency basis, forecast version, and revenue definition. Show freshness and any revisions.'),('Trace the drivers','For restaurants, examine covers, average check, food/drink mix, delivery, and refunds. For hotels, inspect demand, rate, channel mix, readiness, and ancillary revenue.'),('Compare locations','Choose denominators and comparable periods that fit the decision. Preserve property context and identify actual outliers.'),('Assign the response','Name the decision, owner, expected horizon, approval requirement, and next review time. No action can be the justified result.')],y)
y=card('Five-minute briefing template','What changed? What matters now? What is the cost of doing nothing? Which alternative should we prepare? Who owns the next step? What evidence will let us review the result?',y,True)
note('Keep expected, observed, and verified outcomes in separate columns. A later increase in revenue does not by itself establish that a particular response created the increase.',y-5);done()

y=header(7,'Supplier / AP recovery','A discrepancy starts the case. Evidence closes it.','Trace a claim through approval, supplier response, credit, and reconciliation without overstating the result.')
y=rows([('Match the records','Check supplier entity, item, pack size, unit, quantity, currency, agreed price, and effective date. Preserve uncertain matches.'),('Prepare the request','Link the source evidence and calculation. Identify the discrepancy, the requested remedy, and the approver.'),('Track the response','Separate acknowledgement, agreement, credit note, and settlement. Store references and dates against the same case.'),('Verify the outcome','Agree the recovery rule before reporting it. A posted credit matched to the invoice may be required; some processes also need settlement evidence.'),('Prevent repetition','Review whether the pattern needs better master data, a purchasing decision, a clearer owner, or a different escalation rule.')],y)
y=card('Use precise economic language.','State the amount exposed, protected, recovered, or created and the relevant horizon. Keep the original expectation visible when the actual outcome differs. A supplier promise is not the same record as a reconciled recovery.',y,True)
done()

y=header(8,'Evidence scorecard','Know what the recommendation can rely on.','Use this checklist before presenting a Decision as ready for approval. Record a gap instead of quietly filling it with an assumption.')
y=rows([('Source identity','Can the reviewer open the original record? Is the location, supplier, item, room, or trading period unambiguous?'),('Definitions','Are units, currency, tax treatment, period, and economic definitions aligned? Is the baseline frozen and named?'),('Freshness','When did the source last update? Does that timing fit the decision window?'),('Coverage','What is missing from the operating picture? Could that omission change the recommended response?'),('Confidence','Which parts are observed, estimated, or inferred? What additional evidence would materially improve confidence?'),('Execution and review','Who can approve or execute? What records will establish what happened after the decision?')],y)
note('Worksheet: mark each row Ready / Needs review / Missing. Assign an owner and next check for every gap. Readiness is a judgment based on the affected Decision, not a decorative global percentage.',y-7);done()

y=header(9,'30-day pilot','Prove one useful loop before expanding it.','Agree the scope and review criteria at the start. A pilot should produce an inspectable decision trail and a clear go / no-go discussion.')
y=rows([('Week 1 / Frame','Choose one location and one Decision class. Name the business owner, evidence owner, approver, baseline, horizon, and materiality rule. Record integration and access limits.'),('Week 2 / Observe','Connect or upload the agreed evidence. Review data health and source matches. Walk one Decision through alternatives without assuming execution is available.'),('Week 3 / Review','Use the approved operating process. Record the actual response, timings, exceptions, and guest or team impacts. Retain the doing-nothing comparison.'),('Week 4 / Verify','Review expected, observed, and verified outcomes under the agreed evidence rule. Identify what remains unverified and what the team learned.')],y)
y=card('The end-of-pilot questions','Was the Decision useful and timely? Could the reviewer inspect its evidence? Was the response practical? Could finance reconcile the economic claim? What should change before another location or Decision class is added?',y,True)
note('Agree the commercial scope and responsibilities separately. This plan is an operating framework and contains no guaranteed financial return.',y-5);done()

y=header(10,'Reusable worksheet','The one-page Decision record.','Copy this structure into your operating review. Keep the record attached to the source evidence and the eventual outcome.')
y=rows([('Decision / owner / deadline','____________________________________________________________\n____________________________________________________________'),('What changed / why it matters','____________________________________________________________\n____________________________________________________________'),('Baseline / evidence / horizon','____________________________________________________________\n____________________________________________________________'),('Alternatives / doing nothing','____________________________________________________________\n____________________________________________________________'),('Recommendation / approval','____________________________________________________________\n____________________________________________________________'),('Expected / observed / verified','____________________________________________________________\n____________________________________________________________'),('What we learned / next review','____________________________________________________________\n____________________________________________________________')],y,widths=(178,325))
done()

y=header(11,'Governance and next steps','Keep the operator in control.','An adaptive decision system earns trust through inspectable evidence, proportionate authority, and a clear record of the outcome.')
y=sub('Set the boundary before the action','Define which responses can be prepared, which require approval, and which connected-system permissions are available. A prepared payload does not mean an action was executed. Preserve who approved the response and what the system actually recorded.',y)
y=sub('Protect the context','Use appropriate access controls for guest notes, allergies, commercial agreements, and staff information. A person should see the context needed for the role without receiving unrelated sensitive records.',y)
y=card('Bring one real operating question.','For a RADR discussion, bring the Decision class you want to examine, the evidence sources you have, the owner of the operating response, and the horizon that matters. Use the evidence scorecard to identify what is ready and what still needs review.',y,True)
y=sub('Continue the conversation','Explore RADR’s product demo, journal, and contact page at radrup.com. The public demos use illustrative data. Actual connector availability, execution permissions, commercial scope, and verification rules are agreed for the operation.',y)
note('Editorial basis: RADR public positioning and synthetic Decision records D-1911 and D-7110, reviewed 3 November 2026. Framework and worksheets: RADR Editorial. This publication does not present a customer case study or industry survey.',y-5)
c.linkURL('https://radrup.com/en/contact',(46,70,W-46,100),relative=0,thickness=0)
c.save()
print(OUT)
