"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
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
  const newJob = {
    title: "new job",
    salary: 1000,
    equity: 0.25,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    job.equity = parseFloat(job.equity);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'new job'`
    );
    console.log(result.rows);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new job",
        salary: 1000,
        equity: "0.25",
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
