"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

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

  /**
   * Find all jobs.
  
   */
  static async findAll() {
    let query = `SELECT id,
                        title,
                      salary,
                     equity,
                      company_handle AS "companyHandle"
               FROM jobs`;

    const jobsRes = await db.query(query);
    return jobsRes.rows;
  }
  // Get a job information by id

  static async get(id) {
    const result = await db.query(
      `SELECT id,
        title, salary,
        equity, company_handle AS "companyHandle"
        FROM jobs
        Where id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`No job with id: ${id}`);
    }
    return result.rows[0];
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                    SET ${setCols}
                    WHERE id = ${idVarIdx}
                    RETURNING id,
                              title,
                              salary,
                              equity,
                              company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`No job with id: ${id}`);
    }
    return result.rows[0];
  }
}

module.exports = Job;
