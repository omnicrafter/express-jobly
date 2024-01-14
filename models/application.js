"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Application {
  static async create({ username, jobId }) {
    // Check if username with jobId exists
    const applicationCheck = await db.query(
      `SELECT username, job_id 
            FROM applications
            WHERE username = $1 AND job_id = $2`,
      [username, jobId]
    );
    if (applicationCheck.rows[0]) {
      throw new BadRequestError(
        `Application already exists: ${username}, ${jobId}`
      );
    }

    const result = await db.query(
      `INSERT INTO applications
            (username, job_id) 
            VALUES ($1, $2) 
            RETURNING username, job_id AS jobId`,
      [username, jobId]
    );

    return result.rows[0];
  }
}
