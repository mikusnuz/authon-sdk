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
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.authon.example.LocalAuthonService
import kotlinx.coroutines.launch

private const val CONFIRM_PHRASE = "DELETE"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeleteAccountScreen(onDeleted: () -> Unit, onBack: () -> Unit) {
    val authonService = LocalAuthonService.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var confirmText by remember { mutableStateOf("") }
    var showDialog by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { if (!loading) showDialog = false },
            icon = {
                Icon(
                    Icons.Default.DeleteForever,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error,
                )
            },
            title = { Text("Delete Account") },
            text = {
                Text("This action is irreversible. All your data, sessions, and history will be permanently deleted.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        loading = true
                        scope.launch {
                            runCatching { authonService.deleteAccount() }
                                .onSuccess { onDeleted() }
                                .onFailure {
                                    showDialog = false
                                    snackbar.showSnackbar(it.message ?: "Failed to delete account")
                                }
                            loading = false
                        }
                    },
                    enabled = !loading,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) {
                    if (loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onError,
                        )
                    } else {
                        Text("Delete Forever")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }, enabled = !loading) {
                    Text("Cancel")
                }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Delete Account") },
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
                .padding(24.dp)
                .imePadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Spacer(Modifier.height(24.dp))

            Icon(
                Icons.Default.Warning,
                contentDescription = null,
                modifier = Modifier.size(72.dp),
                tint = MaterialTheme.colorScheme.error,
            )

            Text(
                text = "This cannot be undone",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center,
            )

            Text(
                text = "Deleting your account will permanently remove all of your data, including your profile, sessions, and account history.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(8.dp))

            Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "To confirm, type \"$CONFIRM_PHRASE\" below:",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                )

                OutlinedTextField(
                    value = confirmText,
                    onValueChange = { confirmText = it },
                    label = { Text("Type $CONFIRM_PHRASE to confirm") },
                    singleLine = true,
                    isError = confirmText.isNotBlank() && confirmText != CONFIRM_PHRASE,
                    modifier = Modifier.fillMaxWidth(),
                )
            }

            Button(
                onClick = { showDialog = true },
                enabled = confirmText == CONFIRM_PHRASE,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error,
                    disabledContainerColor = MaterialTheme.colorScheme.errorContainer,
                ),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Default.DeleteForever, contentDescription = null)
                Text("  Delete My Account")
            }

            TextButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
                Text("Cancel — Keep My Account")
            }
        }
    }
}
