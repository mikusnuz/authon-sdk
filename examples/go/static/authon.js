/**
 * Authon JS client stub for Go SSR example.
 * Loads @authon/js from CDN and initializes the client with the publishable key
 * injected server-side into window.AUTHON_PUBLISHABLE_KEY.
 *
 * All methods delegate to the underlying @authon/js client.
 */
(function () {
  const CDN_URL = 'https://cdn.jsdelivr.net/npm/@authon/js/dist/index.umd.js';

  function init(AuthonClient) {
    const key = window.AUTHON_PUBLISHABLE_KEY || '';
    const client = new AuthonClient(key);

    window.authon = {
      signInWithEmail: function (email, password) {
        return client.signInWithEmail(email, password);
      },
      signUpWithEmail: function (email, password, meta) {
        return client.signUpWithEmail(email, password, meta);
      },
      signInWithOAuth: function (provider) {
        return client.signInWithOAuth(provider);
      },
      signOut: function () {
        return client.signOut();
      },
      verifyMfa: function (mfaToken, code) {
        return client.verifyMfa(mfaToken, code);
      },
      setupMfa: function () {
        return client.setupMfa();
      },
      verifyMfaSetup: function (code) {
        return client.verifyMfaSetup(code);
      },
      disableMfa: function (code) {
        return client.disableMfa(code);
      },
      getMfaStatus: function () {
        return client.getMfaStatus();
      },
      regenerateBackupCodes: function (code) {
        return client.regenerateBackupCodes(code);
      },
      listSessions: function () {
        return client.listSessions();
      },
      revokeSession: function (sessionId) {
        return client.revokeSession(sessionId);
      },
      sendMagicLink: function (email) {
        return client.sendMagicLink(email);
      },
    };
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = function () {
      if (window.AuthonClient) {
        callback(window.AuthonClient);
      } else if (window.Authon && window.Authon.AuthonClient) {
        callback(window.Authon.AuthonClient);
      } else {
        console.warn('Authon JS SDK loaded but AuthonClient not found on window — using no-op stub');
        initStub();
      }
    };
    script.onerror = function () {
      console.warn('Failed to load Authon JS SDK from CDN — using no-op stub');
      initStub();
    };
    document.head.appendChild(script);
  }

  function initStub() {
    function stub(name) {
      return function () {
        console.warn('authon.' + name + '() called but SDK not loaded');
        return Promise.reject(new Error('Authon SDK not loaded'));
      };
    }
    window.authon = {
      signInWithEmail: stub('signInWithEmail'),
      signUpWithEmail: stub('signUpWithEmail'),
      signInWithOAuth: stub('signInWithOAuth'),
      signOut: stub('signOut'),
      verifyMfa: stub('verifyMfa'),
      setupMfa: stub('setupMfa'),
      verifyMfaSetup: stub('verifyMfaSetup'),
      disableMfa: stub('disableMfa'),
      getMfaStatus: stub('getMfaStatus'),
      regenerateBackupCodes: stub('regenerateBackupCodes'),
      listSessions: stub('listSessions'),
      revokeSession: stub('revokeSession'),
      sendMagicLink: stub('sendMagicLink'),
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadScript(CDN_URL, init);
    });
  } else {
    loadScript(CDN_URL, init);
  }
})();
