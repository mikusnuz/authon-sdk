plugins {
    kotlin("jvm") version "1.9.22"
    `maven-publish`
}

group = "dev.authup"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}

java {
    withSourcesJar()
    withJavadocJar()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
            groupId = "dev.authup"
            artifactId = "sdk"
            version = project.version.toString()

            pom {
                name.set("Authup SDK")
                description.set("Official Authup SDK for Kotlin/JVM")
                url.set("https://github.com/mikusnuz/authup-sdk")
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
            }
        }
    }
}
