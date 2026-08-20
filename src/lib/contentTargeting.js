const KNOWN_BRANCHES = ['CSE', 'ECE', 'IT', 'AI', 'MECH', 'CIVIL'];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Derive branch code from a section like "CSE-A" or a raw branch "CSE". */
export function parseBranch(sectionOrBranch) {
  if (!sectionOrBranch) return '';
  const s = String(sectionOrBranch).trim().toUpperCase();
  const known = KNOWN_BRANCHES.find(
    (b) => s === b || s.startsWith(`${b}-`) || s.startsWith(`${b} `)
  );
  if (known) return known;
  const first = s.split(/[-_\s]/)[0];
  return first || '';
}

/**
 * Mongo filter: content is visible to a student only when
 * - section matches their class (CSE-A), or
 * - section is empty AND branch matches their branch (CSE).
 * Untargeted documents (no section, no branch) are never shown to students.
 */
export function mongoAudienceFilter(studentSection) {
  const section = String(studentSection || '').trim();
  const branch = parseBranch(section);
  const clauses = [];

  if (section) {
    clauses.push({ section: new RegExp(`^${escapeRegex(section)}$`, 'i') });
  }
  if (branch) {
    clauses.push({
      $and: [
        { $or: [{ section: '' }, { section: null }, { section: { $exists: false } }] },
        { branch: new RegExp(`^${escapeRegex(branch)}$`, 'i') },
      ],
    });
  }

  if (!clauses.length) return { _id: { $in: [] } };
  return { $or: clauses };
}

export function matchesStudentAudience(item, studentSection) {
  if (!item) return false;
  const section = String(studentSection || '').trim().toUpperCase();
  const branch = parseBranch(section);
  const itemSection = String(item.section || '').trim().toUpperCase();
  const itemBranch = String(item.branch || '').trim().toUpperCase();

  if (itemSection && section && itemSection === section) return true;
  if (!itemSection && itemBranch && branch && itemBranch === branch) return true;
  return false;
}
