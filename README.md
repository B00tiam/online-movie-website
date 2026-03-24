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



