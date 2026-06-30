# hiresphere React micro-frontends

hiresphere is a React 19 talent marketplace composed of a persistent gateway shell and eight independently deployable micro-frontends.

| Micro-frontend | Source route | Container image |
| --- | --- | --- |
| Workspace | `/workspace/` | `hiresphere-workspace` |
| Jobs | `/jobs/` | `hiresphere-jobs` |
| Projects | `/projects/` | `hiresphere-projects` |
| Network | `/network/` | `hiresphere-network` |
| Interview | `/interview/` | `hiresphere-interview` |
| Profile | `/profile/` | `hiresphere-profile` |
| HR Studio | `/hr-studio/` | `hiresphere-hr-studio` |
| Scale | `/scale/` | `hiresphere-scale` |

## React architecture

- `src/gateway-main.jsx` owns navigation, theme, global search, roles, and notifications.
- `src/service-main.jsx` contains the service views and React state-driven interactions.
- `src/bridge.js` provides a small same-origin message bridge between the shell and micro-frontends.
- `vite.config.js` builds every component as an isolated static artifact.
- `services/shared/` contains shared design tokens and responsive layout styles.
- `FLOWCHART.md` documents the runtime, backend, deployment, CI/CD, and local Docker flows.

The services keep independent Docker images and Kubernetes Deployments. React is compiled during the image build; production containers serve only optimized static assets through unprivileged Nginx.

## Target deployment stack

Frontend: React.js
Backend: Node.js API service
Database: PostgreSQL
Cache: Redis
File Storage: Separate persistent PostgreSQL volume plus AWS S3 for PDF/images/data
Search: Elasticsearch / OpenSearch
Web Server: Nginx
Deployment: K3s Kubernetes
Monitoring: Uptime + logs
Server: Hostinger VPS KVM 8
Ingress: Nginx Ingress
SSL: cert-manager
Object Storage: AWS S3 for PDF/images/data

## Data storage

The Helm chart deploys PostgreSQL as the system database and the API service as the only backend that receives database credentials.

- PostgreSQL stores accounts, candidate profiles, skills, jobs, applications, projects, milestones, interviews, payments, activity events, and file asset metadata.
- Redis is deployed as the internal cache layer for fast ephemeral platform state.
- OpenSearch is deployed as the internal search engine for future job, profile, project, and document indexing.
- The PostgreSQL pod uses a retained persistent volume claim so data survives pod restarts and Helm upgrades.
- AWS S3 is configured for PDFs, images, documents, exported data, and backup objects.
- Credentials are generated on first Helm install and retained on upgrades. Production clusters can instead reference externally managed Secrets.
- Browser containers serve static React assets through Nginx and never receive database credentials.

## Local development

Requires Node.js 22+.

```bash
npm ci
npm run dev
```

For the complete production-style platform:

```bash
docker compose up --build
```

Open `http://localhost:8080`.

OpenSearch requires `vm.max_map_count=262144` on Linux hosts. Set it before running the full compose or K3s stack:

```bash
sudo sysctl -w vm.max_map_count=262144
```

## Production builds

Build only the gateway:

```bash
npm run build
```

Build all nine React applications:

```bash
npm run build:all
```

Build the static GitHub Pages artifact:

```bash
npm run build:pages
```

Individual component artifacts are written to `.build/<component>/` and copied into production Nginx images by the Dockerfiles.

## Deployment

- Docker Compose builds and runs one gateway, eight micro-frontends, the API service, PostgreSQL, Redis, and OpenSearch.
- The Helm chart deploys the same services to K3s Kubernetes.
- `.github/workflows/ci-cd.yml` compiles React, validates Helm, smoke-tests Docker routes, and publishes selected images.
- CI image publishing is optional. Set repository variable `ENABLE_GHCR_PUBLISH=true` for GitHub Container Registry, or configure `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets for Docker Hub.

Only the gateway publishes a public HTTP route. Internal containers communicate through Kubernetes ClusterIP services.

Install to Hostinger KVM 8 running K3s:

```bash
helm upgrade --install hiresphere charts/hiresphere \
  --namespace hiresphere \
  --values charts/hiresphere/values-hostinger-k3s.yaml \
  --create-namespace \
  --set ingress.hosts[0].host=app.example.com \
  --set ingress.tls[0].hosts[0]=app.example.com \
  --set ingress.tls[0].secretName=hiresphere-tls \
  --set api.appOrigin=https://app.example.com \
  --set storage.s3.bucket=your-s3-bucket \
  --set storage.s3.region=ap-south-1
```

For production, provide pre-created Secrets instead of inline values. The database Secret must contain `postgres-database`, `postgres-username`, and `postgres-password`. The S3 Secret must contain `aws-access-key-id` and `aws-secret-access-key`:

```bash
helm upgrade --install hiresphere charts/hiresphere \
  --namespace hiresphere \
  --create-namespace \
  --set database.auth.existingSecret=hiresphere-database-credentials \
  --set storage.s3.existingSecret=hiresphere-s3-credentials
```

Check the unified database workload:

```bash
kubectl get statefulset,pod,pvc,service \
  -n hiresphere \
  -l app.kubernetes.io/component=database
```
