# Ilam Explore — Frontend

React + Vite frontend for the Ilam Explore tourism project. It consumes the
existing Express backend (see `../backend`) — no backend code is duplicated and
no data is mocked.

## Stack

- React 19 + Vite
- React Router (`react-router-dom`)
- Axios (one shared instance)
- Tailwind CSS v4 (`@tailwindcss/vite`)

## Environment

Copy `.env.example` to `.env` and point it at the running backend:

```
VITE_API_BASE_URL=http://localhost:8000
```

All requests go to `<VITE_API_BASE_URL>/api/v1/...`.

## Scripts

```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # eslint
```

The backend must be running (`cd ../backend && npm run dev`) for places,
place details and reviews to load.

## Folder structure

```
src/
  api/            axios instance + one module per backend resource
    config.js       API base URL, /api/v1 prefix, image URL helper
    axiosClient.js  shared instance (withCredentials), unwrap/error helpers
    auth.api.js     login, register, get-me, logout
    places.api.js   listPlaces (?category, ?search), getPlaceById
    reviews.api.js  listPlaceReviews
  components/
    common/         Loader, ErrorState, EmptyState, CategoryBadge, StarRating
    layout/         Navbar, Footer, MainLayout
    places/         PlaceCard
    reviews/        ReviewCard
  context/        AuthProvider (real cookie session via GET /auth/get-me)
  hooks/          useAuth
  pages/          Home, Places, PlaceDetail, Login, Register,
                  AdminDashboard (placeholder), NotFound
  routes/         AppRoutes, ProtectedRoute
  utils/          format helpers
```

## Backend endpoints used

| Method | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/v1/places` (`?category`, `?search`) | public |
| GET | `/api/v1/places/:id` | public |
| GET | `/api/v1/reviews/place/:placeId` | public |
| POST | `/api/v1/auth/login` | public |
| POST | `/api/v1/auth/register` | public |
| GET | `/api/v1/auth/get-me` | cookie |
| POST | `/api/v1/auth/logout` | cookie |
| GET | `/api/v1/admin/dashboard` | admin (UI not built yet) |

Authentication is cookie based: the backend sets HttpOnly `accessToken` /
`refreshToken` cookies, so the axios instance uses `withCredentials: true`.
CORS must allow the frontend origin (`ALLOWED_ORIGINS` is empty by default in
the backend, which reflects any origin outside production).

## Phase status

Implemented: layout/navbar/footer, routing, axios client, auth context, Home,
Places (real data + category/search filters), Place Detail (images, visit info,
things to do, real reviews), Login, Register, `/admin` guard + placeholder, 404.

Not implemented yet: admin dashboard UI (stats, place CRUD, review moderation),
review submit/edit forms, profile page.
