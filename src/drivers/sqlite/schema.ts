export const SCHEMA = `
CREATE TABLE IF NOT EXISTS sheets (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS cells (
  sheet_name TEXT NOT NULL,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  value TEXT,
  PRIMARY KEY (sheet_name, row, col),
  FOREIGN KEY (sheet_name) REFERENCES sheets(name) ON DELETE CASCADE
);
`;
