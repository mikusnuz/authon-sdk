package dev.authon.example.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import dev.authon.example.LocalAuthonService
import dev.authon.example.MfaEnrollResponse
import kotlinx.coroutines.launch

enum class MfaStep { LOADING, DISABLED, ENROLLING, VERIFYING, ENABLED }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MfaScreen(onBack: () -> Unit) {
    val authonService = LocalAuthonService.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var step by remember { mutableStateOf(MfaStep.LOADING) }
    var enrollment by remember { mutableStateOf<MfaEnrollResponse?>(null) }
    var verificationCode by remember { mutableStateOf("") }
    var disableCode by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        runCatching { authonService.currentUser() }
            .onSuccess { user ->
                step = if ((user.metadata?.get("mfaEnabled") as? Boolean) == true)
                    MfaStep.ENABLED else MfaStep.DISABLED
            }
            .onFailure {
                step = MfaStep.DISABLED
            }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Two-Factor Authentication") },
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
                .padding(24.dp),
        ) {
            when (step) {
                MfaStep.LOADING -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }

                MfaStep.DISABLED -> {
                    MfaDisabledView(
                        onEnroll = {
                            loading = true
                            scope.launch {
                                runCatching { authonService.enrollMfa() }
                                    .onSuccess {
                                        enrollment = it
                                        step = MfaStep.ENROLLING
                                    }
                                    .onFailure { snackbar.showSnackbar(it.message ?: "Failed to start enrollment") }
                                loading = false
                            }
                        },
                        loading = loading,
                    )
                }

                MfaStep.ENROLLING -> {
                    enrollment?.let { e ->
                        MfaEnrollingView(
                            enrollment = e,
                            onContinue = { step = MfaStep.VERIFYING },
                        )
                    }
                }

                MfaStep.VERIFYING -> {
                    MfaVerifyView(
                        code = verificationCode,
                        onCodeChange = { verificationCode = it },
                        onVerify = {
                            loading = true
                            scope.launch {
                                runCatching { authonService.verifyMfaEnrollment(verificationCode) }
                                    .onSuccess {
                                        step = MfaStep.ENABLED
                                        verificationCode = ""
                                        snackbar.showSnackbar("MFA enabled successfully")
                                    }
                                    .onFailure { snackbar.showSnackbar(it.message ?: "Invalid code") }
                                loading = false
                            }
                        },
                        loading = loading,
                    )
                }

                MfaStep.ENABLED -> {
                    MfaEnabledView(
                        disableCode = disableCode,
                        onDisableCodeChange = { disableCode = it },
                        onDisable = {
                            loading = true
                            scope.launch {
                                runCatching { authonService.disableMfa(disableCode) }
                                    .onSuccess {
                                        step = MfaStep.DISABLED
                                        disableCode = ""
                                        snackbar.showSnackbar("MFA disabled")
                                    }
                                    .onFailure { snackbar.showSnackbar(it.message ?: "Invalid code") }
                                loading = false
                            }
                        },
                        loading = loading,
                    )
                }
            }
        }
    }
}

@Composable
private fun MfaDisabledView(onEnroll: () -> Unit, loading: Boolean) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Spacer(Modifier.height(32.dp))

        Icon(
            Icons.Default.Security,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(Modifier.height(16.dp))

        Text(
            text = "MFA is disabled",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Enable two-factor authentication to add an extra layer of security to your account.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp),
        )

        Spacer(Modifier.height(32.dp))

        Button(
            onClick = onEnroll,
            enabled = !loading,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                Text("Enable MFA")
            }
        }
    }
}

@Composable
private fun MfaEnrollingView(enrollment: MfaEnrollResponse, onContinue: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = "Scan QR Code",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        AsyncImage(
            model = enrollment.qrCodeUrl,
            contentDescription = "MFA QR Code",
            modifier = Modifier
                .size(220.dp)
                .align(Alignment.CenterHorizontally)
                .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp)),
        )

        Text("Or enter manually:", style = MaterialTheme.typography.labelMedium)

        Text(
            text = enrollment.secret,
            fontFamily = FontFamily.Monospace,
            fontSize = 14.sp,
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                .padding(12.dp),
        )

        if (enrollment.backupCodes.isNotEmpty()) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Backup Codes",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = "Save these codes. Each can be used once if you lose access to your authenticator.",
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                    Spacer(Modifier.height(8.dp))
                    enrollment.backupCodes.chunked(2).forEach { pair ->
                        Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                            pair.forEach { code ->
                                Text(code, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }

        Button(onClick = onContinue, modifier = Modifier.fillMaxWidth()) {
            Text("I've saved these — Continue")
        }
    }
}

@Composable
private fun MfaVerifyView(
    code: String,
    onCodeChange: (String) -> Unit,
    onVerify: () -> Unit,
    loading: Boolean,
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = "Verify Code",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Enter the 6-digit code from your authenticator app to complete enrollment.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        OutlinedTextField(
            value = code,
            onValueChange = { if (it.length <= 6) onCodeChange(it.filter { c -> c.isDigit() }) },
            label = { Text("Verification code") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        Button(
            onClick = onVerify,
            enabled = !loading && code.length == 6,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                Text("Verify & Enable")
            }
        }
    }
}

@Composable
private fun MfaEnabledView(
    disableCode: String,
    onDisableCodeChange: (String) -> Unit,
    onDisable: () -> Unit,
    loading: Boolean,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Spacer(Modifier.height(16.dp))

        Icon(
            Icons.Default.CheckCircle,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary,
        )

        Text(
            text = "MFA is enabled",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Your account is protected with two-factor authentication.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.height(16.dp))

        Text(
            text = "To disable MFA, enter your current authenticator code:",
            style = MaterialTheme.typography.bodyMedium,
        )

        OutlinedTextField(
            value = disableCode,
            onValueChange = { if (it.length <= 6) onDisableCodeChange(it.filter { c -> c.isDigit() }) },
            label = { Text("Authenticator code") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        OutlinedButton(
            onClick = onDisable,
            enabled = !loading && disableCode.length == 6,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                Text("Disable MFA")
            }
        }
    }
}
