package dev.authon.example

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import dev.authon.example.navigation.AppNavigation

val LocalAuthonService = compositionLocalOf<AuthonService> {
    error("AuthonService not provided")
}

class MainActivity : ComponentActivity() {

    private lateinit var authonService: AuthonService
    private var navController: NavHostController? = null
    private var pendingOAuthUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        authonService = AuthonService(this)

        setContent {
            AuthonTheme {
                val navController = rememberNavController().also { this.navController = it }
                CompositionLocalProvider(LocalAuthonService provides authonService) {
                    AppNavigation(
                        navController = navController,
                        isAuthenticated = authonService.tokenStorage.accessToken != null,
                    )
                }
            }
        }

        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val uri = intent?.data ?: return
        val scheme = BuildConfig.AUTHON_OAUTH_REDIRECT_SCHEME
        if (uri.scheme == scheme && uri.host == "callback") {
            navController?.navigate("oauth_callback?uri=${Uri.encode(uri.toString())}")
        }
    }
}

private val AuthonDarkColorScheme = darkColorScheme(
    primary = Color(0xFF6C63FF),
    onPrimary = Color.White,
    primaryContainer = Color(0xFF3B3580),
    onPrimaryContainer = Color(0xFFE4DFFF),
    secondary = Color(0xFF9B8FF5),
    onSecondary = Color.White,
    background = Color(0xFF0D0D0D),
    onBackground = Color(0xFFE8E8E8),
    surface = Color(0xFF1A1A2E),
    onSurface = Color(0xFFE8E8E8),
    surfaceVariant = Color(0xFF252540),
    onSurfaceVariant = Color(0xFFB0AECC),
    error = Color(0xFFFF6B6B),
    onError = Color.White,
    outline = Color(0xFF44445A),
)

private val AuthonLightColorScheme = lightColorScheme(
    primary = Color(0xFF5A52D5),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE4DFFF),
    onPrimaryContainer = Color(0xFF1A0F6C),
    secondary = Color(0xFF7C71E0),
    onSecondary = Color.White,
    background = Color(0xFFFAFAFC),
    onBackground = Color(0xFF1A1A2E),
    surface = Color.White,
    onSurface = Color(0xFF1A1A2E),
    surfaceVariant = Color(0xFFF0EFF8),
    onSurfaceVariant = Color(0xFF44445A),
    error = Color(0xFFD32F2F),
    onError = Color.White,
    outline = Color(0xFFCCCCDD),
)

@Composable
fun AuthonTheme(content: @Composable () -> Unit) {
    val colorScheme = if (isSystemInDarkTheme()) AuthonDarkColorScheme else AuthonLightColorScheme
    MaterialTheme(colorScheme = colorScheme, content = content)
}
