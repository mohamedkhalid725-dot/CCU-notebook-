package com.ccunotebook.app;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus(View.FOCUS_DOWN);

        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        webView.addJavascriptInterface(new KeyboardBridge(webView), "AndroidKeyboard");
    }

    private static final class KeyboardBridge {
        private final WebView webView;

        KeyboardBridge(WebView webView) {
            this.webView = webView;
        }

        @JavascriptInterface
        public void showKeyboard() {
            webView.post(() -> {
                webView.requestFocus(View.FOCUS_DOWN);
                InputMethodManager imm = (InputMethodManager) webView.getContext()
                        .getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm != null) {
                    imm.showSoftInput(webView, InputMethodManager.SHOW_IMPLICIT);
                }
            });
        }
    }
}
