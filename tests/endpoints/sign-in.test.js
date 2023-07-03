import { PrismaClient, Prisma } from '@prisma/client'
import request from "supertest"
import app from "../../app.js"

async function cleanupDatabase() {
  const prisma = new PrismaClient();
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  return Promise.all(
    modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany())
  );
}

describe("POST /auth", () => {
  const user = {
    name: 'John',
    email: 'john9@example.com',
    password: 'insecure',
  }

  beforeAll(async () => {
    await cleanupDatabase()

  })

  afterAll(async () => {
    await cleanupDatabase()
  })

  it("with valid data should return accessToken", async () => {
    await request(app)
      .post("/users")
      .send(user)
      .set('Accept', 'application/json')
    const response = await request(app)
      .post("/auth")
      .send(user)
      .set('Accept', 'application/json')
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeTruthy;
  });

  it("with invalid email should not return accessToken", async () => {
    user.email = "uniqueexample.com"
    await request(app)
      .post("/users")
      .send(user)
      .set('Accept', 'application/json')
    const response = await request(app)
      .post("/auth")
      .send(user)
      .set('Accept', 'application/json')
    expect(response.statusCode).toBe(401);
    expect(response.body.accessToken).toBeFalsy;
    expect(response.body.error.email).toBe('is invalid');
  });

  it("with wrong password should not return accessToken", async () => {
    user.password = "123123123"
    await request(app)
      .post("/users")
      .send(user)
      .set('Accept', 'application/json')
    const response = await request(app)
      .post("/auth")
      .send(user)
      .set('Accept', 'application/json')
    expect(response.statusCode).toBe(401);
    expect(response.body.accessToken).toBeFalsy;
    expect(response.body.error.password).toBe(undefined);
  });
})