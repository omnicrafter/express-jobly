"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Application = require("./application.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("works", async function () {
    const newJob = await db.query(`INSERT INTO jobs
    (title, salary, equity, company_handle)
    VALUES ('testApplicationjob', 100, 0.1, 'c1')
    RETURNING id`);
    console.log(newJob.rows[0]);

    const JobId = newJob.rows[0].id;

    const newApplication = {
      username: "u1",
      jobId: JobId,
    };

    const application = await Application.create(newApplication);
    expect(application).toEqual(newApplication);

    const result = await db.query(
      `SELECT username, job_id
            FROM applications
            WHERE username = 'u1' 
            AND job_id = ${JobId}`
    );
    expect(result.rows).toEqual([
      {
        username: "u1",
        job_id: JobId,
      },
    ]);
  });
});
