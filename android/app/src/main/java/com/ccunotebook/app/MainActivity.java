package com.ccunotebook.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        // One-time native cleanup for installations that previously used the PWA
        // service worker. This preserves localStorage/IndexedDB patient data while
        // removing stale Cache API entries and unregistering old service workers.
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            WebView webView = getBridge().getWebView();
            if (webView == null) return;

            String cleanupScript = "" +
                    "(async function(){" +
                    "try{" +
                    "if('serviceWorker' in navigator){" +
                    "const regs=await navigator.serviceWorker.getRegistrations();" +
                    "await Promise.all(regs.map(r=>r.unregister()));" +
                    "}" +
                    "if('caches' in window){" +
                    "const keys=await caches.keys();" +
                    "await Promise.all(keys.map(k=>caches.delete(k)));" +
                    "}" +
                    "location.reload();" +
                    "}catch(e){console.warn('CardioVault cache cleanup failed',e);}" +
                    "})();";

            webView.evaluateJavascript(cleanupScript, null);
        }, 1200);
    }
}
