export function accountName(profileName?: string | null, email?: string | null) {
  return profileName?.trim() || email?.split('@')[0] || 'Guest';
}

export function accountInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}