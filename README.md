# Test for Motion (Creative Analytics)

## Running the app

With docker:

- Ensure Docker Daemon is running
- Run the following commands

  ```
  docker build -t motion-test-rami .
  docker run -e FB_TOKEN=<TOKEN> motion-test-rami
  ```

Terminal (without docker):

- Add/update `.env` file with the token (use `env.example`)
- Run the following command(s)
  ```
  yarn dev
  or
  yarn build && yarn start
  ```

## Note

- Assuming that by "rolling hour" Meta means the api usage is reset at the start of every hour.
- Backoff (interval between two api calls) is set to 2 seconds by default. This should avoid throttling, unless there are multiple instances running.
- A preemptive approach has been implemented, where after each api call, the header is inspected - if app usage exceeds 95%, the backoff is doubled to 4 seconds till the usage drops.
- In case of throttling, the next api call will be scheduled to the start of the next hour.
- App has been containerized to allow running on any environment, and possibly running multiple instances.
