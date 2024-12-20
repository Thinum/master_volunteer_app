<br/>
  
# Training Center Management with Spring Boot, Angular, and MySQL
  
</div>




## Overview

This project is a web application developed as part of a module's final project, The goal is to create a system for efficiently managing a training center. The technologies used include Spring Boot for the backend, Angular for the frontend, and MySQL for database storage.

## Objectives

- **Store and manage training project documents efficiently:** Develop a system to effectively handle and organize documents related to training projects.

- **Plan training sessions and allocate trainers appropriately:** Create a scheduling mechanism for training sessions and ensure trainers are assigned based on their expertise and availability.

## Details

1. **Authentication Interface:**
   - Create an authentication interface for the roles: admin, formateur, and assistant.

2. **Admin Adds Formation:**
   - Allow the admin to add a new formation for the public, specifying details such as duration, cost, objectives, and a detailed program.

3. **Admin Adds Formateurs:**
   - Enable the admin to add formateurs, specifying a set of keywords that characterize their skills. Also, include a remarks field.

4. **Admin/Assistant Adds Entreprises:**
   - Allow the admin or assistant to add a list of entreprises, specifying name, address, phone, URL, and email.

5. **Admin/Assistant Plans Formation:**
   - Enable the admin or assistant to plan a new formation by assigning a formateur and an entreprise to a set of dates.

6. **Individuals Registration for Formation:**
   - If the formation is for individuals, allow them to register (providing name, surname, date of birth, city, email, and phone) via a dedicated form on the homepage. Admin or assistant then assigns the formateur to the group of individuals.

7. **Public Homepage:**
   - The homepage is public and displays all formations added by the admin. Include simple filters for formation category, and date.

8. **Participant Evaluation:**
   - Participants receive a link to an evaluation form where they rate the formateur on pedagogical quality, pace, course and practical work support, and subject mastery.

9. **External Formateur Interest:**
   - Allow external formateurs to express interest in conducting a formation by registering on the platform and providing keywords reflecting their profile.

10. **Considerations:**
    - Consider aspects such as ergonomics, graphic design, layered modeling and security.


## Technologies Used

- **Backend:** Spring Boot
- **Frontend:** Angular
- **Database:** MySQL

## Prerequisites

Before you begin, ensure you have the following installed:

- Java Development Kit (JDK)
- Node.js and npm
- Angular CLI
- MySQL Server
- Lombok: Java library to reduce boilerplate code, making development cleaner and more concise.
- Xampp

## Development Environment

- **Spring Tool Suite (STS):** An integrated development environment for building, testing, and deploying Spring applications.
- **PHPMyAdmin:** Web-based tool for managing MySQL databases.
- **Visual Studio Code**

## Getting Started

1. Fork then clone the repository

    ```bash
    git clone https://github.com/<YOUR-GITHUB-USERNAME>/SpringBoot-Angular-TrainingCenter-Management.git
    ```

2. Set up the backend: Just open the project on STS, It will automatically built and compile, if anything just then search for Maven Install and click it.

3. Set up the frontend

   ```bash
   cd angular-frontend
   npm install
   ```
> If it didn't work for some reason, download and unzip node_modules.rar in unzip it in angular -frontend, here's the [Link to download](https://drive.google.com/drive/folders/1T1bHVZHut04A0udNwZhJ1waRtQm76RiE)

4. Set up the database:

   - Create a MySQL database, name it: `gestion_centre_formation` .

5. Run the application:

   - Start the Spring Boot backend in STS.
   - Start the Angular frontend `ng serve --open`.


## License

This project operates under the **MIT License**. Refer to the [LICENSE](LICENSE) file for detailed information.



