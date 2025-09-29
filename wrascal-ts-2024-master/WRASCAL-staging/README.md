# WRASCAL

Backend repo: [WhitmanCSCapstone/wrascal-ts-2024](https://github.com/WhitmanCSCapstone/wrascal-ts-2024)

## Application Structure
The current generation of WRASCAL is contained in two repos; [WhitmanCSCapstone/WRASCAL](https://github.com/WhitmanCSCapstone/WRASCAL) for the front end and [WhitmanCSCapstone/wrascal-ts-2024](https://github.com/WhitmanCSCapstone/wrascal-ts-2024) for the back end. 

### Front End
The front end application is written in Vue.js and attaches to the following services:
- `wrascal-ts-2024`, which hosts the API responsible for performing all CRUD operations on the database
- The Supabase project, which hosts the database itself as well as providing API endpoints for handling user registration and authentication.

#### Running the Front End
1. If this is your first time cloning the repo, first run `npm install` to retrieve and install the dependencies.
2. Execute the command `npm run dev`



> [!NOTE]  Note
> For a quick primer on Supabase, check out this video: [Supabase in 100 Seconds - YouTube](https://www.youtube.com/watch?v=zBZgdTb-dns)

### Back End
The back-end service is an API written in Typescript using the [Ts.ED](https://tsed.io/) framework. The project defines a series of _models_ and _controllers_, which define data types and construct SQL queries, respectively. Working with these models requires some basic knowledge of [TypeORM](https://typeorm.io/), which maps the table columns of the database to fields inside Typescript objects.

#### Running the Back End
There are a number of ways to run the back end service, either directly using `yarn` or via docker compose with the Dockerfile in the root directory. This documentation will focus on running with `yarn`, as docker compose is not currently working.

**To run the back end with yarn:**
``` 
# install dependencies
$ yarn install

# serve
$ yarn start

# build for production
$ yarn build
$ yarn start:prod
```


> [!Warning] Warning
> Running the service via `yarn start` without performing a full build may result in unknowingly implementing bugs which make the service undeployable.  In other words, just because the service starts via `yarn start` does not mean it will build and deploy successfully. To avoid this, occasionally run `yarn build` and `yarn start:prod` in order to weed out such errors.


## Deployment
To change the base url of the back end, modify the string inside the `baseURL` variable in `src/axiosClient.ts`

``` ts
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ADDR ?? "http://127.0.0.1:8083/rest"
})
```

### Supabase
Both the database and the authentication service are currently hosted using Supabase. However, being an open source platform, this entire project can be exported as a docker container and hosted anywhere (see ([Self-Hosting | Supabase Docs](https://supabase.com/docs/guides/self-hosting)). The container will run both the Postgres database as well as the authentication/user management API.

#### SMTP Server
One factor that might complicate the deployment of the Supabase service is the fact that the authentication service needs an email (SMTP) server in order to send verification/password reset emails to users. The current deployment utilizes Supabase's SMTP service, but this is rate limited and not intended for a production deployment. 

Therefore, future teams focusing on deployment will need to figure out a solution for hosting an SMTP server to handle these authentication-related tasks. Once a server is set up, it is relatively simple to link it to the Supabase project (see [Configure a Custom SMTP | Supabase Docs](https://supabase.com/docs/guides/auth/auth-smtp))

## Managing Users
Each time a new ligand is entered by a user, their universally unique identifier (uuid) is recorded as a string along with a date/time stamp in the `constants_user_gen` table.

When displaying a user-generated entry in the search results, the app will reference this uuid to retrieve the profile of that user.


## Project setup

```
# yarn
yarn

# npm
npm install

# pnpm
pnpm install
```

### Compiles and hot-reloads for development

```
# yarn
yarn dev

# npm
npm run dev

# pnpm
pnpm dev
```

### Compiles and minifies for production

```
# yarn
yarn build

# npm
npm run build

# pnpm
pnpm build
```

### Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).

# Deployment Notes

The frontend service is deployed using the `vite` service. The deployment configuration can be found in the `vite.config.ts` file. The deployment configuration can be modified to change the deployment settings. The service is deployed on the `render` platform. render is easy and straight forward and Documentation for the `render` platform can be found [here](https://render.com/docs).

The backend service is using the `axios` service. The base url for the backend service can be supplied via the following environment variable:

```ts
VITE_BACKEND_ADDR = "<backend-url>";
```

The backend service is also credentialed using the `supabase` service, which is used for user authetificaiton. The credentials for the supabase service can be suplied via the following environment variables:

```ts
VITE_SUPABASE_URL = "https://<supabase-url>.supabase.co";
VITE_SUPABASE_KEY = "<supabase-key>";
```

For this deployment, the login and signup pages are disabled. To enable them, do the following:

uncomment the following lines in `src/routes/index.ts`:

```ts
// NOTE: The following routes are for future development. uncomment when needed

// {
//   path: 'login',
//   name: 'Log In',
//   component: () => import('@/views/LoginPage.vue')
// },
// {
//   path: "register",
//   name: "Register",
//   component: () => import("@/views/RegisterPage.vue"),
// },
// {
//   path: "new-entry",
//   name: "New Entry",
//   component: () => import("@/views/NewEntry.vue"),
// },
```

- Enable the login, logout, new-entry and register buttons by removing `disabled` in the vite btn components in `src/components/App.vue`:

  - Login [<v-btn v-if="!authStore.isLoggedIn" @click="login" `disabled`color="grey"](https://github.com/WhitmanCSCapstone/WRASCAL/blob/131fb44d12795fc971ab2b675c8f4420f68395e1/src/App.vue#L35-L55)
  - Logout [<v-btn v-if="authStore.isLoggedIn" @click="logout" `disabled` color="grey"](https://github.com/WhitmanCSCapstone/WRASCAL/blob/131fb44d12795fc971ab2b675c8f4420f68395e1/src/App.vue#L35-L55)
  - New-entry [<v-btn v-if="authStore.isLoggedIn" @click="newEntry" `disabled` color="grey" >New Entry</v-btn>"](https://github.com/WhitmanCSCapstone/WRASCAL/blob/131fb44d12795fc971ab2b675c8f4420f68395e1/src/App.vue#L35-L55)
  - Register [<v-btn v-if="!authStore.isLoggedIn" @click="register" `disabled` color="grey">Register</v-btn>](https://github.com/WhitmanCSCapstone/WRASCAL/blob/131fb44d12795fc971ab2b675c8f4420f68395e1/src/App.vue#L35-L55)

## Database Configuration

The user data is stored in a supabase-hosted postgreSQL database. The database configuration can be found in the `src/store/authStore.ts` file. The database configuration can be modified to change the database settings. The service is deployed on the `supabase` platform. supabase is easy and straightforward and Documentation for the `supabase` platform can be found [here](https://supabase.io/docs). The database is configured to store the user data in the same table as the ligand in the auth schema where as in the ligands table is in the public schema.

This app is using a backend that is deployed on render for the ligands and using supabase as a standalone service for authentication. To test user authentication, you can create a supabase and follow documentation for their authentication service. Then supply the `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` environment variables in the `.env` file.

The database on the render service is strictly for ligands and the database on the supabase service is strictly for user authentication. But this can be changed and all user data can also be written to the render database. To do so, you can have the supabase service write to the render database, or you can use a different service to store user data. User generated data (new entries) is stored in the render database. The data is stored in the schema `public` in the tables ending with `_user_gen`.
