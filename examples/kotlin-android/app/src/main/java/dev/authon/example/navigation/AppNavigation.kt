package dev.authon.example.navigation

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import dev.authon.example.LocalAuthonService
import dev.authon.example.screens.DeleteAccountScreen
import dev.authon.example.screens.HomeScreen
import dev.authon.example.screens.MfaScreen
import dev.authon.example.screens.ProfileScreen
import dev.authon.example.screens.SessionsScreen
import dev.authon.example.screens.SignInScreen
import dev.authon.example.screens.SignUpScreen
import kotlinx.coroutines.launch

object Routes {
    const val SIGN_IN = "sign_in"
    const val SIGN_UP = "sign_up"
    const val HOME = "home"
    const val PROFILE = "profile"
    const val MFA = "mfa"
    const val SESSIONS = "sessions"
    const val DELETE_ACCOUNT = "delete_account"
    const val OAUTH_CALLBACK = "oauth_callback"
}

@Composable
fun AppNavigation(navController: NavHostController, isAuthenticated: Boolean) {
    val startDestination = if (isAuthenticated) Routes.HOME else Routes.SIGN_IN
    val authonService = LocalAuthonService.current
    val scope = rememberCoroutineScope()

    NavHost(navController = navController, startDestination = startDestination) {

        composable(Routes.SIGN_IN) {
            SignInScreen(
                onSignInSuccess = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.SIGN_IN) { inclusive = true }
                    }
                },
                onNavigateToSignUp = { navController.navigate(Routes.SIGN_UP) },
            )
        }

        composable(Routes.SIGN_UP) {
            SignUpScreen(
                onSignUpSuccess = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.SIGN_IN) { inclusive = true }
                    }
                },
                onNavigateToSignIn = { navController.popBackStack() },
            )
        }

        composable(Routes.HOME) {
            HomeScreen(
                onNavigateToProfile = { navController.navigate(Routes.PROFILE) },
                onNavigateToMfa = { navController.navigate(Routes.MFA) },
                onNavigateToSessions = { navController.navigate(Routes.SESSIONS) },
                onNavigateToDeleteAccount = { navController.navigate(Routes.DELETE_ACCOUNT) },
                onSignOut = {
                    navController.navigate(Routes.SIGN_IN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }

        composable(Routes.PROFILE) {
            ProfileScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.MFA) {
            MfaScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.SESSIONS) {
            SessionsScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.DELETE_ACCOUNT) {
            DeleteAccountScreen(
                onDeleted = {
                    navController.navigate(Routes.SIGN_IN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }

        composable(
            route = "${Routes.OAUTH_CALLBACK}?uri={uri}",
            arguments = listOf(navArgument("uri") { type = NavType.StringType }),
        ) { backStackEntry ->
            val uriString = backStackEntry.arguments?.getString("uri") ?: ""
            var isProcessing by remember { mutableStateOf(true) }

            LaunchedEffect(uriString) {
                scope.launch {
                    runCatching {
                        authonService.handleOAuthCallback(Uri.parse(uriString))
                    }
                    navController.navigate(Routes.HOME) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            }
        }
    }
}
