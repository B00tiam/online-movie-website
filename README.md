# online-movie-website
A deployable online movies watching website. Inspired and modified from the course:
[Full Stack Development with Java Spring Boot, React, and MongoDB](https://youtu.be/5PdEmeopJVQ).
The backend uses Java 21, Spring Boot (Spring MVC), and Spring Data MongoDB to provide REST APIs, 
while the frontend uses React 18, React Router, and Axios to build the user interface, 
incorporating Bootstrap and MUI to achieve a responsive layout.

### Preview:



### For Intellj IDEA users:

For the setting up of the 1st run, open the `Edit Configurations` button, add new `npm` and `Spring Boot` items, 
then add a new `Compound` item, add the `npm` and `Spring Boot` configs just added to the list.

### For Docker deployment:

#### Preparation:

Install Docker and Docker Compose. (better to use [Docker Desktop](https://www.docker.com/products/docker-desktop/))

#### Create new files for Docker:

##### In backend:

Create a `Dockerfile` file in `./backend`:  
```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml pom.xml
COPY src src
RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

##### In frontend:

Create a `Dockerfile` file in `./backend`:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Also create a `nginx.conf` file (settings for route & proxy rules) in `./frontend`:
```config
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:8080/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

##### In root directory:

Create a `docker-compose.yml` file:
```yaml
services:
  backend:
    build:
      context: ./backend
    container_name: movie-backend
    environment:
      MONGO_DATABASE: ${MONGO_DATABASE}
      MONGO_USER: ${MONGO_USER}
      MONGO_PASSWORD: ${MONGO_PASSWORD}
      MONGO_CLUSTER: ${MONGO_CLUSTER}
    ports:
      - "8080:8080"

  frontend:
    build:
      context: ./frontend
    container_name: movie-frontend
    depends_on:
      - backend
    ports:
      - "3000:80"
```
This file contains the Docker configuration for the backend and frontend containers.
Running this will build the backend and frontend images, and run them in Docker containers.

#### Running:

Using the command `docker-compose up --build` in terminal, the backend and frontend containers will be initialized & started.
For the available version, pls switch to the branch '[docker](https://github.com/B00tiam/online-movie-website/tree/docker)'.


### For AWS deployment:

#### Steps for starting the AWS service:

1. Create a new personal AWS account. (if you don't have one)
2. Set up an EC2 instance:
    - Select a server region (e.g., us-east-1).
    - Create a new key pair for SSH access. (type: RSA; format: PEM for Mac/Linux, PPK for Windows)
    - Launch an EC2 instance:
      - Choose an Amazon Machine Image (AMI) (e.g., Amazon Linux 2).
      - Choose the system architecture (e.g., 64-bit).
      - Select an instance type (e.g., t2.micro/t3.micro for free tier, or t4g.micro).
      - Define storage size (e.g., 20 GiB + gp3).
      - Set SSH rules:
      ```
      Security group rule 1 (TCP, 22,  <your IP>/32)     ← SSH
      Security group rule 2 (TCP, 80,  0.0.0.0/0)       ← HTTP
      Security group rule 3 (TCP, 443, 0.0.0.0/0)      ← HTTPS
      ```
    - Allocate an Elastic IP address for the new instance.
    - Connect to the instance using SSH command:
    ```
    ssh -i <path to your key> ec2-user@<your elastic IP>
    ```
3. Install Docker and Compose after login:
    - Update the system:
    ```
    sudo dnf update -y
    ```
    - Install Docker & Git:
    ```
    sudo dnf install -y docker git
    ```
    - Set auto start for Docker:
    ```
    sudo systemctl enable --now docker
    ```
    - Add your account into Docker group: (avoid sudo every time)
    ```
    sudo usermod -aG docker ec2-user
    ```
    - Install Docker Compose (for ARM, t4g instance)
    ```
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    ```
    - Verify the installation:
    ```
    docker --version
    ```
4. Clone the code from branch '[docker](https://github.com/B00tiam/online-movie-website/tree/docker)', 
using the command `git clone -b docker https://github.com/B00tiam/online-movie-website.git`, 
then create the .env file in the root directory using command `nano .env`
5. Login to the [MongoDB Atlas dashboard](https://cloud.mongodb.com/), add your elastic IP address to the whitelist.
6. Switch to the code folder, run command `docker-compose up --build` to start the backend and frontend containers.


### Code structure:

```
.
├─ backend/                 # Spring Boot backend (REST API)
│  ├─ src/main/java/        # Java source code (controller/service/repository)
│  ├─ src/main/resources/   # Config and static resources (application.yml etc.)
│  └─ pom.xml               # Maven config
├─ frontend/                # React frontend (pages & components)
│  ├─ src/                  # React source code (pages/components/routes)
│  ├─ public/               # Static resources & index template
│  └─ package.json          # Npm scripts & dependencies
├─ README.md                # Project description md
└─ .gitignore               # Git ignorance
```


### Tech stack:

#### Backend:

- [Java 21](https://www.oracle.com/java/technologies/downloads/)
- Spring Boot (Spring MVC, providing REST API)
- Spring Data MongoDB (Data access layer / Repository)

#### Frontend:

- React 18 (react / react-dom 18.3.1)
- React Router (react-router-dom)
- Axios (HTTP request)
- Bootstrap 5 (Responsive layout)
- MUI (@mui / material + Emotion)

#### Database:

- [MongoDB](https://www.mongodb.com/)

#### Building & Tooling:

- Maven (Backend building)
- npm + CRA (react-scripts, Frontend building)

#### Testing:

- Testing Library (@testing-library/react / dom / user-event)
- jest-dom


### TODO list:

- [x] Self profile page & update functions for users.
- [ ] Access to review when watching the movie trailers.
- [ ] Enable users to check all of their own reviews.

