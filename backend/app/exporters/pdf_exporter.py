import os
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header rule
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 755, 572, 755)
        self.drawString(40, 760, "WebIntel AI — Website & Business Intelligence Platform")
        # Footer rule
        self.line(40, 45, 572, 45)
        self.drawString(40, 32, "Confidential — Automated Intelligence Report")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 32, page_str)
        self.restoreState()

def generate_pdf_report(analysis_data: Dict[str, Any], output_path: str):
    """
    Generates a publication-grade PDF audit report for a website analysis.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a")
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#64748b")
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155")
    )

    story = []

    domain = analysis_data.get("domain", "website.com")
    url = analysis_data.get("url", "")
    created_at = analysis_data.get("created_at", "Recent")
    scores = analysis_data.get("health_scores", {})
    overall_score = scores.get("overall", 75)

    # Header / Title Block
    story.append(Paragraph("WebIntel AI Audit Report", title_style))
    story.append(Paragraph(f"Comprehensive Audit for: <b>{domain}</b> &bull; {url}", subtitle_style))
    story.append(Paragraph(f"Generated on {created_at} &bull; Total Crawled Pages: {len(analysis_data.get('pages', []))}", subtitle_style))
    story.append(Spacer(1, 15))

    # Overall Health Scorecard
    score_color = colors.HexColor("#16a34a") if overall_score >= 80 else (colors.HexColor("#ca8a04") if overall_score >= 60 else colors.HexColor("#dc2626"))
    
    score_table_data = [
        [
            Paragraph(f"<font size=28 color='{score_color.hexval()}'><b>{overall_score}</b></font><br/><font size=10 color='#475569'><b>Overall Health Score</b></font>", body_style),
            Paragraph(f"<b>SEO:</b> {scores.get('seo', 0)}/100<br/><b>Performance:</b> {scores.get('performance', 0)}/100<br/><b>Accessibility:</b> {scores.get('accessibility', 0)}/100", body_style),
            Paragraph(f"<b>Security:</b> {scores.get('security', 0)}/100<br/><b>User Experience:</b> {scores.get('ux', 0)}/100<br/><b>Content Depth:</b> {scores.get('content', 0)}/100", body_style)
        ]
    ]
    score_table = Table(score_table_data, colWidths=[170, 180, 180])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # Executive Summary (Master AI)
    master_ai = analysis_data.get("agents", {}).get("master", {})
    if master_ai:
        story.append(Paragraph("Master AI Executive Briefing", h1_style))
        story.append(Paragraph(master_ai.get("executive_summary", ""), body_style))
        story.append(Spacer(1, 10))

        # Priority Recommendations
        story.append(Paragraph("Prioritized Action Matrix", h1_style))
        recs = master_ai.get("top_recommendations", [])
        if recs:
            rec_rows = [["Priority", "Category", "Recommended Intervention", "Expected Impact"]]
            for r in recs[:6]:
                prio = r.get("priority", "MEDIUM")
                prio_cell = f"<font color='{'#dc2626' if prio=='HIGH' else '#ca8a04'}'><b>{prio}</b></font>"
                rec_rows.append([
                    Paragraph(prio_cell, body_style),
                    Paragraph(r.get("category", ""), body_style),
                    Paragraph(r.get("action", ""), body_style),
                    Paragraph(r.get("impact", ""), body_style)
                ])
            rec_table = Table(rec_rows, colWidths=[65, 90, 220, 155])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 6),
                ('TOPPADDING', (0,0), (-1,0), 6),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(rec_table)
            story.append(Spacer(1, 15))

    # Technology Stack & Features
    story.append(Paragraph("Technology Stack & Discovered Features", h1_style))
    techs = analysis_data.get("technical", {}).get("technologies", [])
    tech_str = ", ".join([f"{t['technology']} ({t['category']})" for t in techs]) if techs else "No distinctive third-party frameworks detected"
    story.append(Paragraph(f"<b>Detected Stack:</b> {tech_str}", body_style))
    story.append(Spacer(1, 6))

    features = analysis_data.get("features", [])
    detected_feats = [f["feature"] for f in features if f.get("status") == "Detected"]
    feat_str = ", ".join(detected_feats[:12]) if detected_feats else "Basic static website layout"
    story.append(Paragraph(f"<b>Active Features ({len(detected_feats)}):</b> {feat_str}", body_style))
    story.append(Spacer(1, 15))

    # Opportunity Signals
    opps = analysis_data.get("opportunity_signals", [])
    if opps:
        story.append(Paragraph("Commercial Opportunity Signals", h1_style))
        opp_rows = [["Priority", "Signal", "Observed Evidence", "Recommendation"]]
        for o in opps[:5]:
            prio = o.get("priority", "MEDIUM")
            prio_cell = f"<font color='{'#dc2626' if prio=='HIGH' else '#ca8a04'}'><b>{prio}</b></font>"
            opp_rows.append([
                Paragraph(prio_cell, body_style),
                Paragraph(o.get("signal", ""), body_style),
                Paragraph(o.get("evidence", ""), body_style),
                Paragraph(o.get("recommendation", ""), body_style)
            ])
        opp_table = Table(opp_rows, colWidths=[65, 140, 160, 165])
        opp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(opp_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path

def generate_business_pdf_report(search_data: Dict[str, Any], output_path: str):
    """
    Generates a publication-grade PDF report for a Business Search & Opportunity session.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a")
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b")
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    story = []
    location = search_data.get("location", "Kanpur")
    keyword = search_data.get("keyword", "Restaurant")
    businesses = search_data.get("businesses", [])
    total_found = len(businesses)
    with_websites = sum(1 for b in businesses if b.get("website"))

    story.append(Paragraph("WebIntel AI — Business & Opportunity Intelligence", title_style))
    story.append(Paragraph(f"Location: <b>{location}</b> &bull; Industry: <b>{keyword}</b>", subtitle_style))
    story.append(Paragraph(f"Total Businesses Located: <b>{total_found}</b> &bull; Active Websites: <b>{with_websites}</b> &bull; Web Opportunity Rate: <b>{round(((total_found - with_websites)/max(total_found,1))*100)}%</b>", subtitle_style))
    story.append(Spacer(1, 15))

    # Business Table
    story.append(Paragraph(f"Discovered Businesses ({total_found})", h1_style))
    biz_rows = [["Business Name", "Category", "Address", "Phone", "Website Status", "Rating"]]
    for b in businesses[:25]:
        site = b.get("website")
        site_cell = f"<font color='#16a34a'><b>Yes</b></font>" if site else "<font color='#dc2626'><b>No Website</b></font>"
        rating_str = f"{b.get('rating', '—')} ★ ({b.get('review_count', 0)})"
        biz_rows.append([
            Paragraph(f"<b>{b.get('name', '')}</b>", body_style),
            Paragraph(b.get("category", ""), body_style),
            Paragraph(b.get("address", "")[:60], body_style),
            Paragraph(b.get("phone") or "—", body_style),
            Paragraph(site_cell, body_style),
            Paragraph(rating_str, body_style)
        ])

    biz_table = Table(biz_rows, colWidths=[120, 80, 150, 75, 65, 40])
    biz_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(biz_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path
