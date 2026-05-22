FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY pom.xml pom.xml
COPY src src

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

ENV TZ=Europe/Madrid
ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Europe/Madrid"

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
