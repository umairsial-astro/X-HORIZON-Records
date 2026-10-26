/* @odoo-module */
//
// This file is meant to regroup your javascript code. You can either copy/past
// any code that should be executed on each page loading or write your own
// taking advantage of the Odoo framework to create new behaviors or modify
// existing ones. For example, doing this will greet any visitor with a 'Hello,
// world !' message in a popup:
//
/*
import { ConfirmationDialog } from '@web/core/confirmation_dialog/confirmation_dialog';
import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

class HelloWorldPopup extends Interaction {
    static selector = "#wrapwrap";

    start() {
        this.services.dialog.add(ConfirmationDialog, { body: "hello world"});
    }
}

registry
    .category("public.interactions")
    .add("website.hello_world_popup", HelloWorldPopup);
*/
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  window.XHorizonFirebaseReady = async function () {
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");

    var firebaseConfig = {
      apiKey: "AIzaSyBgwCB5yG7tBka2VYpwmcd-iAObtxQdIPk",
      authDomain: "learning-posts.firebaseapp.com",
      projectId: "learning-posts",
      storageBucket: "learning-posts.firebasestorage.app",
      messagingSenderId: "400519896357",
      appId: "1:400519896357:web:45ebf4163e0a1dd6cb0ecc",
      measurementId: "G-6FLXBXSRSP"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    return firebase;
  };

  window.XHorizonAdmin = window.XHorizonAdmin || {};

  window.XHorizonAdmin.sha256 = async function (text) {
    const data = new TextEncoder().encode(String(text || ""));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  window.XHorizonAdmin.unlock = async function (adminKey, onSuccess) {
    try {
      if (!adminKey || !String(adminKey).trim()) {
        alert("Admin key is empty.");
        return false;
      }

      await window.XHorizonFirebaseReady();

      const keyHash = await window.XHorizonAdmin.sha256(adminKey.trim());

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await firebase.firestore()
        .collection("adminSessions")
        .doc("global")
        .set({
          keyHash: keyHash,
          active: true,
          unlockedAt: firebase.firestore.FieldValue.serverTimestamp(),
          expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt)
        });

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      return true;
    } catch (err) {
      console.error("Admin unlock failed:", err);
      alert("Wrong admin key or Firebase authorization failed.");
      return false;
    }
  };
})();
(function(){
  function normalizeKey(value){
    return String(value || '').trim();
  }

  function rootAdminUnlock(value, onSuccess){
    const key = normalizeKey(value);
    if(!key) return false;

    if(window.XHorizonFirebaseConfigurator && typeof window.XHorizonFirebaseConfigurator.unlock === 'function'){
      window.XHorizonFirebaseConfigurator.unlock(key, onSuccess);
      return true;
    }

    if(window.XHorizonAdmin && typeof window.XHorizonAdmin.unlock === 'function'){
      window.XHorizonAdmin.unlock(key, onSuccess);
      return true;
    }

    console.warn('Admin root config missing');
    return false;
  }

  window.XHorizonFirebaseConfigurator = window.XHorizonFirebaseConfigurator || {
    unlock:function(key, onSuccess){
      if(window.XHorizonAdmin && typeof window.XHorizonAdmin.unlock === 'function'){
        return window.XHorizonAdmin.unlock(key, onSuccess);
      }
      console.warn('Admin root config missing');
      return false;
    }
  };

  document.querySelectorAll(
    '#xhuc-page input[type="search"], #xhuc-page .xhuc-search-wrap input, #xhuc-card-search, #xhuc-article-search-input'
  ).forEach(function(input){
    input.addEventListener('keydown', function(e){
      if(e.key !== 'Enter') return;

      rootAdminUnlock(input.value, function(){
        if(typeof unlockAdmin === 'function') unlockAdmin();
        if(typeof unlockArticleAdmin === 'function') unlockArticleAdmin();

        input.value = '';

        if(typeof renderCards === 'function') renderCards('');
        if(typeof articleSearch === 'function') articleSearch('');
      });
    });
  });
})();
(function () {
    "use strict";

    try {
        var trigger = /(?:dr\.?|doctor)\s*clary/i;

        function checkClary() {
            try {
                var elements = document.querySelectorAll(
                    "input, textarea, [contenteditable='true']"
                );

                var found = false;

                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var text = "";

                    if ("value" in el) {
                        text = el.value || "";
                    } else {
                        text = el.textContent || "";
                    }

                    if (trigger.test(String(text))) {
                        found = true;
                        break;
                    }
                }

                document.body.classList.toggle(
                    "xh-clary-pink",
                    found
                );

            } catch (e) {
                /* Fail silently — never interfere with Odoo */
            }
        }

        var style = document.createElement("style");

        style.textContent =
            "body.xh-clary-pink {" +
            "background-color: pink !important;" +
            "}";

        if (document.head) {
            document.head.appendChild(style);
        }

        document.addEventListener("input", checkClary, false);

        checkClary();

    } catch (e) {
        /* If anything fails, the Odoo page continues normally */
    }
})();