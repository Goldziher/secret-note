# Secret Note Test API

Welcome to the Secret Note test API project.

The project is developed using IntelliJ Idea, and it has a full suite of run configurations set for this IDE. It is
recommended to interact with the project using these run configurations because all required configurations are already
in place.

* After cloning the repository, use `pnpm install` to install the dependencies. Note: If you do not have pnpm installed
  on your system, install it first with `npm i -g pnpm`.
* Build and launch the development server using `docker compose up --build` or using the run IntelliJ run config.

If you wish to run the tests using the terminal, make sure to:

To run the tests locally you should run a local instance of postgres DB.
Once you have it in place, run the prisma migrations
with `DATABASE_URL=<insert connection string here>  npx prisma migrate dev --name init`. You can then execute the test
suite with `DATABASE_URL=<insert connection string here> pnpm run test --coverage`.
