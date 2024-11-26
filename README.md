# Skyramp Sample Store API

## Run Server API 
To run the sample Store API server:

1. Build the Docker image:
   ```
   docker compose build api-sample
   ```

2. Start the Docker container:
   ```
   docker compose up -d
   ```

The API server will now be running in a Docker container.

## Test the API
To test and explore the Store API endpoints:

1. Ensure the API server is running (see steps above)

2. Open your web browser and navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

3. You will see the Swagger UI which provides an interactive interface to test the various API endpoints

4. Expand the endpoint sections to see details on required parameters and response formats

5. Click the "Try it out" button to enter parameters and execute requests against the running API server

This allows you to test the functionality of the Store API and ensures it is working as expected before integrating it into other applications.