const ACCESS_RULES = {
  student: ['search', 'map', 'download'],
  professor: ['search', 'map', 'download', 'upload'],
  guest: ['map'],
  admin: ['search', 'map', 'download', 'upload'],
};

export function canAccess(feature, role) {
  if (!role) return false;
  const sourceRole = String(role).toLowerCase();
  const normalizedRole = sourceRole === 'faculty' ? 'professor' : sourceRole;
  return ACCESS_RULES[normalizedRole]?.includes(feature) || false;
}
