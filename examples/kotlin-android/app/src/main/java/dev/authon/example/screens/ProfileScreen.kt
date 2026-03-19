package dev.authon.example.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import dev.authon.example.AuthUser
import dev.authon.example.LocalAuthonService
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(onBack: () -> Unit) {
    val authonService = LocalAuthonService.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var user by remember { mutableStateOf<AuthUser?>(null) }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }

    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var changingPassword by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        runCatching { authonService.currentUser() }
            .onSuccess { u ->
                user = u
                firstName = u.firstName ?: ""
                lastName = u.lastName ?: ""
                username = u.username ?: ""
            }
            .onFailure { snackbar.showSnackbar("Failed to load profile: ${it.message}") }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
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
                .padding(horizontal = 24.dp)
                .imePadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Spacer(Modifier.height(8.dp))

            Text(
                text = "Personal Information",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )

            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("First name") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Last name") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                supportingText = { Text("Unique handle for your account") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            user?.email?.let { email ->
                OutlinedTextField(
                    value = email,
                    onValueChange = {},
                    label = { Text("Email") },
                    readOnly = true,
                    enabled = false,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }

            Button(
                onClick = {
                    saving = true
                    scope.launch {
                        runCatching {
                            authonService.updateProfile(
                                firstName = firstName,
                                lastName = lastName,
                                username = username,
                            )
                        }
                            .onSuccess {
                                user = it
                                snackbar.showSnackbar("Profile updated")
                            }
                            .onFailure { snackbar.showSnackbar(it.message ?: "Update failed") }
                        saving = false
                    }
                },
                enabled = !saving,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (saving) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                } else {
                    Text("Save Changes")
                }
            }

            Spacer(Modifier.height(8.dp))
            HorizontalDivider()
            Spacer(Modifier.height(8.dp))

            Text(
                text = "Change Password",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )

            OutlinedTextField(
                value = currentPassword,
                onValueChange = { currentPassword = it },
                label = { Text("Current password") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                label = { Text("New password") },
                visualTransformation = PasswordVisualTransformation(),
                supportingText = { Text("Minimum 8 characters") },
                isError = newPassword.isNotBlank() && newPassword.length < 8,
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            Button(
                onClick = {
                    changingPassword = true
                    scope.launch {
                        runCatching {
                            authonService.changePassword(currentPassword, newPassword)
                        }
                            .onSuccess {
                                currentPassword = ""
                                newPassword = ""
                                snackbar.showSnackbar("Password changed successfully")
                            }
                            .onFailure { snackbar.showSnackbar(it.message ?: "Failed to change password") }
                        changingPassword = false
                    }
                },
                enabled = !changingPassword && currentPassword.isNotBlank() && newPassword.length >= 8,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (changingPassword) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                } else {
                    Text("Change Password")
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}
