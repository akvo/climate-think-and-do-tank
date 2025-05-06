# Climate Think and Do Tank

## Development

This document outlines the development setup for the Climate Think and Do Tank project.


### Requirements

* [Docker Compose](https://docs.docker.com/compose/)


### Getting Started

1. **Start the development environment:**

   ```sh
   docker compose up --build -d
   ```

2. **Register the first administrator user:** (Ensure Strapi is running)

   ```sh
   docker compose exec backend npm run strapi admin:create -- -f <Firstname> -e <Email> -p <Password>
   ```

3. **Sync Strapi configurations:** (Stored in the database)

   ```sh
   docker compose exec backend npm run config-sync import -- -y
   ```


### Available Services

* **Frontend (Next.js):** http://localhost:3000
* **Backend (Strapi):** http://localhost:1337
* **pgAdmin4:** http://localhost:5050
* **Mailpit:** http://localhost:8025


### Useful Commands
* **Monitor container logs:**

  ```sh
  docker compose logs -f <container_name>
  ```

* **Stop the development environment:**

  ```sh
  docker compose down
  ```

* **Stop and clean up all data:** (Use `-v` to remove volumes)

  ```sh
  docker compose down -v
  ```


### Technical Notes

#### Strapi Configuration Sync

##### Background

Strapi stores configurations both in files and the database. Database-stored configurations need to
be version-controlled and easily transferable between environments. This project uses the
[config-sync](https://market.strapi.io/plugins/strapi-plugin-config-sync) plugin for this purpose.

For more information, see the [config-sync documentation](https://docs.pluginpal.io/config-sync).

##### User Interface

Access the config sync interface via the Strapi admin panel: **Settings > Config Sync > Interface**
or directly at `<BACKEND_URL>/admin/settings/config-sync`.

##### Sync Workflow

###### During Development

* **Export:** After making configuration changes in the admin panel, export the configuration and commit
  it to Git. Submit a pull request (PR).
* **Import:** After pulling changes from the repository, import the configuration to apply changes made
  by other developers.

###### After Deployment

* **Import:** Immediately import the configuration after deployment. Ensure no configuration changes are
  made directly on the target server.
* **Export and Download:** After making configuration changes, export and download the configuration then
  commit it to the repository. The server configuration will be synced on the next deployment.


#### Environment variables

##### General

This project uses Docker environment variables. See the
[Docker documentation](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/)
for more information.

##### Next.js Public Variables

Next.js allows exposing environment variables to the browser using the `NEXT_PUBLIC_` prefix. However,
these variables are inlined into the JavaScript bundle during `next build`.

This project requires runtime-defined public environment variables which allow building the Docker
images once that can then be reused across multiple environments. This is a common issue with
containerized Next.js development (see [discussion](https://github.com/vercel/next.js/discussions/44628)).

This project uses a custom `docker-entrypoint.sh` script to generate a JavaScript file containing a
dictionary of public environment variables. This file is then loaded by the HTML document before the
client-side JavaScript executes.

See:
* [`frontend/docker-entrypoint.sh`](frontend/docker-entrypoint.sh#L8-L21)
* [`frontend/pages/_document.js`](frontend/pages/_document.js#L10)


#### Using External Services

The project uses external services like an SMTP server for emails and Google Cloud Storage for media
files.

For development efficiency, these external services are not required. The development server uses local
services by default. To test integration with external services:

* Copy `.env.example` to `.env`.
* Set `PLUGIN_PROVIDERS=external`.
* Fill in the required SMTP and Google Cloud service variables.
* Restart the development environment.


#### Running a Local Production Build

The production setup uses Nginx as a reverse proxy, which differs slightly from the development environment.
To test a production build locally:

```sh
docker compose -f compose.mimic-prod.yml up --build -d
```

* **Frontend:** http://localhost
* **Backend:** http://localhost/cms
