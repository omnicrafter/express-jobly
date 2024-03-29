"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    // Check if company with handle exists
    const companyCheck = await db.query(
      `SELECT handle 
              FROM companies
              WHERE handle = $1`,
      [companyHandle.toLowerCase()]
    );

    if (!companyCheck.rows[0]) {
      throw new NotFoundError(`Company not found: ${companyHandle}`);
    }

    // Check for duplicate job titles
    const duplicateCheck = await db.query(
      `SELECT title
                  FROM jobs
                  WHERE title = $1 AND company_handle = $2`,
      [title, companyHandle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate Job: ${title}`);

    const result = await db.query(
      `INSERT INTO jobs
              (title, salary, equity, company_handle)
              VALUES ($1, $2, $3, $4)
              RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];
    return {
      id: job.id,
      title: job.title,
      salary: job.salary,
      equity: job.equity,
      companyHandle: job.company_handle,
    };
  }

  /**
   * Find all jobs.
   * 
   * @param {Object} filters - Optional filtering criteria.
   * @param {string} filters.title - Job title must contain this string.
   * @param {number} filters.minSalary - Job must have at least this salary.
   * @param {boolean} filters.hasEquity - Job must have equity > 0.
   * 
  
   */
  static async findAll(filters = {}) {
    let query = `SELECT id, title, salary, equity, company_handle FROM jobs`;
    let whereExpressions = [];
    let queryValues = [];

    const { title, minSalary, hasEquity } = filters;

    if (title) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    const jobsRes = await db.query(query, queryValues);

    const jobs = jobsRes.rows.map((job) => {
      const { company_handle, ...rest } = job;
      return { ...rest, companyHandle: company_handle };
    });

    // Debugging statement to log the result after mapping
    console.log("jobs:", jobs);

    return jobs;
  }
  // Get a job information by id

  static async get(id) {
    const result = await db.query(
      `SELECT id,
        title, salary,
        equity, company_handle
        FROM jobs
        Where id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`No job with id: ${id}`);
    }
    const { company_handle, ...rest } = result.rows[0];
    return { ...rest, companyHandle: company_handle };
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
                              company_handle`;
    const result = await db.query(querySql, [...values, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`No job with id: ${id}`);
    }
    const { company_handle, ...rest } = result.rows[0];
    return { ...rest, companyHandle: company_handle };
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`No job with id: ${id}`);
    }
  }
}

module.exports = Job;
