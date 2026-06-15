type Database = {
  prepare: (sql: string) => any;
  run: (sql: string, params?: any[]) => void;
};

// Helper to run a query and get results
export function query(db: Database, sql: string, params?: any[]): any[] {
  const stmt = db.prepare(sql);
  if (params) {
    stmt.bind(params);
  }
  
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

// Helper to get a single row
export function get(db: Database, sql: string, params?: any[]): any {
  const results = query(db, sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper to run a statement and get lastInsertRowid/changes
export function run(db: Database, sql: string, params?: any[]): { lastInsertRowid: number, changes: number } {
  db.run(sql, params);
  const rowidResult = query(db, 'SELECT last_insert_rowid() as lastInsertRowid');
  const changesResult = query(db, 'SELECT changes() as changes');
  
  return {
    lastInsertRowid: rowidResult[0]?.lastInsertRowid || 0,
    changes: changesResult[0]?.changes || 0
  };
}
