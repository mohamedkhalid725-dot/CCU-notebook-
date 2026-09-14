package com.ccunotebook.app;

import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Capacitor auto-loads installed npm plugins from capacitor.plugins.json.
        // Do not manually register FirebaseAuthentication here; duplicate/manual
        // registration can interfere with the generated plugin registry.
        super.onCreate(savedInstanceState);

        // Let Android resize the WebView when the IME opens.
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    }
}
