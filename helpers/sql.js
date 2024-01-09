const { BadRequestError } = require("../expressError");

// Generate a SQL query for a partial update.

// The function takes an object of data to be updated and an object that maps
// JavaScript-style property names to SQL column names. It returns an object
// containing a string for the SQL SET clause and an array of the new values.

// @example
// sqlForPartialUpdate(
//   { firstName: 'Aliya', age: 32 },
//   { firstName: 'first_name' }
// );
// Returns: { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
