# Start with Maven to build the app
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy everything and build the JAR
COPY . .
RUN mvn clean install -DskipTests

# Stage 2 - run the app with JDK only
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy JAR from previous stage
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
