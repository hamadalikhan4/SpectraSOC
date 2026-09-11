from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import getSampleStyleSheet
import os


class PDFReportGenerator:

    def generate_incident_report(
        self,
        incident,
        investigation,
        timeline
    ):

        folder = "reports"

        os.makedirs(folder, exist_ok=True)

        filename = f"{folder}/{incident.incident_id}.pdf"

        doc = SimpleDocTemplate(filename)

        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                "<b>SpectraSOC Incident Report</b>",
                styles["Title"]
            )
        )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                f"<b>Incident ID:</b> {incident.incident_id}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Severity:</b> {incident.severity}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Status:</b> {incident.status}",
                styles["Normal"]
            )
        )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                "<b>Threat Summary</b>",
                styles["Heading2"]
            )
        )

        story.append(
            Paragraph(
                investigation["threat_summary"],
                styles["Normal"]
            )
        )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                "<b>Business Impact</b>",
                styles["Heading2"]
            )
        )

        story.append(
            Paragraph(
                investigation["business_impact"],
                styles["Normal"]
            )
        )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                "<b>Timeline</b>",
                styles["Heading2"]
            )
        )

        for e in timeline:

            story.append(

                Paragraph(

                    f"{e.event_type} : {e.description}",

                    styles["Normal"]

                )

            )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                "<b>Containment</b>",
                styles["Heading2"]
            )
        )

        for item in investigation["containment"]:

            story.append(

                Paragraph(

                    f"• {item}",

                    styles["Normal"]

                )

            )

        story.append(Spacer(1,20))

        story.append(
            Paragraph(
                "<b>Recovery</b>",
                styles["Heading2"]
            )
        )

        for item in investigation["recovery"]:

            story.append(

                Paragraph(

                    f"• {item}",

                    styles["Normal"]

                )

            )

        doc.build(story)

        return filename