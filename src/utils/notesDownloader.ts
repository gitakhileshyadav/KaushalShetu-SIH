import { Course } from '../types';

/**
 * Formats full course notes, curriculum lectures, directives, and competencies
 * into a structured text document suitable for offline reading and printing.
 */
export function generateCourseNotesText(course: Course): string {
  const divider = '='.repeat(78);
  const subDivider = '-'.repeat(78);
  const now = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const lines: string[] = [
    divider,
    'NATIONAL COUNCIL FOR COOPERATIVE TRAINING (NCCT)',
    'Autonomous Society Promoted by Ministry of Cooperation, Govt. of India',
    'Apex Training Network: VAMNICOM Pune & Regional Institutes (RICMs / ICMs)',
    divider,
    '',
    `OFFICIAL COURSE STUDY NOTES & CURRICULUM REFERENCE`,
    `Course Code      : ${course.code}`,
    `Course Title     : ${course.title}`,
    `Subject Sector   : ${course.category.toUpperCase()}`,
    `Nodal Institute  : ${course.institute}`,
    `Lead Faculty     : ${course.trainerName}`,
    `Minimum Pass %   : ${course.minPassPct}%`,
    `Min Attendance   : ${course.minAttendancePct}%`,
    `Generated On     : ${now}`,
    '',
    subDivider,
    'SECTION 1: COURSE OVERVIEW & SYLLABUS SCOPE',
    subDivider,
    course.description || 'Comprehensive cooperative vocational curriculum designed per NCCT standards.',
    '',
    subDivider,
    'SECTION 2: FACULTY INSTRUCTOR DIRECTIVES & DETAILED NOTES',
    subDivider,
    course.notes || 'No specific instructor notes recorded yet. Consult faculty during interactive sessions.',
    '',
    subDivider,
    'SECTION 3: CURRICULUM MODULES & VOCATIONAL COMPETENCIES',
    subDivider
  ];

  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((mod, idx) => {
      lines.push(`\n[MODULE ${idx + 1}] ${mod.title} (${mod.durationMinutes} Minutes)`);
      lines.push(`Description: ${mod.description}`);
      if (mod.learningObjectives && mod.learningObjectives.length > 0) {
        lines.push('Key Competencies:');
        mod.learningObjectives.forEach(obj => lines.push(`  * ${obj}`));
      }
      if (mod.pdfResources && mod.pdfResources.length > 0) {
        lines.push('Associated Study Reference Material:');
        mod.pdfResources.forEach(pdf => lines.push(`  - ${pdf.title} (${pdf.pageCount} Pages, Department: ${pdf.department})`));
      }
    });
  } else {
    lines.push('Curriculum modules delivered in interactive workshop format.');
  }

  if (course.resources && course.resources.length > 0) {
    lines.push('\n' + subDivider);
    lines.push('SECTION 4: ACCREDITED EXTERNAL REFERENCE RESOURCES & SOPs');
    lines.push(subDivider);
    course.resources.forEach((res, i) => {
      lines.push(`${i + 1}. [${res.type.toUpperCase()}] ${res.title}`);
      lines.push(`   URL: ${res.url}`);
    });
  }

  lines.push('\n' + divider);
  lines.push('END OF OFFICIAL STUDY NOTES - NCCT COOPERATIVE VOCATIONAL MISSION');
  lines.push('Official Portal: https://ncct.ac.in • Certification Verified via QR Code');
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Triggers a real browser file download for the course notes.
 */
export function downloadCourseNotesFile(course: Course) {
  const content = generateCourseNotesText(course);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const sanitizedTitle = course.code.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `${sanitizedTitle}_study_notes.txt`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads notes as Markdown formatted file (.md)
 */
export function downloadCourseNotesMarkdown(course: Course) {
  const content = generateCourseNotesMarkdown(course);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const sanitizedTitle = course.code.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `${sanitizedTitle}_study_notes.md`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateCourseNotesMarkdown(course: Course): string {
  const now = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let md = `# ${course.title} (${course.code})
**National Council for Cooperative Training (NCCT)**  
*Ministry of Cooperation, Government of India*  
**Institute:** ${course.institute} | **Faculty Instructor:** ${course.trainerName} | **Date:** ${now}  

---

## 📌 Course Description
${course.description}

---

## 📝 Faculty Instructor Teaching Notes
${course.notes || '_No specific instructor notes recorded._'}

---

## 📚 Curriculum Modules & Competencies
`;

  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((mod, idx) => {
      md += `\n### Module ${idx + 1}: ${mod.title} (${mod.durationMinutes} mins)\n`;
      md += `${mod.description}\n\n`;
      if (mod.learningObjectives && mod.learningObjectives.length > 0) {
        md += `**Vocational Competencies:**\n`;
        mod.learningObjectives.forEach(obj => {
          md += `- ${obj}\n`;
        });
      }
      if (mod.pdfResources && mod.pdfResources.length > 0) {
        md += `\n**PDF Reference Materials:**\n`;
        mod.pdfResources.forEach(pdf => {
          md += `- 📄 **${pdf.title}** (${pdf.pageCount} Pages - ${pdf.department})\n`;
        });
      }
    });
  }

  if (course.resources && course.resources.length > 0) {
    md += `\n---\n\n## 🔗 Reference Resources\n`;
    course.resources.forEach(res => {
      md += `- [${res.type.toUpperCase()}] [${res.title}](${res.url})\n`;
    });
  }

  md += `\n---\n*Certified under National Council for Cooperative Training (NCCT) Vocational Framework.*`;
  return md;
}
