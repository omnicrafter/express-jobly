"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  uAdminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newTestJob",
    salary: 100,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${uAdminToken}`);
    console.log(resp.body);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "newTestJob",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100,
      })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('newTestJob', 100, 0.1, 'c1')`);
    const resp = await request(app).get("/jobs");

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "newTestJob",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("title filter works", async function () {
    db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('newTestTitleJob', 100, 0.2, 'c1')`);

    const resp = await request(app).get("/jobs?title=newt");

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "newTestTitleJob",
          salary: 100,
          equity: "0.2",
          companyHandle: "c1",
        },
      ],
    });
  });
});
