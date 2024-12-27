export function compareDataTypes(existing: string[], newTypes: string[]) {
  const existingSet = new Set(existing);
  const newSet = new Set(newTypes);
  
  return {
    // Find types that exist in newSet but not in existingSet
    added: newTypes.filter(type => !existingSet.has(type)),
    
    // Find types that exist in existingSet but not in newSet
    removed: existing.filter(type => !newSet.has(type))
  };
}