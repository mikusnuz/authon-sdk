package dev.authon.example.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import dev.authon.example.AuthUser
import dev.authon.example.LocalAuthonService
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToProfile: () -> Unit,
    onNavigateToMfa: () -> Unit,
    onNavigateToSessions: () -> Unit,
    onNavigateToDeleteAccount: () -> Unit,
    onSignOut: () -> Unit,
) {
    val authonService = LocalAuthonService.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var user by remember { mutableStateOf<AuthUser?>(null) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        runCatching { authonService.currentUser() }
            .onSuccess { user = it }
            .onFailure { snackbar.showSnackbar("Failed to load user: ${it.message}") }
        loading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Authon Example", fontWeight = FontWeight.SemiBold) },
                actions = {
                    TextButton(onClick = {
                        scope.launch {
                            authonService.signOut()
                            onSignOut()
                        }
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Sign out")
                        Text("Sign out")
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            if (loading) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    CircularProgressIndicator()
                }
            } else {
                user?.let { u ->
                    UserCard(user = u)
                }

                Spacer(Modifier.height(8.dp))

                Text(
                    text = "Account",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 4.dp),
                )

                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    NavListItem(
                        icon = Icons.Default.Person,
                        label = "Profile",
                        description = "Edit your personal information",
                        onClick = onNavigateToProfile,
                    )
                    NavListItem(
                        icon = Icons.Default.Security,
                        label = "Two-Factor Authentication",
                        description = "Manage MFA settings",
                        onClick = onNavigateToMfa,
                    )
                    NavListItem(
                        icon = Icons.Default.Devices,
                        label = "Active Sessions",
                        description = "Manage signed-in devices",
                        onClick = onNavigateToSessions,
                    )
                }

                Spacer(Modifier.height(8.dp))

                Text(
                    text = "Danger Zone",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(horizontal = 4.dp),
                )

                Button(
                    onClick = onNavigateToDeleteAccount,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer,
                        contentColor = MaterialTheme.colorScheme.onErrorContainer,
                    ),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null)
                    Text("  Delete Account")
                }
            }
        }
    }
}

@Composable
private fun UserCard(user: AuthUser) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            if (!user.avatarUrl.isNullOrBlank()) {
                AsyncImage(
                    model = user.avatarUrl,
                    contentDescription = "Avatar",
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape),
                )
            } else {
                Icon(
                    Icons.Default.AccountCircle,
                    contentDescription = null,
                    modifier = Modifier.size(72.dp),
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }

            Spacer(Modifier.height(12.dp))

            val displayName = user.displayName
                ?: listOfNotNull(user.firstName, user.lastName).joinToString(" ").ifBlank { null }
                ?: user.email
                ?: user.id

            Text(
                text = displayName,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )

            user.email?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.75f),
                )
            }

            Spacer(Modifier.height(4.dp))

            Text(
                text = "ID: ${user.id}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.5f),
            )
        }
    }
}

@Composable
private fun NavListItem(icon: ImageVector, label: String, description: String, onClick: () -> Unit) {
    ListItem(
        headlineContent = { Text(label, fontWeight = FontWeight.Medium) },
        supportingContent = { Text(description, style = MaterialTheme.typography.bodySmall) },
        leadingContent = { Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
        modifier = Modifier.clickable(onClick = onClick),
    )
}
