import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

val localProps = Properties().also { props ->
    val f = rootProject.file("gradle.properties")
    if (f.exists()) f.inputStream().use { props.load(it) }
}

android {
    namespace = "dev.authon.example"
    compileSdk = 35

    defaultConfig {
        applicationId = "dev.authon.example"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        val publishableKey = localProps.getProperty("AUTHON_PUBLISHABLE_KEY", "pk_test_your_key")
        val apiUrl = localProps.getProperty("AUTHON_API_URL", "https://api.authon.dev")
        val oauthScheme = localProps.getProperty("AUTHON_OAUTH_REDIRECT_SCHEME", "authon-example")

        buildConfigField("String", "AUTHON_PUBLISHABLE_KEY", "\"$publishableKey\"")
        buildConfigField("String", "AUTHON_API_URL", "\"$apiUrl\"")
        buildConfigField("String", "AUTHON_OAUTH_REDIRECT_SCHEME", "\"$oauthScheme\"")

        manifestPlaceholders["authonOAuthScheme"] = oauthScheme
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons)

    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.security.crypto)
    implementation(libs.androidx.browser)

    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.coil.compose)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)

    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
