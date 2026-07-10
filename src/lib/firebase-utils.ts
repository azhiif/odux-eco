export function serializeData(data: any): any {
  if (data === null || data === undefined) return data;
  
  // Handle Firebase Timestamps
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeData);
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      serialized[key] = serializeData(data[key]);
    }
    return serialized;
  }
  
  return data;
}

export function serializeDoc(doc: any) {
  return {
    id: doc.id,
    ...serializeData(doc.data())
  };
}
