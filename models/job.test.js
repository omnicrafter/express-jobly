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

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
      },
    ]);
  });
});

describe("get", function () {
  test("works: find by id", async function () {
    const res =
      await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('test_job', 100, .5, 'c1')
        RETURNING id`);

    const jobId = res.rows[0].id;
    let job = await Job.get(jobId);

    expect(job.id).toEqual(jobId);

    expect(job).toEqual({
      id: expect.any(Number),
      title: "test_job",
      salary: 100,
      equity: "0.5",
      companyHandle: "c1",
    });
  });

  test("works: find nonexistent id", async function () {
    try {
      const res = await Job.get(99999999);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy;
    }
  });
});

describe("update", function () {
  test("works", async function () {
    const res =
      await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ('test_job', 100, .5, 'c1')
          RETURNING id`);

    const jobId = res.rows[0].id;
    let job = await Job.update(jobId, { title: "updated_job" });

    expect(job.id).toEqual(jobId);

    expect(job).toEqual({
      id: expect.any(Number),
      title: "updated_job",
      salary: 100,
      equity: "0.5",
      companyHandle: "c1",
    });
  });

  test("works: null fields", async function () {
    const res =
      await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ('test_job', 100, .5, 'c1')
          RETURNING id`);

    const jobId = res.rows[0].id;
    let job = await Job.update(jobId, { title: "updated_job", salary: null });

    expect(job.id).toEqual(jobId);

    expect(job).toEqual({
      id: expect.any(Number),
      title: "updated_job",
      salary: null,
      equity: "0.5",
      companyHandle: "c1",
    });
  });

  test("works: nonexistent id", async function () {
    try {
      const res = await Job.update(99999999, { title: "updated_job" });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy;
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    const res =
      await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ('test_job', 100, .5, 'c1')
          RETURNING id`);

    const jobId = res.rows[0].id;
    await Job.remove(jobId);

    const result = await db.query(`SELECT id FROM jobs WHERE id = ${jobId}`);
    expect(result.rows.length).toEqual(0);
  });

  test("works: nonexistent id", async function () {
    try {
      const res = await Job.remove(99999999);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy;
    }
  });
});
