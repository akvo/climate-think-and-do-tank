# climate-think-and-do-tank

## Development

### Requirement

* [docker-compose](https://docs.docker.com/compose/)


### Usual commands

* Start the development environment: `docker compose up --build -d`
* Stop: `docker compose down`
* If you want to clean up all the stored data use `-v`: `docker compose down -v`


### Register the first local administrator user

Go to the Strapi app [http://localhost:1337](http://localhost:1337). The app will redirect you to the Register Admin form on your first visit. Complete the form to create your account. Once done, you become the first administrator user of this Strapi application.

You now have access to the admin panel [http://localhost:1337/admin](http://localhost:1337/admin)


### Import configs

Go to


### Available services

* Frontend (Next.js) [http://localhost:3000](http://localhost:3000)
* Backend (Strapi) [http://localhost:1337](http://localhost:1337)
* pgAdmin4 [http://localhost:5050](http://localhost:5050)
* Mailpit [http://localhost:8025](http://localhost:8025)


### Run production build locally


## Technical Notes

### Environment variables

#### General

https://docs.docker.com/reference/compose-file/services/#env_file

compose.yml environment element

#### Next.js public variables

https://github.com/vercel/next.js/discussions/44628


### Strapi configs

https://docs.pluginpal.io/config-sync


### Strapi plugin configs

