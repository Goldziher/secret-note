# Secret Note Test API

Welcome to the Secret Note test API project.

The project is developed using IntelliJ Idea, and it has a full suite of run configurations set for this IDE. It is
recommended to interact with the project using these run configurations because all required configurations are already
in place.

* After cloning the repository, use `pnpm install` to install the dependencies.
* Build and launch the development server using `docker compose up --build` or using the run IntelliJ run config.

If you wish to run the tests using the terminal, make sure to:

1. Set the required env variables (see the docker-compose.yaml file for these)
2. Launch an instance of postgres with these env variables configured (simply launching the docker compose file will do
   this as well)

Current test coverage is at 100%, you may inspect the CI/CD pipelines to see this output or run `yarn test --coverage`.
