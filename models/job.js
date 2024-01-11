"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  static async create({ title, salary, equity, company_handle }) {
    // Check if company with handle exists
    const companyCheck = await db.query(
      `SELECT handle 
        FROM companies
        WHERE handle = $1`,
      [company_handle.toLowerCase()]
    );

    if (!companyCheck.rows[0]) {
      throw new NotFoundError(`Company not found: ${company_handle}`);
    }

    // Check for duplicate job titles
    const duplicateCheck = await db.query(
      `SELECT title
            FROM jobs
            WHERE title = $1 AND company_handle = $2`,
      [title, company_handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate Job: ${title}`);

    const result = await db.query(
      `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    return result.rows[0];
  }
}

module.exports = Job;
